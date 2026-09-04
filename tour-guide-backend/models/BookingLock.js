import mongoose from 'mongoose';

const bookingLockSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  date: { type: Date, required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
}, { timestamps: true });

bookingLockSchema.index({ driver: 1, date: 1 }, { unique: true });
bookingLockSchema.index({ booking: 1 });

export default mongoose.model('BookingLock', bookingLockSchema);
