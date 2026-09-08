import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import Place from '../models/Place.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Payout from '../models/Payout.js';
import { expireDueBookings, safePayment } from '../services/payments/payment.service.js';

export const getDashboard = async (req, res) => {
  try {
    await expireDueBookings();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const [places, drivers, availableDrivers, users, bookings, activeBookings, upcoming] = await Promise.all([
      Place.countDocuments(),
      Driver.countDocuments(),
      Driver.countDocuments({ availability: true }),
      User.countDocuments({ role: 'traveler' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['pending', 'accepted', 'confirmed'] } }),
      Booking.find({ status: { $in: ['pending', 'accepted', 'confirmed'] }, startDate: { $gte: today } })
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
export const getPayments = async (req,res)=>{try{const filter=req.query.status?{status:req.query.status}:{};const rows=await Payment.find(filter).populate('booking','destination').populate('traveler','name email').populate('driver','fullName name').sort({createdAt:-1});res.json(rows.map(safePayment));}catch(error){res.status(500).json({message:'Error loading payments'})}};
export const getPayouts = async (_req,res)=>{try{res.json(await Payout.find().populate('booking','destination endDate').populate('driver','fullName name').populate('approvedBy','name').sort({createdAt:-1}));}catch(error){res.status(500).json({message:'Error loading payouts'})}};

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
