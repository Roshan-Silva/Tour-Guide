import mongoose from 'mongoose';

const daySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true, min: 1 },
  date: { type: Date, required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
  destinationName: { type: String, required: true },
  activities: [{ type: String }],
  notes: { type: String, maxlength: 500, default: '' },
}, { _id: false });

const tripPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  partySize: { type: Number, required: true, min: 1, max: 20 },
  interests: [{ type: String, lowercase: true, trim: true }],
  startingLocation: { type: String, required: true, trim: true },
  preferredVehicle: { type: String, trim: true, default: '' },
  budget: { type: Number, min: 0 },
  days: { type: [daySchema], required: true },
}, { timestamps: true });

export default mongoose.model('TripPlan', tripPlanSchema);
