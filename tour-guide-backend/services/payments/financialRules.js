export const assertCheckoutAllowed = ({ booking, travelerId, now = new Date() }) => {
  if (!booking || String(booking.user?._id || booking.user) !== String(travelerId)) throw Object.assign(new Error('Booking not found'),{status:404});
  if (booking.status === 'expired') throw Object.assign(new Error('Payment deadline has expired'),{status:409});
  if (booking.status === 'accepted' && booking.paymentDueAt && booking.paymentDueAt <= now) throw Object.assign(new Error('Payment deadline has expired'),{status:409});
  if (booking.status !== 'accepted') throw Object.assign(new Error('Driver must accept the booking before payment'),{status:409});
  if (booking.paymentStatus === 'paid') throw Object.assign(new Error('Booking is already paid'),{status:409});
};
export const assertRefundAllowed = ({ payment, amount, alreadyRefunded = 0 }) => {
  if (!payment || !['paid','partially_refunded'].includes(payment.status)) throw Object.assign(new Error('Payment is not refundable'),{status:409});
  if (!Number.isInteger(amount) || amount < 1) throw new Error('Refund amount is invalid');
  if (amount + alreadyRefunded > payment.travelerTotal) throw new Error('Refund exceeds the paid amount');
};
export const assertPayoutTransition = (current,next) => { const allowed={pending:['approved','cancelled'],approved:['paid','failed'],failed:['approved'],paid:[],cancelled:[]};if(!allowed[current]?.includes(next))throw Object.assign(new Error(`Payout cannot move from ${current} to ${next}`),{status:409}); };
