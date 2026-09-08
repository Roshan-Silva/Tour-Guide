import crypto from 'crypto';
import mongoose from 'mongoose';
import Booking from '../../models/Booking.js';
import BookingLock from '../../models/BookingLock.js';
import FinancialEvent from '../../models/FinancialEvent.js';
import Payment from '../../models/Payment.js';
import Payout from '../../models/Payout.js';
import { assertCheckoutAllowed } from './financialRules.js';
import { createCheckout, retrievePayment, verifyNotification } from './providers/payhere.provider.js';

const event = (eventType, payment, metadata = {}, session) => FinancialEvent.create([{ eventType, entityType:'payment', entityId:payment._id, booking:payment.booking, metadata }], { session });

export const expireBookingIfDue = async (booking, now = new Date()) => {
  if (booking.status !== 'accepted' || !booking.paymentDueAt || booking.paymentDueAt > now) return false;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async()=>{
      const result=await Booking.updateOne({_id:booking._id,status:'accepted',paymentDueAt:{$lte:now}},{$set:{status:'expired'}},{session});
      if (!result.modifiedCount) return;
      await BookingLock.deleteMany({booking:booking._id}).session(session);
      await Payment.updateMany({booking:booking._id,status:{$in:['unpaid','pending']}},{$set:{status:'cancelled',isActiveAttempt:false}},{session});
    });
    booking.status='expired'; return true;
  } finally { await session.endSession(); }
};

export const expireDueBookings = async (filter = {}) => {
  const due = await Booking.find({...filter,status:'accepted',paymentDueAt:{$lte:new Date()}});
  for (const booking of due) await expireBookingIfDue(booking);
  return due.length;
};

export const initiateCheckout = async ({bookingId,travelerId}) => {
  const booking=await Booking.findOne({_id:bookingId,user:travelerId}).populate('user','name email');
  if(!booking)throw Object.assign(new Error('Booking not found'),{status:404});
  await expireBookingIfDue(booking); assertCheckoutAllowed({booking,travelerId});
  let payment=await Payment.findOne({booking:booking._id,status:{$in:['unpaid','pending']}}).sort({createdAt:-1});
  if(!payment){payment=await Payment.create({booking:booking._id,traveler:booking.user._id,driver:booking.driver,providerOrderId:`CE-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,currency:booking.currency,driverSubtotal:booking.driverSubtotal,platformCommissionRateBps:booking.platformCommissionRateBps,platformCommissionAmount:booking.platformCommissionAmount,travelerTotal:booking.travelerTotal,status:'unpaid'});await event('payment_attempt_created',payment)}
  const checkout=createCheckout({payment,booking,traveler:booking.user});
  payment.status='pending';await payment.save();await Booking.updateOne({_id:booking._id,status:'accepted'},{$set:{paymentStatus:'pending'}});await event('checkout_started',payment);
  return {payment:safePayment(payment),checkout};
};

export const processNotification = async (payload) => {
  const payment=await Payment.findOne({providerOrderId:payload.order_id});
  if(!payment)throw Object.assign(new Error('Unknown payment order'),{status:404});
  const verified=verifyNotification(payload,payment);
  const notificationKey=crypto.createHash('sha256').update(`${payload.order_id}|${payload.payment_id||''}|${payload.status_code}|${payload.md5sig}`).digest('hex');
  if(payment.processedNotifications.some((item)=>item.key===notificationKey))return payment;
  const booking=await Booking.findById(payment.booking);if(!booking)throw new Error('Payment booking not found');
  await expireBookingIfDue(booking);if(booking.status==='expired')throw Object.assign(new Error('Payment deadline has expired'),{status:409});
  const session=await mongoose.startSession();
  try {
    await session.withTransaction(async()=>{
      const fresh=await Payment.findById(payment._id).session(session);
      if(fresh.processedNotifications.some((item)=>item.key===notificationKey))return;
      fresh.processedNotifications.push({key:notificationKey,receivedAt:new Date()});
      fresh.providerStatusCode=verified.providerStatusCode;fresh.paymentMethod=verified.paymentMethod;
      if(verified.providerPaymentId)fresh.providerPaymentId=verified.providerPaymentId;
      await event('payment_callback_received',fresh,{statusCode:verified.providerStatusCode},session);
      if(verified.status==='paid'&&fresh.status!=='paid'){
        const confirmation=await Booking.updateOne({_id:fresh.booking,status:'accepted'},{$set:{status:'confirmed',paymentStatus:'paid'}},{session});
        if(!confirmation.modifiedCount)throw Object.assign(new Error('Booking is no longer payable'),{status:409});
        fresh.status='paid';fresh.paidAt=new Date();fresh.gatewayGrossAmount=fresh.travelerTotal;
        await event('payment_verified',fresh,{},session);await event('booking_confirmed_from_payment',fresh,{},session);
      }else if(verified.status==='chargeback'){
        fresh.status='chargeback';await Booking.updateOne({_id:fresh.booking},{$set:{paymentStatus:'chargeback'}},{session});await Payout.updateMany({booking:fresh.booking,status:'paid'},{$set:{financialDiscrepancy:true}},{session});await event('payment_chargeback',fresh,{requiresManualReview:true},session);
      }else if(fresh.status!=='paid'){
        fresh.status=verified.status;if(verified.status==='failed')fresh.failedAt=new Date();await Booking.updateOne({_id:fresh.booking},{$set:{paymentStatus:verified.status}},{session});await event(`payment_${verified.status}`,fresh,{},session);
      }
      await fresh.save({session});
    });
    return Payment.findById(payment._id);
  } finally { await session.endSession(); }
};

export const reconcile = async (payment) => {
  try{const data=await retrievePayment(payment.providerOrderId);const candidate=data.data?.[0]||data.data||data;const amount=Number(candidate.amount);const mismatch=String(candidate.currency||payment.currency)!==payment.currency||Math.round(amount*100)!==payment.travelerTotal||String(candidate.order_id||payment.providerOrderId)!==payment.providerOrderId;payment.reconciliationStatus=mismatch?'mismatch':'matched';payment.reconciliationNotes=mismatch?'Provider data differs from the stored payment snapshot':'';if(candidate.amount!==undefined)payment.gatewayGrossAmount=Math.round(amount*100);if(candidate.fee!==undefined)payment.gatewayFee=Math.round(Number(candidate.fee)*100);if(candidate.net_amount!==undefined)payment.gatewayNetAmount=Math.round(Number(candidate.net_amount)*100);await payment.save();return payment}catch(error){payment.reconciliationStatus='provider_unavailable';payment.reconciliationNotes=error.message;await payment.save();return payment}
};
export const safePayment=(payment)=>{const value=payment.toObject?payment.toObject():payment;return {...value,netPlatformRevenue:(value.platformCommissionAmount||0)-(value.gatewayFee||0)}};
