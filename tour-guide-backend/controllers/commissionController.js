import Commission from '../models/Commission.js';
import Driver from '../models/Driver.js';
import { processOverdueCommissions, recordCommissionAudit, refreshDriverCommissionStanding } from '../services/commissionService.js';
import { assertAdminCommissionAction, assertCommissionSubmissionAllowed, commissionStatusAfterRejection } from '../services/commissionRules.js';

const populated = (query) => query.populate('booking', 'destination startDate endDate').populate('driver', 'fullName name commissionStanding').sort({ dueAt: -1 });

export const getMyCommissions = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user });
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });
    await processOverdueCommissions(driver._id);
    const current = await Driver.findById(driver._id);
    res.json({ standing: current.commissionStanding, bankTransferInstructions: { bankName: process.env.COMMISSION_BANK_NAME || '', accountName: process.env.COMMISSION_ACCOUNT_NAME || '', accountNumber: process.env.COMMISSION_ACCOUNT_NUMBER || '', branch: process.env.COMMISSION_BANK_BRANCH || '' }, commissions: await populated(Commission.find({ driver: driver._id })) });
  } catch (error) { next(error); }
};

export const getMyCommission = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user });
    const commission = await populated(Commission.findOne({ _id: req.params.id, driver: driver?._id }));
    if (!commission) return res.status(404).json({ message: 'Commission not found' });
    res.json(commission);
  } catch (error) { next(error); }
};

export const submitCommissionPayment = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user });
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });
    await processOverdueCommissions(driver._id);
    const commission = await Commission.findOne({ _id: req.params.id, driver: driver._id });
    if (!commission) return res.status(404).json({ message: 'Commission not found' });
    assertCommissionSubmissionAllowed(commission);
    const reference = req.body.paymentReference?.trim();
    if (!reference) return res.status(400).json({ message: 'Bank transfer reference is required' });
    commission.status = 'payment_submitted'; commission.paymentReference = reference;
    commission.driverNote = req.body.note?.trim() || ''; commission.submittedAt = new Date();
    await commission.save();
    await recordCommissionAudit('commission_payment_submitted', commission, {}, req.user);
    await refreshDriverCommissionStanding(driver._id);
    res.json(commission);
  } catch (error) { next(error); }
};

export const getAdminCommissions = async (req, res, next) => {
  try {
    await processOverdueCommissions();
    const filter = req.query.status ? { status: req.query.status } : {};
    res.json(await populated(Commission.find(filter)));
  } catch (error) { next(error); }
};

export const getAdminCommission = async (req, res, next) => {
  try { const commission = await populated(Commission.findById(req.params.id)); if (!commission) return res.status(404).json({ message: 'Commission not found' }); res.json(commission); }
  catch (error) { next(error); }
};

const adminAction = (action) => async (req, res, next) => {
  try {
    const commission = await Commission.findById(req.params.id);
    if (!commission) return res.status(404).json({ message: 'Commission not found' });
    const now = new Date(); const reason = req.body.reason?.trim();
    assertAdminCommissionAction(commission, action, { reason, resolution: req.body.resolution });
    if (action === 'approve') {
      commission.status = 'paid'; commission.paidAt = now;
    } else if (action === 'reject') {
      commission.status = commissionStatusAfterRejection(commission.dueAt, now);
      if (commission.status === 'overdue') commission.overdueAt = commission.overdueAt || now;
    } else if (action === 'waive') {
      commission.status = 'waived';
    } else if (action === 'dispute') {
      commission.status = 'disputed';
    } else if (action === 'resolve') {
      commission.status = req.body.resolution; if (commission.status === 'paid') commission.paidAt = now;
    }
    commission.adminNotes = reason || req.body.note?.trim() || commission.adminNotes;
    await commission.save();
    const eventType = action === 'approve' ? 'commission_paid' : action === 'reject' ? 'commission_payment_rejected' : action === 'resolve' ? 'commission_dispute_resolved' : `commission_${action}`;
    await recordCommissionAudit(eventType, commission, { reason, resolution: req.body.resolution }, req.user);
    await refreshDriverCommissionStanding(commission.driver);
    res.json(commission);
  } catch (error) { next(error); }
};

export const approveCommission = adminAction('approve');
export const rejectCommission = adminAction('reject');
export const waiveCommission = adminAction('waive');
export const disputeCommission = adminAction('dispute');
export const resolveCommission = adminAction('resolve');
