import express from 'express';

import { addDriver, getDrivers } from '../controllers/driverController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Route to add a new driver and get all drivers
router.post('/add', protect, upload.single('image'), addDriver);
router.get('/', getDrivers);

export default router;