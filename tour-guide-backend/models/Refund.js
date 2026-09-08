import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true, index: true }, booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  amount: { type: Number, required: true, min: 1 }, currency: { type: String, default: 'LKR' },
  status: { type: String, enum: ['requested','processing','completed','failed'], default: 'requested', index: true },
  idempotencyKey: { type: String, required: true, unique: true }, providerRefundId: String, reason: { type: String, trim: true, maxlength: 500 }, requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, completedAt: Date, failureReason: String,
}, { timestamps: true });
export default mongoose.model('Refund', schema);
