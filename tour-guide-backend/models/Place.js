import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  image: { type: String, required: true, trim: true },
  imagePublicId: { type: String, trim: true, default: '' },
  additionalImages: [{ type: String, trim: true }],
  location: { type: String, required: true, trim: true, maxlength: 150 },
  district: { type: String, trim: true, maxlength: 80, default: '' },
  province: { type: String, trim: true, maxlength: 80, default: '' },
  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 },
  shortDescription: { type: String, trim: true, maxlength: 240, default: '' },
  description: { type: String, trim: true, maxlength: 5000, default: '' },
  tags: [{ type: String, trim: true, lowercase: true }],
  categories: [{ type: String, trim: true, lowercase: true }],
  recommendedDuration: { type: Number, min: 1, max: 14, default: 1 },
  bestTimeToVisit: { type: String, trim: true, maxlength: 150, default: 'Year-round' },
  activities: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

placeSchema.index({ name: 'text', location: 'text', district: 'text', tags: 'text', categories: 'text' });

export default mongoose.model('Place', placeSchema);
