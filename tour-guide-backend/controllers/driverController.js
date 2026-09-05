import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import { BLOCKING_STATUSES } from '../services/bookingRules.js';
import { validateDateRange } from '../utils/dateRange.js';
import Review from '../models/Review.js';

const list = (value) => typeof value === 'string' ? value.split(',').map((item) => item.trim()).filter(Boolean) : value || [];
const bool = (value, fallback = true) => value === undefined ? fallback : value === true || value === 'true';

const driverPayload = (body, image, defaults = {}) => ({
  fullName: body.fullName?.trim() || body.name?.trim(),
  name: body.fullName?.trim() || body.name?.trim(),
  phoneNumber: body.phoneNumber?.trim(),
  profileImage: image,
  image,
  bio: body.bio?.trim() || '',
  languages: list(body.languages),
  yearsOfExperience: Number(body.yearsOfExperience || 0),
  serviceAreas: list(body.serviceAreas),
  dailyRate: Number(body.dailyRate || 0),
  vehicleType: body.vehicleType?.trim(),
  vehicleModel: body.vehicleModel?.trim() || '',
  vehicleCapacity: Number(body.vehicleCapacity || 4),
  vehicleImage: body.vehicleImage?.trim() || '',
  availability: bool(body.availability, defaults.availability),
  verificationStatus: body.verificationStatus || defaults.verificationStatus,
});

export const addDriver = async (req, res) => {
  try {
    const payload = driverPayload(req.body, req.file?.filename, { availability: true, verificationStatus: 'verified' });
    if (!payload.fullName || !payload.phoneNumber || !payload.vehicleType || !payload.profileImage) return res.status(400).json({ message: 'Name, phone number, vehicle type and image are required' });
    const driver = await Driver.create(payload);
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error adding driver' });
  }
};

export const getDrivers = async (req, res) => {
  const { q, vehicleType, language, serviceArea, minCapacity, minPrice, maxPrice, minRating, startDate: startValue, endDate: endValue } = req.query;
  const filter = { availability: true, verificationStatus: 'verified' };
  if (q) filter.$or = [{ fullName: { $regex: q, $options: 'i' } }, { name: { $regex: q, $options: 'i' } }];
  if (vehicleType) filter.vehicleType = { $regex: vehicleType, $options: 'i' };
  if (language) filter.languages = { $regex: language, $options: 'i' };
  if (serviceArea) filter.serviceAreas = { $regex: serviceArea, $options: 'i' };
  if (minCapacity) filter.vehicleCapacity = { $gte: Number(minCapacity) };
  if (minRating) filter.averageRating = { $gte: Number(minRating) };
  if (minPrice || maxPrice) filter.dailyRate = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };
  try {
    if (startValue || endValue) {
      if (!startValue || !endValue) return res.status(400).json({ message: 'Both startDate and endDate are required' });
      let range;
      try { range = validateDateRange(startValue, endValue); }
      catch (error) { return res.status(400).json({ message: error.message }); }
      const bookedIds = await Booking.distinct('driver', {
        status: { $in: BLOCKING_STATUSES }, startDate: { $lte: range.endDate }, endDate: { $gte: range.startDate },
      });
      filter._id = { $nin: bookedIds };
    }
    const drivers = await Driver.find(filter).sort({ averageRating: -1, fullName: 1 });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching drivers' });
  }
};

export const getDriver = async (req, res) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id, availability: true, verificationStatus: 'verified' }).select('-user');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    const reviews = await Review.find({ driver: driver._id }).populate('traveler', 'name').sort({ createdAt: -1 });
    res.json({ driver, reviews });
  } catch (error) { res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.name === 'CastError' ? 'Invalid driver ID' : 'Error fetching driver' }); }
};

export const getAllDriversForAdmin = async (req, res) => {
  try { res.json(await Driver.find().populate('user', 'name email role').sort({ createdAt: -1 })); }
  catch (error) { res.status(500).json({ message: 'Error fetching drivers' }); }
};

export const updateDriver = async (req, res) => {
  try {
    const current = await Driver.findById(req.params.id);
    if (!current) return res.status(404).json({ message: 'Driver not found' });
    const payload = driverPayload(req.body, req.file?.filename || current.profileImage || current.image, {
      availability: current.availability, verificationStatus: current.verificationStatus,
    });
    const driver = await Driver.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    res.json(driver);
  } catch (error) {
    res.status(error.name === 'CastError' ? 400 : 400).json({ message: error.name === 'CastError' ? 'Invalid driver ID' : error.message });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    if (await Booking.exists({ driver: req.params.id, status: { $in: BLOCKING_STATUSES } })) return res.status(409).json({ message: 'Resolve this driver’s active bookings before deletion' });
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver deleted' });
  } catch (error) {
    res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.name === 'CastError' ? 'Invalid driver ID' : 'Error deleting driver' });
  }
};
