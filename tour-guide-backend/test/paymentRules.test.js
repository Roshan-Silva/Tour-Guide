import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Refund from '../models/Refund.js';
import Payout from '../models/Payout.js';
import { calculateCommissionSnapshot, fromMinorUnits, toMinorUnits } from '../services/payments/money.js';

test('money conversion still uses integer LKR minor units',()=>{assert.equal(toMinorUnits(123.45),12345);assert.equal(fromMinorUnits(12345),123.45)});
test('commission is not added to traveler agreed price',()=>{const result=calculateCommissionSnapshot({dailyRate:10000,numberOfDays:3,commissionRateBps:200});assert.equal(result.agreedTourPrice,3000000);assert.equal(result.commissionAmount,60000)});
test('booking direct-payment arrangement defaults correctly',()=>assert.equal(new Booking().tourPaymentArrangement,'direct_to_driver'));
test('legacy accepted state remains readable but new default is pending',()=>{assert.ok(Booking.schema.path('status').enumValues.includes('accepted'));assert.equal(new Booking().status,'pending')});
test('legacy Payment model remains readable',()=>assert.equal(Payment.modelName,'Payment'));
test('legacy Refund model remains readable',()=>assert.equal(Refund.modelName,'Refund'));
test('legacy Payout model remains readable',()=>assert.equal(Payout.modelName,'Payout'));
test('traveler payment routes are not registered by the active server',()=>{const source=fs.readFileSync(new URL('../server.js',import.meta.url),'utf8');assert.doesNotMatch(source,/app\.use\(['"]\/api\/payments/)});
test('active booking controller does not query legacy Payment records',()=>{const source=fs.readFileSync(new URL('../controllers/bookingController.js',import.meta.url),'utf8');assert.doesNotMatch(source,/import Payment|Payment\.find/)});
test('active driver completion does not create a Payout',()=>{const source=fs.readFileSync(new URL('../controllers/driverPortalController.js',import.meta.url),'utf8');assert.doesNotMatch(source,/import Payout|Payout\.create/)});
