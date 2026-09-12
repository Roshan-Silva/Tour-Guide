import Booking from '../models/Booking.js';
import { assertBookingActor } from '../services/bookingRules.js';
import { createBooking, transitionBooking } from '../services/bookingService.js';
import User from '../models/User.js';
import TripPlan from '../models/TripPlan.js';
import Review from '../models/Review.js';
import { autoCompleteEligibleBookings, completeBookingAndGenerateCommission } from '../services/commissionService.js';

const bookingError = (res, error, fallback = 'Booking request failed') => {
  const knownConflict = error.message.includes('unavailable');
  const knownValidation = error.name === 'CastError' || /required|date|Party size|maximum|cannot exceed|cannot move|cannot be cancelled/i.test(error.message);
  return res.status(knownConflict ? 409 : knownValidation ? 400 : 500).json({ message: knownConflict || knownValidation ? error.message : fallback });
};

export const addBooking = async (req, res) => {
  try {
    const traveler = await User.findById(req.user).select('name');
    if (!traveler) return res.status(401).json({ message: 'Traveler account not found' });
    if (req.body.itineraryId && !await TripPlan.exists({ _id: req.body.itineraryId, user: req.user })) return res.status(403).json({ message: 'You cannot book with another traveler’s itinerary' });
    const booking = await createBooking({ ...req.body, customerName: traveler.name, userId: req.user });
    res.status(201).json(booking);
  } catch (error) {
    bookingError(res, error, 'Error creating booking');
  }
};

export const getMyBookings = async (req, res) => {
  try {
    await autoCompleteEligibleBookings();
    const bookings = await Booking.find({ user: req.user })
      .populate('driver', 'fullName name phoneNumber vehicleType vehicleModel profileImage image dailyRate')
      .sort({ startDate: 1 });
    const reviews = await Review.find({ booking: { $in: bookings.map((booking) => booking._id) }, traveler: req.user });
    const byBooking = new Map(reviews.map((review) => [String(review.booking), review]));
    res.status(200).json(bookings.map((booking) => ({ ...booking.toObject(), review: byBooking.get(String(booking._id)) || null })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};
export const completeBooking = async(req,res,next)=>{try{const booking=await Booking.findById(req.params.id);if(!booking)return res.status(404).json({message:'Booking not found'});if(req.userRole!=='admin')assertBookingActor({booking,actorRole:'traveler',actorUserId:req.user,action:'view'});res.json(await completeBookingAndGenerateCommission({bookingId:booking._id,source:req.userRole==='admin'?'admin':'traveler',actor:req.user}))}catch(e){next(e)}};

export const getMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('driver', 'fullName name phoneNumber vehicleType vehicleModel profileImage image dailyRate');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    assertBookingActor({ booking, actorRole: 'traveler', actorUserId: req.user, action: 'view' });
    res.json(booking);
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid booking ID' });
    if (error.message.includes('not authorized')) return res.status(403).json({ message: error.message });
    res.status(500).json({ message: 'Error fetching booking' });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const updated = await transitionBooking({ booking, nextStatus: 'cancelled', actorRole: req.userRole, actorUserId: req.user });
    res.json({ message: 'Booking cancelled', booking: updated });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid booking ID' });
    if (error.message.includes('not authorized')) return res.status(403).json({ message: error.message });
    bookingError(res, error, 'Error cancelling booking');
  }
};
