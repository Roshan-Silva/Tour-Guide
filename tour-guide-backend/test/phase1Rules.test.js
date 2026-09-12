import test from 'node:test';
import assert from 'node:assert/strict';
import { isRoleAuthorized } from '../middleware/authMiddleware.js';
import { assertBookingActor, assertCompletionEligible, assertDriverBookable, assertTransitionAllowed, BLOCKING_STATUSES, statusReleasesAvailability } from '../services/bookingRules.js';
import { calculatePrice, rangesOverlap, validateDateRange } from '../utils/dateRange.js';
import User from '../models/User.js';

const now = new Date('2026-10-01T12:00:00.000Z');
const booking = { _id: 'booking-1', user: 'traveler-1', driver: 'driver-1', status: 'pending', endDate: new Date('2026-10-15T00:00:00Z') };

test('user schema accepts the driver role', () => assert.equal(new User({ name: 'Driver', email: 'driver@example.com', password: 'hashed', role: 'driver' }).validateSync(), undefined));
test('traveler cannot access admin-only capability', () => assert.equal(isRoleAuthorized('traveler', ['admin']), false));
test('traveler cannot access driver-only capability', () => assert.equal(isRoleAuthorized('traveler', ['driver']), false));
test('driver cannot access another driver booking', () => assert.throws(() => assertBookingActor({ booking, actorRole: 'driver', actorUserId: 'user-2', driverProfileId: 'driver-2', action: 'view' }), /not authorized/));
test('traveler cannot access another traveler booking', () => assert.throws(() => assertBookingActor({ booking, actorRole: 'traveler', actorUserId: 'traveler-2', action: 'view' }), /not authorized/));
test('invalid date range is rejected', () => assert.throws(() => validateDateRange('2026-10-20', '2026-10-19', now), /on or after/));
test('past booking is rejected', () => assert.throws(() => validateDateRange('2026-09-30', '2026-10-02', now), /past/));
test('overlapping date range is detected', () => assert.equal(rangesOverlap(new Date('2026-10-10'), new Date('2026-10-15'), new Date('2026-10-13'), new Date('2026-10-18')), true));
test('non-overlapping date range is allowed', () => assert.equal(rangesOverlap(new Date('2026-10-10'), new Date('2026-10-15'), new Date('2026-10-16'), new Date('2026-10-20')), false));
test('inactive driver cannot be booked', () => assert.throws(() => assertDriverBookable({ availability: false, verificationStatus: 'verified' }), /inactive/));
test('booking total is calculated server-side from daily rate and inclusive days', () => { const range = validateDateRange('2026-10-10', '2026-10-14', now); assert.equal(range.numberOfDays, 5); assert.equal(calculatePrice(12000, range.numberOfDays), 60000); });
test('invalid status transition is rejected', () => assert.throws(() => assertTransitionAllowed('completed', 'pending'), /cannot move/));
test('driver acceptance confirms a pending booking immediately', () => { assert.doesNotThrow(() => assertBookingActor({ booking, actorRole: 'driver', actorUserId: 'driver-user', driverProfileId: 'driver-1', action: 'confirm' })); assert.doesNotThrow(() => assertTransitionAllowed('pending', 'confirmed')); });
test('driver can reject own pending booking', () => { assert.doesNotThrow(() => assertBookingActor({ booking, actorRole: 'driver', actorUserId: 'driver-user', driverProfileId: 'driver-1', action: 'reject' })); assert.doesNotThrow(() => assertTransitionAllowed('pending', 'rejected')); });
test('cancellation releases driver availability', () => assert.equal(statusReleasesAvailability('cancelled'), true));
test('completed trip is terminal and only eligible after end date', () => { const ended = { ...booking, status: 'confirmed', endDate: new Date('2026-09-30') }; assert.doesNotThrow(() => assertCompletionEligible(ended, now)); assert.doesNotThrow(() => assertTransitionAllowed('confirmed', 'completed')); assert.throws(() => assertTransitionAllowed('completed', 'confirmed'), /cannot move/); assert.equal(statusReleasesAvailability('completed'), true); });
test('pending and confirmed bookings block dates while completed bookings release them', () => { assert.deepEqual(BLOCKING_STATUSES, ['pending', 'confirmed']); assert.equal(statusReleasesAvailability('completed'), true); });
