import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
  driverSubtotal: { type: Number, required: true, min: 0 }, platformCommissionRateBps: { type: Number, required: true },
  platformCommissionAmount: { type: Number, required: true, min: 0 }, gatewayFee: { type: Number, min: 0 },
  driverPayableAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending','approved','paid','failed','cancelled'], default: 'pending', index: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, approvedAt: Date, paidAt: Date, bankReference: { type: String, trim: true, maxlength: 120 }, notes: { type: String, trim: true, maxlength: 500 },
  financialDiscrepancy: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model('Payout', schema);
