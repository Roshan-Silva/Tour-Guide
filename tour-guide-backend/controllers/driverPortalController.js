import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import { assertBookingActor } from '../services/bookingRules.js';
import { transitionBooking } from '../services/bookingService.js';

const getOwnDriver = async (userId) => Driver.findOne({ user: userId });

export const getDriverProfile = async (req, res) => {
  try {
    const driver = await getOwnDriver(req.user);
    if (!driver) return res.status(404).json({ message: 'No driver profile is connected to this account' });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: 'Error loading driver profile' });
  }
};

export const updateDriverProfile = async (req, res) => {
  const allowed = ['fullName', 'phoneNumber', 'bio', 'languages', 'yearsOfExperience', 'serviceAreas', 'dailyRate', 'vehicleType', 'vehicleModel', 'vehicleCapacity', 'availability'];
  const changes = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  if (changes.fullName) changes.name = changes.fullName;
  if (typeof changes.languages === 'string') changes.languages = changes.languages.split(',').map((item) => item.trim()).filter(Boolean);
  if (typeof changes.serviceAreas === 'string') changes.serviceAreas = changes.serviceAreas.split(',').map((item) => item.trim()).filter(Boolean);
  if (req.file) { changes.profileImage = req.file.filename; changes.image = req.file.filename; }
  try {
    const driver = await Driver.findOneAndUpdate({ user: req.user }, changes, { new: true, runValidators: true });
    if (!driver) return res.status(404).json({ message: 'No driver profile is connected to this account' });
    res.json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Could not update driver profile' });
  }
};

export const getAssignedBookings = async (req, res) => {
  try {
    const driver = await getOwnDriver(req.user);
    if (!driver) return res.status(404).json({ message: 'No driver profile is connected to this account' });
    const filter = { driver: driver._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.upcoming === 'true') {
      const today = new Date(); today.setUTCHours(0, 0, 0, 0);
      filter.startDate = { $gte: today };
      filter.status = { $in: ['pending', 'confirmed'] };
    }
    const bookings = await Booking.find(filter).populate('user', 'name email').sort({ startDate: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error loading assigned bookings' });
  }
};

export const getAssignedBooking = async (req, res) => {
  try {
    const driver = await getOwnDriver(req.user);
    if (!driver) return res.status(404).json({ message: 'No driver profile is connected to this account' });
    const booking = await Booking.findById(req.params.id).populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    assertBookingActor({ booking, actorRole: 'driver', actorUserId: req.user, driverProfileId: driver._id, action: 'view' });
    res.json(booking);
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid booking ID' });
    if (error.message.includes('not authorized')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: 'Error loading booking' });
  }
};

const changeStatus = (nextStatus) => async (req, res) => {
  try {
    const driver = await getOwnDriver(req.user);
    if (!driver) return res.status(404).json({ message: 'No driver profile is connected to this account' });
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const updated = await transitionBooking({ booking, nextStatus, actorRole: 'driver', actorUserId: req.user, driverProfileId: driver._id });
    res.json({ message: `Booking ${nextStatus}`, booking: updated });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid booking ID' });
    if (error.message.includes('not authorized')) return res.status(403).json({ message: error.message });
    res.status(400).json({ message: error.message });
  }
};

export const acceptBooking = changeStatus('confirmed');
export const rejectBooking = changeStatus('rejected');
export const completeBooking = changeStatus('completed');
