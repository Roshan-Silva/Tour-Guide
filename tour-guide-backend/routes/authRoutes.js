import express from 'express';
import { forgotPassword, getMe, loginUser, logoutUser, refreshSession, registerDriver, registerUser, resetPassword, updateMe } from '../controllers/authController.js';
import upload from '../middleware/upload.js';
import { authRegistrationRules, forgotRules, loginRules, profileRules, resetRules } from '../middleware/validate.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register route
router.post('/register', authRegistrationRules, registerUser);

// Login route
router.post('/login', loginRules, loginUser);
router.post('/register-driver', upload.single('image'), authRegistrationRules, registerDriver);
router.post('/refresh', refreshSession);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotRules, forgotPassword);
router.post('/reset-password/:token', resetRules, resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, profileRules, updateMe);

export default router;
