import 'dotenv/config';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Commission from '../models/Commission.js';
import Driver from '../models/Driver.js';
import Payment from '../models/Payment.js';
import Refund from '../models/Refund.js';
import Payout from '../models/Payout.js';
import { calculateCommissionSnapshot } from '../services/payments/money.js';
import { commissionDueAt, tourEndTimestamp } from '../services/commissionService.js';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
await mongoose.connect(process.env.MONGODB_URI);
let migrated=0; let created=0; let manual=0;
const bookings=await Booking.find();
for (const booking of bookings) {
  if (booking.agreedTourPrice==null || booking.commissionRateBps==null || booking.commissionAmount==null || booking.tourPaymentArrangement!=='direct_to_driver' || booking.travelerTotal!==booking.agreedTourPrice) {
    const money=calculateCommissionSnapshot({dailyRate:booking.dailyRateAtBooking,numberOfDays:booking.numberOfDays,commissionRateBps:booking.platformCommissionRateBps});
    booking.agreedTourPrice=booking.agreedTourPrice??booking.driverSubtotal??money.agreedTourPrice;
    booking.commissionRateBps=booking.commissionRateBps??booking.platformCommissionRateBps??money.commissionRateBps;
    booking.commissionAmount=booking.commissionAmount??booking.platformCommissionAmount??money.commissionAmount;
    booking.travelerTotal=booking.agreedTourPrice; booking.tourPaymentArrangement='direct_to_driver';
    await booking.save(); migrated++;
  }
  if (booking.status==='accepted') { manual++; continue; }
  if (booking.status==='completed' && !await Commission.exists({booking:booking._id})) {
    await Commission.create({booking:booking._id,driver:booking.driver,agreedTourPrice:booking.agreedTourPrice,commissionRateBps:booking.commissionRateBps,commissionAmount:booking.commissionAmount,currency:booking.currency||'LKR',status:'due',tourEndedAt:tourEndTimestamp(booking.endDate),dueAt:commissionDueAt(booking.endDate)});
    created++;
  }
}
const drivers=await Driver.updateMany({$or:[{nicFingerprint:{$exists:false}},{drivingLicenceFingerprint:{$exists:false}}]},{$set:{identityVerificationRequired:true,availability:false}});
console.log(JSON.stringify({bookingsInspected:bookings.length,bookingsMigrated:migrated,legacyPaymentsFound:await Payment.countDocuments(),legacyPayoutsFound:await Payout.countDocuments(),legacyRefundsFound:await Refund.countDocuments(),commissionsCreated:created,driversRequiringIdentityVerification:drivers.modifiedCount,recordsRequiringManualReview:manual},null,2));
await mongoose.disconnect();
