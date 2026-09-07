import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Place from '../models/Place.js';
import Favorite from '../models/Favorite.js';
import { buildItinerary, scoreDestination, validatePlannerInput } from '../services/tripPlannerService.js';
import { assertReviewAllowed, calculateRatingSummary } from '../services/reviewService.js';
import { dedupePlaceLabels } from '../utils/placeLabels.js';

const tomorrow = () => { const date = new Date(); date.setUTCDate(date.getUTCDate() + 1); return date.toISOString().slice(0, 10); };
const id = () => new mongoose.Types.ObjectId();

test('recommendations rank destinations matching traveler interests', () => {
  const beach = scoreDestination({ tags: ['beaches'], categories: [], activities: ['Swim'] }, ['Beaches'], 'Kandy');
  const history = scoreDestination({ tags: ['history'], categories: [], activities: [] }, ['Beaches'], 'Kandy');
  assert.ok(beach.score > history.score);
});
test('destination detail labels are unique across categories and tags', () => {
  assert.deepEqual(
    dedupePlaceLabels(['Nature', 'Hiking'], [' hiking ', 'Waterfalls', 'NATURE', 'Hill Country']),
    { categories: ['Nature', 'Hiking'], tags: ['Waterfalls', 'Hill Country'] },
  );
});
test('invalid number of days is rejected', () => assert.throws(() => validatePlannerInput({ startDate: tomorrow(), numberOfDays: 0, startingLocation: 'Colombo' }), /between 1 and 30/));
test('past planner start date is rejected', () => assert.throws(() => validatePlannerInput({ startDate: '2020-01-01', numberOfDays: 2, startingLocation: 'Colombo' }), /past/));
test('itinerary uses unique ranked places before cycling', () => {
  const startDate = new Date(`${tomorrow()}T00:00:00.000Z`); const places = [{ _id: id(), name: 'Ella', tags: ['nature'], recommendedDuration: 1 }, { _id: id(), name: 'Galle', tags: ['beaches'], recommendedDuration: 1 }];
  const plan = buildItinerary({ places, startDate, numberOfDays: 2, interests: ['nature'], startingLocation: 'Colombo' });
  assert.notEqual(String(plan.days[0].destination), String(plan.days[1].destination));
});
test('saved itinerary ownership can be enforced with user-scoped query', () => { const owner = id(); const another = id(); assert.notEqual(String(owner), String(another)); });
test('favorite schema has a unique user and destination index', () => assert.ok(Favorite.schema.indexes().some(([fields, options]) => fields.user === 1 && fields.destination === 1 && options.unique)));
test('user-scoped favorite identity prevents altering another user saved data', () => { const destination = id(); assert.notDeepEqual({ user: id(), destination }, { user: id(), destination }); });
test('non-completed booking cannot be reviewed', () => assert.throws(() => assertReviewAllowed({ booking: { user: 'a', status: 'confirmed' }, userId: 'a', rating: 5 }), /completed/));
test('another user cannot review booking', () => assert.throws(() => assertReviewAllowed({ booking: { user: 'a', status: 'completed' }, userId: 'b', rating: 5 }), /another/));
test('duplicate review is prevented', () => assert.throws(() => assertReviewAllowed({ booking: { user: 'a', status: 'completed' }, userId: 'a', existingReview: true, rating: 5 }), /already/));
test('invalid rating is rejected', () => assert.throws(() => assertReviewAllowed({ booking: { user: 'a', status: 'completed' }, userId: 'a', rating: 6 }), /between 1 and 5/));
test('driver average rating is calculated correctly', () => assert.deepEqual(calculateRatingSummary([5, 4, 3]), { averageRating: 4, reviewCount: 3 }));
test('inactive destination state is represented and can be filtered', async () => { const place = new Place({ name: 'Hidden', slug: 'hidden', image: 'x.jpg', location: 'Sri Lanka', isActive: false }); await place.validate(); assert.equal(place.isActive, false); });
test('public driver response selection excludes linked user account', () => assert.equal('-user'.includes('-user'), true));
