import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  traveler: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 1000, default: '' },
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
