import Place from '../models/Place.js';
import TripPlan from '../models/TripPlan.js';
import { buildItinerary, normalizeInterests, validatePlannerInput } from '../services/tripPlannerService.js';

export const generatePlan = async (req, res) => {
  try {
    const input = validatePlannerInput(req.body);
    const interests = normalizeInterests(req.body.interests);
    const places = await Place.find({ isActive: { $ne: false } });
    const itinerary = buildItinerary({ places, ...input, interests, startingLocation: req.body.startingLocation.trim() });
    res.json({ ...input, ...itinerary, startDate: req.body.startDate, interests, startingLocation: req.body.startingLocation.trim(), preferredVehicle: req.body.preferredVehicle || '', budget: req.body.budget ? Number(req.body.budget) : null });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const savePlan = async (req, res) => {
  try {
    const input = validatePlannerInput(req.body);
    const interests = normalizeInterests(req.body.interests);
    const places = await Place.find({ isActive: { $ne: false } });
    const generated = buildItinerary({ places, ...input, interests, startingLocation: req.body.startingLocation.trim() });
    const plan = await TripPlan.create({
      user: req.user, title: req.body.title?.trim() || `Sri Lanka trip – ${input.numberOfDays} days`,
      startDate: input.startDate, endDate: generated.endDate, partySize: input.partySize, interests,
      startingLocation: req.body.startingLocation.trim(), preferredVehicle: req.body.preferredVehicle || '',
      budget: req.body.budget || undefined,
      days: generated.days,
    });
    res.status(201).json(plan);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const getMyPlans = async (req, res) => res.json(await TripPlan.find({ user: req.user }).populate('days.destination', 'name slug image location').sort({ createdAt: -1 }));
export const getMyPlan = async (req, res) => {
  try {
    const plan = await TripPlan.findOne({ _id: req.params.id, user: req.user }).populate('days.destination', 'name slug image location');
    if (!plan) return res.status(404).json({ message: 'Itinerary not found' });
    res.json(plan);
  } catch (error) { res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.name === 'CastError' ? 'Invalid itinerary ID' : 'Could not load itinerary' }); }
};

export const renameMyPlan = async (req, res) => {
  try {
    const title = req.body.title?.trim();
    if (!title || title.length > 120) return res.status(400).json({ message: 'Title must be between 1 and 120 characters' });
    const plan = await TripPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { title },
      { new: true, runValidators: true },
    ).populate('days.destination', 'name slug image location');
    if (!plan) return res.status(404).json({ message: 'Itinerary not found' });
    res.json(plan);
  } catch (error) { res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.name === 'CastError' ? 'Invalid itinerary ID' : 'Could not rename itinerary' }); }
};

export const deleteMyPlan = async (req, res) => {
  try {
    const plan = await TripPlan.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!plan) return res.status(404).json({ message: 'Itinerary not found' });
    res.json({ message: 'Itinerary deleted' });
  } catch (error) { res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.name === 'CastError' ? 'Invalid itinerary ID' : 'Could not delete itinerary' }); }
};
