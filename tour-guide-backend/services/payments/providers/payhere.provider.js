import crypto from 'crypto';
import { fromMinorUnits, toMinorUnits } from '../money.js';

const md5 = (value) => crypto.createHash('md5').update(String(value)).digest('hex').toUpperCase();
const mode = () => process.env.PAYHERE_MODE || 'sandbox';
const checkoutUrl = () => mode() === 'live' ? 'https://www.payhere.lk/pay/checkout' : 'https://sandbox.payhere.lk/pay/checkout';
const apiBase = () => process.env.PAYHERE_API_BASE_URL || (mode() === 'live' ? 'https://www.payhere.lk/merchant/v1' : 'https://sandbox.payhere.lk/merchant/v1');

export const validatePayHereConfig = () => {
  if (!['sandbox','live'].includes(mode())) throw new Error('PAYHERE_MODE must be sandbox or live');
  const required = ['PAYHERE_MERCHANT_ID','PAYHERE_MERCHANT_SECRET','PAYHERE_RETURN_URL','PAYHERE_CANCEL_URL','PAYHERE_NOTIFY_URL',...(mode()==='live'?['PAYHERE_APP_ID','PAYHERE_APP_SECRET','PLATFORM_COMMISSION_RATE']:[])];
  const missing = required.filter((name)=>!process.env[name]);
  if (missing.length) throw new Error(`PayHere is not configured: ${missing.join(', ')}`);
  if (mode() === 'live' && [process.env.PAYHERE_RETURN_URL,process.env.PAYHERE_CANCEL_URL,process.env.PAYHERE_NOTIFY_URL].some((url)=>!url?.startsWith('https://'))) throw new Error('PayHere live URLs must use HTTPS');
};

export const createCheckout = ({ payment, booking, traveler }) => {
  validatePayHereConfig();
  const amount = fromMinorUnits(payment.travelerTotal).toFixed(2);
  const names = traveler.name.trim().split(/\s+/); const firstName = names.shift(); const lastName = names.join(' ') || '-';
  return { action: checkoutUrl(), fields: { merchant_id: process.env.PAYHERE_MERCHANT_ID, return_url: `${process.env.PAYHERE_RETURN_URL}?paymentId=${payment._id}`, cancel_url: `${process.env.PAYHERE_CANCEL_URL}?paymentId=${payment._id}`, notify_url: process.env.PAYHERE_NOTIFY_URL, order_id: payment.providerOrderId, items: `Ceylon Explorer booking ${booking._id}`, currency: payment.currency, amount, first_name: firstName, last_name: lastName, email: traveler.email, phone: process.env.PAYHERE_CUSTOMER_PHONE || '0000000000', address: process.env.PAYHERE_CUSTOMER_ADDRESS || 'Not provided', city: process.env.PAYHERE_CUSTOMER_CITY || 'Colombo', country: 'Sri Lanka', hash: md5(`${process.env.PAYHERE_MERCHANT_ID}${payment.providerOrderId}${amount}${payment.currency}${md5(process.env.PAYHERE_MERCHANT_SECRET)}`) } };
};

export const verifyNotification = (payload, payment) => {
  validatePayHereConfig();
  if (payload.merchant_id !== process.env.PAYHERE_MERCHANT_ID) throw new Error('Invalid merchant ID');
  if (payload.order_id !== payment.providerOrderId) throw new Error('Unknown payment order');
  const expected = md5(`${payload.merchant_id}${payload.order_id}${payload.payhere_amount}${payload.payhere_currency}${payload.status_code}${md5(process.env.PAYHERE_MERCHANT_SECRET)}`);
  if (!payload.md5sig || expected !== String(payload.md5sig).toUpperCase()) throw new Error('Invalid payment signature');
  if (payload.payhere_currency !== payment.currency) throw new Error('Payment currency mismatch');
  if (toMinorUnits(payload.payhere_amount) !== payment.travelerTotal) throw new Error('Payment amount mismatch');
  const status = ({ '2':'paid','0':'pending','-1':'cancelled','-2':'failed','-3':'chargeback' })[String(payload.status_code)];
  if (!status) throw new Error('Unknown provider status');
  return { status, providerPaymentId: payload.payment_id || undefined, providerStatusCode: String(payload.status_code), paymentMethod: payload.method || '' };
};

const accessToken = async () => {
  if (!process.env.PAYHERE_APP_ID || !process.env.PAYHERE_APP_SECRET) throw new Error('PayHere API credentials are not configured');
  const auth = Buffer.from(`${process.env.PAYHERE_APP_ID}:${process.env.PAYHERE_APP_SECRET}`).toString('base64');
  const response = await fetch(`${apiBase()}/oauth/token`, { method:'POST', headers:{ Authorization:`Basic ${auth}`,'Content-Type':'application/x-www-form-urlencoded' }, body:'grant_type=client_credentials' });
  if (!response.ok) throw new Error('PayHere authentication failed'); return (await response.json()).access_token;
};

export const refundPayment = async ({ providerPaymentId, amount, reason }) => {
  const token = await accessToken();
  const response = await fetch(`${apiBase()}/payment/refund`, { method:'POST', headers:{ Authorization:`Bearer ${token}`,'Content-Type':'application/json' }, body:JSON.stringify({ payment_id:providerPaymentId, amount:fromMinorUnits(amount).toFixed(2), description:reason }) });
  const data = await response.json(); if (!response.ok || data.status === -1) throw new Error(data.msg || 'PayHere refund failed'); return data;
};

export const retrievePayment = async (providerOrderId) => {
  const token = await accessToken();
  const response = await fetch(`${apiBase()}/payment/search?order_id=${encodeURIComponent(providerOrderId)}`, { headers:{ Authorization:`Bearer ${token}` } });
  if (!response.ok) throw new Error('PayHere retrieval unavailable'); return response.json();
};
