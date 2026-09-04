import express from 'express';
import { registerDriver, registerUser, loginUser } from '../controllers/authController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);
router.post('/register-driver', upload.single('image'), registerDriver);

export default router;
