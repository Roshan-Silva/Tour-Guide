import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import Place from '../models/Place.js';
import User from '../models/User.js';
import { autoCompleteEligibleBookings, processOverdueCommissions } from '../services/commissionService.js';

export const getDashboard = async (req, res) => {
  try {
    await autoCompleteEligibleBookings();
    await processOverdueCommissions();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const [places, drivers, availableDrivers, users, bookings, activeBookings, upcoming] = await Promise.all([
      Place.countDocuments(),
      Driver.countDocuments(),
      Driver.countDocuments({ availability: true }),
      User.countDocuments({ role: 'traveler' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
      Booking.find({ status: { $in: ['pending', 'confirmed'] }, startDate: { $gte: today } })
        .populate('driver', 'fullName name vehicleType')
        .populate('user', 'name email')
        .sort({ startDate: 1 })
        .limit(6),
    ]);
    res.json({ counts: { places, drivers, availableDrivers, users, bookings, activeBookings }, upcoming });
  } catch (err) {
    res.status(500).json({ message: 'Error loading dashboard', error: err.message });
  }
};
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('driver', 'fullName name vehicleType')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error loading bookings', error: err.message });
  }
};
