export const BLOCKING_STATUSES = ['pending', 'confirmed'];
export const RELEASE_LOCK_STATUSES = ['rejected', 'cancelled', 'completed'];

export const assertDriverBookable = (driver) => {
  if (!driver || !driver.availability || driver.verificationStatus !== 'verified') throw new Error('Driver is inactive, unverified, or unavailable');
};

export const statusReleasesAvailability = (status) => RELEASE_LOCK_STATUSES.includes(status);

const transitions = {
  pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['cancelled', 'completed'],
  rejected: [],
  cancelled: [],
  completed: [],
};

export const assertTransitionAllowed = (currentStatus, nextStatus) => {
  if (!transitions[currentStatus]?.includes(nextStatus)) throw new Error(`Booking cannot move from ${currentStatus} to ${nextStatus}`);
};

export const assertBookingActor = ({ booking, actorRole, actorUserId, driverProfileId, action }) => {
  const ownsTravelerBooking = String(booking.user) === String(actorUserId);
  const ownsDriverBooking = String(booking.driver) === String(driverProfileId);
  if (actorRole === 'admin' && action === 'cancel') return;
  if (actorRole === 'traveler' && action === 'cancel' && ownsTravelerBooking) return;
  if (actorRole === 'driver' && ['confirm', 'reject', 'complete', 'view'].includes(action) && ownsDriverBooking) return;
  if (actorRole === 'traveler' && action === 'view' && ownsTravelerBooking) return;
  throw new Error('You are not authorized to manage this booking');
};

export const assertCompletionEligible = (booking, now = new Date()) => {
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  if (new Date(booking.endDate) > today) throw new Error('A trip can only be completed on or after its end date');
};
