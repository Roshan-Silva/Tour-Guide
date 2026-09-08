import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import BookingLock from '../models/BookingLock.js';
import Driver from '../models/Driver.js';
import { calculatePrice, enumerateDates, validateDateRange } from '../utils/dateRange.js';
import { assertBookingActor, assertCompletionEligible, assertDriverBookable, assertTransitionAllowed, BLOCKING_STATUSES, statusReleasesAvailability } from './bookingRules.js';
import { calculateBookingMoney } from './payments/money.js';
import Payout from '../models/Payout.js';
import FinancialEvent from '../models/FinancialEvent.js';
import Payment from '../models/Payment.js';

export const findConflictingBooking = ({ driverId, startDate, endDate, excludeBookingId, session }) => {
  const filter = { driver: driverId, status: { $in: BLOCKING_STATUSES }, startDate: { $lte: endDate }, endDate: { $gte: startDate } };
  if (excludeBookingId) filter._id = { $ne: excludeBookingId };
  const query = Booking.findOne(filter);
  return session ? query.session(session) : query;
};

export const createBooking = async ({ userId, customerName, driverId, destination, startDate: startValue, endDate: endValue, partySize = 1, notes = '', itineraryId }) => {
  const { startDate, endDate, numberOfDays } = validateDateRange(startValue, endValue);
  const travelers = Number(partySize);
  if (!Number.isInteger(travelers) || travelers < 1 || travelers > 20) throw new Error('Party size must be between 1 and 20');
  if (!destination?.trim()) throw new Error('Destination is required');
  if (notes.length > 500) throw new Error('Notes cannot exceed 500 characters');
  const session = await mongoose.startSession();
  let createdBooking;
  try {
    await session.withTransaction(async () => {
      const driver = await Driver.findOne({ _id: driverId, availability: true, verificationStatus: 'verified' }).session(session);
      assertDriverBookable(driver);
      if (travelers > driver.vehicleCapacity) throw new Error(`This vehicle supports a maximum of ${driver.vehicleCapacity} travelers`);
      const conflict = await findConflictingBooking({ driverId, startDate, endDate, session });
      if (conflict) throw new Error('Driver is unavailable for the selected dates');
      const dailyRateAtBooking = Number(driver.dailyRate || 0);
      const estimatedTotal = calculatePrice(dailyRateAtBooking, numberOfDays);
      const money = calculateBookingMoney({ dailyRate: dailyRateAtBooking, numberOfDays });
      [createdBooking] = await Booking.create([{
        customerName: customerName.trim(), user: userId, driver: driverId, destination: destination.trim(),
        startDate, endDate, partySize: travelers, notes: notes.trim(), status: 'pending',
        dailyRateAtBooking, numberOfDays, estimatedTotal, itinerary: itineraryId || null,
        currency: money.currency, driverDailyRateAtBooking: money.driverDailyRate, driverSubtotal: money.driverSubtotal,
        platformCommissionRateBps: money.platformCommissionRateBps, platformCommissionAmount: money.platformCommissionAmount, travelerTotal: money.travelerTotal, paymentStatus: 'unpaid',
      }], { session });
      await BookingLock.insertMany(enumerateDates(startDate, endDate).map((date) => ({ driver: driverId, date, booking: createdBooking._id })), { session });
    });
    return createdBooking;
  } catch (error) {
    if (error?.code === 11000) throw new Error('Driver is unavailable for the selected dates');
    throw error;
  } finally {
    await session.endSession();
  }
};

export const transitionBooking = async ({ booking, nextStatus, actorRole, actorUserId, driverProfileId, now = new Date() }) => {
  const action = nextStatus === 'accepted' ? 'accept' : nextStatus === 'rejected' ? 'reject' : nextStatus === 'completed' ? 'complete' : nextStatus;
  assertBookingActor({ booking, actorRole, actorUserId, driverProfileId, action });
  assertTransitionAllowed(booking.status, nextStatus);
  if (nextStatus === 'completed') assertCompletionEligible(booking, now);
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      result = await Booking.findOneAndUpdate(
        { _id: booking._id, status: booking.status },
        { status: nextStatus, ...(nextStatus === 'accepted' ? { acceptedAt: now, paymentDueAt: new Date(now.getTime() + Number(process.env.PAYMENT_WINDOW_HOURS || 24) * 3600000) } : {}) },
        { new: true, session },
      );
      if (!result) throw new Error('Booking status changed; refresh and try again');
      if (statusReleasesAvailability(nextStatus)) await BookingLock.deleteMany({ booking: booking._id }).session(session);
      if (['cancelled','expired'].includes(nextStatus)) await Payment.updateMany({ booking:booking._id,status:{$in:['unpaid','pending']} },{$set:{status:'cancelled',isActiveAttempt:false}},{session});
      if (nextStatus === 'completed') { const payout=await Payout.findOneAndUpdate({ booking: booking._id }, { $setOnInsert: { booking: booking._id, driver: booking.driver, driverSubtotal: booking.driverSubtotal, platformCommissionRateBps: booking.platformCommissionRateBps, platformCommissionAmount: booking.platformCommissionAmount, driverPayableAmount: booking.driverSubtotal, status: 'pending' } }, { upsert: true, new:true, session });await FinancialEvent.updateOne({eventType:'payout_created',entityId:payout._id},{$setOnInsert:{eventType:'payout_created',entityType:'payout',entityId:payout._id,booking:booking._id}},{upsert:true,session}); }
    });
    return result;
  } finally {
    await session.endSession();
  }
};
