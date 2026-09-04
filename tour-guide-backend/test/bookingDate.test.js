import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTripDate } from '../utils/bookingDate.js';

const now = new Date('2026-09-03T12:00:00.000Z');

test('normalizes a valid future date to midnight UTC', () => {
  assert.equal(normalizeTripDate('2026-09-20', now).toISOString(), '2026-09-20T00:00:00.000Z');
});

test('rejects impossible dates', () => {
  assert.throws(() => normalizeTripDate('2026-02-30', now), /valid trip date/);
});

test('rejects dates in the past', () => {
  assert.throws(() => normalizeTripDate('2026-09-02', now), /cannot be in the past/);
});
