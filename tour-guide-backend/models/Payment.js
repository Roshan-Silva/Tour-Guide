import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  traveler: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
  provider: { type: String, enum: ['payhere'], default: 'payhere' },
  providerOrderId: { type: String, required: true, unique: true, index: true },
  providerPaymentId: { type: String, sparse: true, unique: true },
  currency: { type: String, enum: ['LKR'], default: 'LKR' },
  driverSubtotal: { type: Number, required: true, min: 0 },
  platformCommissionRateBps: { type: Number, required: true, min: 0, max: 10000 },
  platformCommissionAmount: { type: Number, required: true, min: 0 }, travelerTotal: { type: Number, required: true, min: 0 },
  gatewayGrossAmount: { type: Number, min: 0 }, gatewayFee: { type: Number, min: 0 }, gatewayNetAmount: { type: Number, min: 0 },
  status: { type: String, enum: ['unpaid','pending','paid','failed','cancelled','partially_refunded','refunded','chargeback'], default: 'unpaid', index: true },
  isActiveAttempt: { type: Boolean, default: true },
  providerStatusCode: String, paymentMethod: String,
  reconciliationStatus: { type: String, enum: ['not_checked','matched','mismatch','provider_unavailable'], default: 'not_checked' }, reconciliationNotes: String,
  paidAt: Date, failedAt: Date, refundedAt: Date,
  processedNotifications: [{ key: String, receivedAt: Date }],
}, { timestamps: true });
schema.index({ booking: 1, status: 1 });
schema.index({ booking:1,isActiveAttempt:1 },{unique:true,partialFilterExpression:{isActiveAttempt:true}});
schema.pre('save',function(){this.isActiveAttempt=['unpaid','pending'].includes(this.status)});
export default mongoose.model('Payment', schema);
