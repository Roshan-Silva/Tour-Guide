import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { assertReviewAllowed, refreshDriverRating } from '../services/reviewService.js';

export const createReview = async (req, res) => {
  try {
    const booking = await Booking.findById(req.body.bookingId);
    const existing = booking && await Review.exists({ booking: booking._id });
    assertReviewAllowed({ booking, userId: req.user, existingReview: existing, rating: req.body.rating });
    const review = await Review.create({ booking: booking._id, traveler: req.user, driver: booking.driver, rating: Number(req.body.rating), comment: req.body.comment?.trim() || '' });
    await refreshDriverRating(booking.driver); res.status(201).json(review);
  } catch (error) {
    const conflict = error.code === 11000 || error.message.includes('already');
    const forbidden = error.message.includes('another traveler');
    res.status(conflict ? 409 : forbidden ? 403 : 400).json({ message: conflict ? 'This booking already has a review' : error.message });
  }
};
export const updateReview = async (req, res) => {
  try {
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    const review = await Review.findOne({ _id: req.params.id, traveler: req.user });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.rating = rating; review.comment = req.body.comment?.trim() || ''; await review.save(); await refreshDriverRating(review.driver); res.json(review);
  } catch (error) { res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.name === 'CastError' ? 'Invalid review ID' : 'Could not update review' }); }
};
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, traveler: req.user });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await refreshDriverRating(review.driver); res.json({ message: 'Review deleted' });
  } catch (error) { res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.name === 'CastError' ? 'Invalid review ID' : 'Could not delete review' }); }
};
