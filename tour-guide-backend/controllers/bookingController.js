import Booking from "../models/Booking.js";
import Driver from "../models/Driver.js";

export const addBooking = async (req, res) =>{
    const { customerName, tripDate, destination, driverId } = req.body;

    // Validate driver exists
    const driver = await Driver.findById(driverId);
    if(!driver || !driver.availability) {
        return res.status(404).json({ message: 'Driver not found or not available' });
    }

    try {
        const booking = new Booking({ 
            customerName, 
            tripDate, 
            destination, 
            driver: driverId
        });
        await booking.save();

        // Update driver's availability
        driver.availability = false; // Mark driver as unavailable after booking
        await driver.save();
        
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Error adding booking', error: err.message });
    }
}