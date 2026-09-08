import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import { assertBookingActor } from '../services/bookingRules.js';
import { transitionBooking } from '../services/bookingService.js';
import { deleteCloudAsset } from '../services/cloudinaryService.js';
import { expireDueBookings } from '../services/payments/payment.service.js';
import Payout from '../models/Payout.js';

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
  if (req.file) { changes.profileImage = req.file.path || req.file.filename; changes.image = changes.profileImage; changes.profileImagePublicId = req.file.public_id || ''; }
  try {
    const current = await Driver.findOne({ user: req.user });
    const driver = await Driver.findOneAndUpdate({ user: req.user }, changes, { new: true, runValidators: true });
    if (!driver) return res.status(404).json({ message: 'No driver profile is connected to this account' });
    if (req.file && current?.profileImagePublicId) await deleteCloudAsset(current.profileImagePublicId);
    res.json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Could not update driver profile' });
  }
};

export const updateVehicleImage = async (req, res) => {
  if (!req.file) return res.status(422).json({ success: false, message: 'Vehicle image is required', errors: [] });
  const current = await getOwnDriver(req.user); if (!current) return res.status(404).json({ message: 'No driver profile is connected to this account' });
  const driver = await Driver.findByIdAndUpdate(current._id, { vehicleImage: req.file.path || req.file.filename, vehicleImagePublicId: req.file.public_id || '' }, { new: true });
  await deleteCloudAsset(current.vehicleImagePublicId); res.json({ success: true, message: 'Vehicle image updated', data: driver, ...driver.toObject() });
};

export const getAssignedBookings = async (req, res) => {
  try {
    const driver = await getOwnDriver(req.user);
    if (!driver) return res.status(404).json({ message: 'No driver profile is connected to this account' });
    await expireDueBookings({ driver: driver._id });
    const filter = { driver: driver._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.upcoming === 'true') {
      const today = new Date(); today.setUTCHours(0, 0, 0, 0);
      filter.startDate = { $gte: today };
      filter.status = { $in: ['pending', 'accepted', 'confirmed'] };
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

export const acceptBooking = changeStatus('accepted');
export const rejectBooking = changeStatus('rejected');
export const completeBooking = changeStatus('completed');
export const getEarnings = async (req, res) => {
  try { const driver=await getOwnDriver(req.user);if(!driver)return res.status(404).json({message:'No driver profile is connected to this account'});res.json(await Payout.find({driver:driver._id}).populate('booking','destination endDate').sort({createdAt:-1})); }
  catch(error){res.status(500).json({message:'Could not load earnings'});}
};
