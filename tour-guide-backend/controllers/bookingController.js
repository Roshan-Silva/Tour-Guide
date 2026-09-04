import Booking from "../models/Booking.js";
import Driver from "../models/Driver.js";
import { normalizeTripDate } from '../utils/bookingDate.js';

export const addBooking = async (req, res) =>{
    const { customerName, tripDate, destination, driverId, partySize = 1, notes = '' } = req.body;

    try {
        if (!customerName?.trim() || !tripDate || !destination?.trim() || !driverId) {
            return res.status(400).json({ message: 'All booking fields are required' });
        }
        const parsedPartySize = Number(partySize);
        if (!Number.isInteger(parsedPartySize) || parsedPartySize < 1 || parsedPartySize > 20) {
            return res.status(400).json({ message: 'Party size must be between 1 and 20' });
        }
        if (notes.length > 500) {
            return res.status(400).json({ message: 'Notes cannot exceed 500 characters' });
        }

        let date;
        try {
            date = normalizeTripDate(tripDate);
        } catch (dateError) {
            return res.status(400).json({ message: dateError.message });
        }

        const driver = await Driver.findOne({ _id: driverId, availability: true });
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found or not available' });
        }

        const booking = new Booking({ 
            customerName: customerName.trim(),
            tripDate: date,
            destination: destination.trim(),
            driver: driverId,
            user: req.user,
            partySize: parsedPartySize,
            notes: notes.trim(),
        });
        await booking.save();
        
        res.status(201).json(booking);
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ message: 'This driver is already booked for that date' });
        }
        if (err?.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid driver ID' });
        }
        res.status(500).json({ message: 'Error adding booking', error: err.message });
    }
}

export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user })
            .populate('driver', 'name phoneNumber vehicleType image')
            .sort({ tripDate: 1 });
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching bookings', error: err.message });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, user: req.user, status: 'confirmed' },
            { status: 'cancelled' },
            { new: true },
        );
        if (!booking) {
            return res.status(404).json({ message: 'Active booking not found' });
        }
        res.status(200).json({ message: 'Booking cancelled', booking });
    } catch (err) {
        if (err?.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }
        res.status(500).json({ message: 'Error cancelling booking', error: err.message });
    }
};
