import express from 'express';

import { addDriver, deleteDriver, getAllDriversForAdmin, getDriver, getDrivers, updateDriver } from '../controllers/driverController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Route to add a new driver and get all drivers
router.post('/add', protect, adminOnly, upload.single('image'), addDriver);
router.get('/', getDrivers);
router.get('/admin/all', protect, adminOnly, getAllDriversForAdmin);
router.get('/:id', getDriver);
router.put('/:id', protect, adminOnly, upload.single('image'), updateDriver);
router.delete('/:id', protect, adminOnly, deleteDriver);

export default router;
