import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
  fullName: { type: String, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  profileImage: { type: String, trim: true },
  profileImagePublicId: { type: String, trim: true, default: '' },
  bio: { type: String, trim: true, maxlength: 1000, default: '' },
  languages: [{ type: String, trim: true }],
  yearsOfExperience: { type: Number, min: 0, max: 60, default: 0 },
  serviceAreas: [{ type: String, trim: true }],
  dailyRate: { type: Number, min: 0, default: 0 },
  vehicleType: { type: String, required: true, trim: true },
  vehicleModel: { type: String, trim: true, default: '' },
  vehicleCapacity: { type: Number, min: 1, max: 50, default: 4 },
  vehicleImage: { type: String, trim: true, default: '' },
  vehicleImagePublicId: { type: String, trim: true, default: '' },
  availability: { type: Boolean, default: true },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  averageRating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, min: 0, default: 0 },

  // Retained temporarily so existing records remain readable until migration.
  name: { type: String, trim: true },
  image: { type: String, trim: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

driverSchema.pre('validate', function normalizeLegacyFields(next) {
  this.fullName = this.fullName || this.name;
  this.profileImage = this.profileImage || this.image;
  this.name = this.name || this.fullName;
  this.image = this.image || this.profileImage;
  if (!this.fullName) this.invalidate('fullName', 'Full name is required');
  if (!this.profileImage) this.invalidate('profileImage', 'Profile image is required');
  next();
});

driverSchema.index({ availability: 1, verificationStatus: 1 });

export default mongoose.model('Driver', driverSchema);
