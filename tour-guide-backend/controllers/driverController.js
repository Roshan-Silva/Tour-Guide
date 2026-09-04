import Driver from '../models/Driver.js';
import Booking from '../models/Booking.js';
import { normalizeTripDate } from '../utils/bookingDate.js';

// Add a new driver
export const addDriver = async (req, res) => {
  const { name, phoneNumber, vehicleType, availability } = req.body;
  const image = req.file ? req.file.filename : null; // Get uploaded image name

  try {
    if (!name?.trim() || !phoneNumber?.trim() || !vehicleType?.trim() || !image) {
      return res.status(400).json({ message: 'Name, phone number, vehicle type and image are required' });
    }
    const driver = new Driver({ name, phoneNumber, vehicleType, image, availability });
    await driver.save();
    res.status(201).json(driver);
  } catch (err) {
    res.status(500).json({ message: 'Error adding driver', error: err.message });
  }
}

// Get all drivers
export const getDrivers = async (req, res) => {

    const { vehicleType, tripDate } = req.query;

    let filter = {availability: true};
    if (vehicleType) {
        filter.vehicleType = vehicleType;
    }

  try {
    if (tripDate) {
      let date;
      try {
        date = normalizeTripDate(tripDate);
      } catch (dateError) {
        return res.status(400).json({ message: dateError.message });
      }
      const bookedDriverIds = await Booking.distinct('driver', { tripDate: date, status: 'confirmed' });
      filter._id = { $nin: bookedDriverIds };
    }
    const drivers = await Driver.find(filter);
    res.status(200).json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching drivers', error: err.message });
  }
}


export const getAllDriversForAdmin = async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.status(200).json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching drivers', error: err.message });
  }
};

export const updateDriver = async (req, res) => {
  const { name, phoneNumber, vehicleType, availability } = req.body;
  if (!name?.trim() || !phoneNumber?.trim() || !vehicleType?.trim()) {
    return res.status(400).json({ message: 'Name, phone number and vehicle type are required' });
  }
  try {
    const changes = {
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      vehicleType: vehicleType.trim(),
      availability: availability === true || availability === 'true',
    };
    if (req.file) changes.image = req.file.filename;
    const driver = await Driver.findByIdAndUpdate(req.params.id, changes, { new: true, runValidators: true });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.status(200).json(driver);
  } catch (err) {
    if (err?.name === 'CastError') return res.status(400).json({ message: 'Invalid driver ID' });
    res.status(500).json({ message: 'Error updating driver', error: err.message });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const activeBookings = await Booking.countDocuments({ driver: req.params.id, status: 'confirmed' });
    if (activeBookings > 0) {
      return res.status(409).json({ message: 'Cancel this driver’s active bookings before deletion' });
    }
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.status(200).json({ message: 'Driver deleted' });
  } catch (err) {
    if (err?.name === 'CastError') return res.status(400).json({ message: 'Invalid driver ID' });
    res.status(500).json({ message: 'Error deleting driver', error: err.message });
  }
};
