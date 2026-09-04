import 'dotenv/config';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import BookingLock from '../models/BookingLock.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import { enumerateDates } from '../utils/dateRange.js';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');

try {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.updateMany({ role: { $exists: false } }, { $set: { role: 'traveler' } });
  const legacyDrivers = await Driver.collection.find({ $or: [{ fullName: { $exists: false } }, { profileImage: { $exists: false } }] }).toArray();
  for (const driver of legacyDrivers) {
    await Driver.collection.updateOne({ _id: driver._id }, { $set: {
      fullName: driver.fullName || driver.name,
      profileImage: driver.profileImage || driver.image,
      bio: driver.bio || '', languages: driver.languages || [], yearsOfExperience: driver.yearsOfExperience || 0,
      serviceAreas: driver.serviceAreas || [], dailyRate: driver.dailyRate || 0, vehicleModel: driver.vehicleModel || '',
      vehicleCapacity: driver.vehicleCapacity || 4, vehicleImage: driver.vehicleImage || '',
      verificationStatus: driver.verificationStatus || 'verified', averageRating: driver.averageRating || 0, reviewCount: driver.reviewCount || 0,
    } });
  }

  const legacyBookings = await Booking.collection.find({ startDate: { $exists: false }, tripDate: { $exists: true } }).toArray();
  for (const booking of legacyBookings) {
    const driver = await Driver.findById(booking.driver).lean();
    const rate = Number(driver?.dailyRate || 0);
    await Booking.collection.updateOne({ _id: booking._id }, { $set: {
      startDate: booking.tripDate, endDate: booking.tripDate, numberOfDays: 1,
      dailyRateAtBooking: rate, estimatedTotal: rate, status: booking.status || 'cancelled',
    } });
  }

  try { await Booking.collection.dropIndex('driver_1_tripDate_1'); }
  catch (error) { if (!['IndexNotFound', 'NamespaceNotFound'].includes(error.codeName)) throw error; }
  await BookingLock.init();
  await BookingLock.deleteMany({});
  const blocking = await Booking.find({ status: { $in: ['pending', 'confirmed'] } });
  for (const booking of blocking) {
    await BookingLock.insertMany(enumerateDates(booking.startDate, booking.endDate).map((date) => ({ driver: booking.driver, date, booking: booking._id })));
  }
  await Promise.all([Driver.syncIndexes(), Booking.syncIndexes(), BookingLock.syncIndexes()]);
  console.log(`Phase 1 migration complete: ${legacyDrivers.length} drivers and ${legacyBookings.length} bookings upgraded.`);
} finally {
  await mongoose.disconnect();
}
