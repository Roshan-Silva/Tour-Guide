import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true },
  destination: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  partySize: { type: Number, min: 1, max: 20, default: 1 },
  notes: { type: String, trim: true, maxlength: 500, default: '' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'confirmed', 'rejected', 'cancelled', 'expired', 'completed'],
    default: 'pending',
    index: true,
  },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  itinerary: { type: mongoose.Schema.Types.ObjectId, ref: 'TripPlan', default: null },
  dailyRateAtBooking: { type: Number, required: true, min: 0 },
  numberOfDays: { type: Number, required: true, min: 1 },
  estimatedTotal: { type: Number, required: true, min: 0 },
  currency: { type: String, enum: ['LKR'], default: 'LKR' },
  driverDailyRateAtBooking: { type: Number, min: 0 }, driverSubtotal: { type: Number, min: 0 },
  platformCommissionRateBps: { type: Number, min: 0, max: 10000 }, platformCommissionAmount: { type: Number, min: 0 }, travelerTotal: { type: Number, min: 0 },
  paymentStatus: { type: String, enum: ['unpaid','pending','paid','failed','cancelled','partially_refunded','refunded','chargeback'], default: 'unpaid', index: true },
  acceptedAt: Date, paymentDueAt: { type: Date, index: true },
  // Legacy field retained only to support migration of existing records.
  tripDate: { type: Date },
}, { timestamps: true });

bookingSchema.index({ driver: 1, startDate: 1, endDate: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);
