import 'dotenv/config';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import { calculateBookingMoney } from '../services/payments/money.js';
if(!process.env.MONGODB_URI)throw new Error('MONGODB_URI is required');
await mongoose.connect(process.env.MONGODB_URI);
const bookings=await Booking.find({driverSubtotal:{$exists:false}});
for(const booking of bookings){const money=calculateBookingMoney({dailyRate:booking.dailyRateAtBooking,numberOfDays:booking.numberOfDays});Object.assign(booking,{currency:money.currency,driverDailyRateAtBooking:money.driverDailyRate,driverSubtotal:money.driverSubtotal,platformCommissionRateBps:money.platformCommissionRateBps,platformCommissionAmount:money.platformCommissionAmount,travelerTotal:money.travelerTotal,paymentStatus:['confirmed','completed'].includes(booking.status)?'paid':'unpaid'});await booking.save()}
console.log(`Migrated ${bookings.length} booking pricing snapshots`);
await mongoose.disconnect();
