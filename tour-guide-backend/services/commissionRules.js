export const determineCommissionStanding = (commissions) => {
  if (commissions.some((item) => item.status === 'overdue' || (item.status === 'payment_submitted' && item.overdueAt))) return 'restricted';
  if (commissions.some((item) => ['pending', 'due', 'payment_submitted'].includes(item.status))) return 'due';
  return 'clear';
};

export const assertCommissionSubmissionAllowed = (commission) => {
  if (!commission || !['due', 'overdue'].includes(commission.status)) throw Object.assign(new Error('This commission cannot accept a payment submission'), { status: 409 });
};

export const commissionStatusAfterRejection = (dueAt, now = new Date()) => new Date(dueAt) < now ? 'overdue' : 'due';

export const assertAdminCommissionAction = (commission, action, { reason, resolution } = {}) => {
  if (['approve', 'reject'].includes(action) && commission.status !== 'payment_submitted') throw Object.assign(new Error('Only submitted payments can be approved or rejected'), { status: 409 });
  if (['waive', 'dispute'].includes(action) && !reason?.trim()) throw Object.assign(new Error(`A ${action} reason is required`), { status: 400 });
  if (action === 'resolve' && (commission.status !== 'disputed' || !['due', 'waived', 'paid'].includes(resolution))) throw Object.assign(new Error('Resolution must be due, waived, or paid'), { status: 400 });
  if (action === 'resolve' && ['waived', 'paid'].includes(resolution) && !reason?.trim()) throw Object.assign(new Error('A resolution reason is required'), { status: 400 });
};

export const canGenerateCommission = (bookingStatus) => bookingStatus === 'confirmed';
