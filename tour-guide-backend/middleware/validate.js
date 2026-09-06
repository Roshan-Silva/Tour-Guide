import { body, param, query, validationResult } from 'express-validator';

export const handleValidation = (req, res, next) => {
  const result = validationResult(req); if (result.isEmpty()) return next();
  return res.status(422).json({ success: false, message: 'Please correct the highlighted fields', errors: result.array().map(({ path, msg, location }) => ({ field: path, message: msg, location })) });
};
const cleanText = (field, label, options = {}) => body(field).trim().notEmpty().withMessage(`${label} is required`).isLength(options).withMessage(`${label} has an invalid length`);
export const authRegistrationRules = [cleanText('name', 'Name', { min: 2, max: 80 }), body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(), body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be 8–128 characters'), handleValidation];
export const profileRules = [cleanText('name', 'Name', { min: 2, max: 80 }), handleValidation];
export const loginRules = [body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(), body('password').notEmpty().withMessage('Password is required'), handleValidation];
export const forgotRules = [body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(), handleValidation];
export const resetRules = [param('token').isHexadecimal().isLength({ min: 64, max: 64 }).withMessage('Invalid reset token'), body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be 8–128 characters'), handleValidation];
export const objectIdRule = (field, location = 'param') => (location === 'param' ? param(field) : body(field)).isMongoId().withMessage(`Invalid ${field}`);
export const idParamRules = [objectIdRule('id'), handleValidation];
export const reviewRules = [objectIdRule('bookingId', 'body'), body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'), body('comment').optional().trim().isLength({ max: 1000 }), handleValidation];
export const favoriteRules = [objectIdRule('destinationId'), handleValidation];
export const plannerRules = [body('startDate').isISO8601({ strict: true }).withMessage('Use a valid start date'), body('numberOfDays').isInt({ min: 1, max: 30 }), body('partySize').isInt({ min: 1, max: 20 }), body('startingLocation').trim().isLength({ min: 2, max: 120 }), body('interests').isArray({ min: 1, max: 12 }), body('budget').optional({ values: 'falsy' }).isFloat({ min: 0 }), handleValidation];
export const driverQueryRules = [query('startDate').optional().isISO8601({ strict: true }), query('endDate').optional().isISO8601({ strict: true }), query('minCapacity').optional().isInt({ min: 1, max: 20 }), query('minPrice').optional().isFloat({ min: 0 }), query('maxPrice').optional().isFloat({ min: 0 }), query('minRating').optional().isFloat({ min: 0, max: 5 }), handleValidation];
export const bookingRules = [objectIdRule('driverId', 'body'), body('destination').trim().isLength({ min: 2, max: 300 }), body('startDate').isISO8601({ strict: true }), body('endDate').isISO8601({ strict: true }), body('partySize').isInt({ min: 1, max: 20 }), body('notes').optional().trim().isLength({ max: 500 }), body('itineraryId').optional({ values: 'falsy' }).isMongoId(), handleValidation];
export const destinationRules = [body('name').trim().isLength({ min: 2, max: 100 }), body('location').trim().isLength({ min: 2, max: 150 }), body('recommendedDuration').optional().isInt({ min: 1, max: 14 }), body('latitude').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }), body('longitude').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 }), body('description').optional().trim().isLength({ max: 5000 }), handleValidation];
export const driverProfileRules = [body('name').optional().trim().isLength({ min: 2, max: 100 }), body('fullName').optional().trim().isLength({ min: 2, max: 100 }), body('phoneNumber').trim().isLength({ min: 7, max: 25 }), body('dailyRate').optional().isFloat({ min: 0 }), body('vehicleCapacity').optional().isInt({ min: 1, max: 20 }), handleValidation];
