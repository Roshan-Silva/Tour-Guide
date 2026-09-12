import test from 'node:test';
import assert from 'node:assert/strict';
import Driver from '../models/Driver.js';
import Commission from '../models/Commission.js';
import { calculateCommissionSnapshot } from '../services/payments/money.js';
import { commissionDueAt, tourEndTimestamp } from '../services/commissionService.js';
import { decryptIdentity, normalizeDrivingLicence, normalizeNic, protectDriverIdentity } from '../services/driverIdentityService.js';

test('direct-payment snapshot keeps tour price separate from 2% commission', () => {
  process.env.PLATFORM_COMMISSION_RATE = '0.02';
  assert.deepEqual(calculateCommissionSnapshot({ dailyRate: 10000, numberOfDays: 3 }), {
    currency: 'LKR', driverDailyRate: 1000000, agreedTourPrice: 3000000, commissionRateBps: 200, commissionAmount: 60000,
  });
});

test('commission snapshot is unaffected by later configuration changes', () => {
  process.env.PLATFORM_COMMISSION_RATE = '0.02';
  const snapshot = calculateCommissionSnapshot({ dailyRate: 100, numberOfDays: 1 });
  process.env.PLATFORM_COMMISSION_RATE = '0.05';
  assert.equal(snapshot.commissionRateBps, 200);
  assert.equal(snapshot.commissionAmount, 200);
});

test('Sri Lankan tour end and commission deadline are deterministic UTC timestamps', () => {
  process.env.COMMISSION_PAYMENT_WINDOW_HOURS = '24';
  assert.equal(tourEndTimestamp('2026-10-15').toISOString(), '2026-10-15T18:29:59.999Z');
  assert.equal(commissionDueAt('2026-10-15').toISOString(), '2026-10-16T18:29:59.999Z');
});

test('identity values normalize before fingerprinting and encrypt with AES-GCM', () => {
  process.env.DRIVER_IDENTITY_HMAC_KEY = 'test-hmac-key-that-is-definitely-long-enough';
  process.env.DRIVER_IDENTITY_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
  assert.equal(normalizeNic(' 90123-4567v '), '901234567V');
  assert.equal(normalizeDrivingLicence(' b 123-4567 '), 'B1234567');
  const first = protectDriverIdentity({ nic: '901234567v', drivingLicence: 'B-1234567' });
  const second = protectDriverIdentity({ nic: '901 234 567 V', drivingLicence: 'b1234567' });
  assert.equal(first.nicFingerprint, second.nicFingerprint);
  assert.equal(first.drivingLicenceFingerprint, second.drivingLicenceFingerprint);
  assert.notEqual(first.nicEncrypted, second.nicEncrypted);
  assert.equal(decryptIdentity(first.nicEncrypted), '901234567V');
});

test('sensitive identity fields are hidden by default and uniquely indexed', () => {
  for (const field of ['nicFingerprint','nicEncrypted','nicLast4','drivingLicenceFingerprint','drivingLicenceEncrypted','drivingLicenceLast4']) assert.equal(Driver.schema.path(field).options.select, false);
  const unique = Driver.schema.indexes().filter(([, options]) => options.unique).map(([fields]) => Object.keys(fields)[0]);
  assert.ok(unique.includes('nicFingerprint'));
  assert.ok(unique.includes('drivingLicenceFingerprint'));
});

test('one commission is allowed per booking and driver cannot set paid through schema defaults', () => {
  const bookingIndex = Commission.schema.indexes().find(([fields]) => fields.booking === 1);
  assert.equal(bookingIndex?.[1]?.unique, true);
  assert.ok(Commission.schema.path('status').enumValues.includes('payment_submitted'));
  assert.ok(Commission.schema.path('status').enumValues.includes('paid'));
});
