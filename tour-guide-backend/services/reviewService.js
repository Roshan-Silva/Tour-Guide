import Driver from '../models/Driver.js';
import Review from '../models/Review.js';

export const assertReviewAllowed = ({ booking, userId, existingReview, rating }) => {
  if (!booking) throw new Error('Booking not found');
  if (String(booking.user) !== String(userId)) throw new Error('You cannot review another traveler’s booking');
  if (booking.status !== 'completed') throw new Error('Only completed bookings can be reviewed');
  if (existingReview) throw new Error('This booking already has a review');
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) throw new Error('Rating must be an integer between 1 and 5');
};

export const calculateRatingSummary = (ratings) => ({
  reviewCount: ratings.length,
  averageRating: ratings.length ? Number((ratings.reduce((sum, value) => sum + Number(value), 0) / ratings.length).toFixed(2)) : 0,
});

export const refreshDriverRating = async (driverId, session) => {
  const query = Review.find({ driver: driverId }).select('rating');
  if (session) query.session(session);
  const reviews = await query;
  return Driver.findByIdAndUpdate(driverId, calculateRatingSummary(reviews.map((item) => item.rating)), { new: true, session });
};
