import express from 'express';

import { addDriver, getDrivers } from '../controllers/driverController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to add a new driver and get all drivers
router.post('/add', protect, addDriver);
router.get('/', getDrivers);

export default router;