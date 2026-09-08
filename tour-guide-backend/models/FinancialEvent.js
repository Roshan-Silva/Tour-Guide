import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  eventType: { type: String, required: true, index: true },
  entityType: { type: String, required: true }, entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
export default mongoose.model('FinancialEvent', schema);
