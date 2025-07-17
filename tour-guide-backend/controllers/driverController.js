import Driver from '../models/Driver.js';

// Add a new driver
export const addDriver = async (req, res) => {
  const { name, phoneNumber, vehicleType, availability } = req.body;

  try {
    const driver = new Driver({ name, phoneNumber, vehicleType, availability });
    await driver.save();
    res.status(201).json(driver);
  } catch (err) {
    res.status(500).json({ message: 'Error adding driver', error: err.message });
  }
}

// Get all drivers
export const getDrivers = async (req, res) => {

    const { vehicleType } = req.query;

    let filter = {availability: true};
    if (vehicleType) {
        filter.vehicleType = vehicleType;
    }

  try {
    const drivers = await Driver.find(filter);
    res.status(200).json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching drivers', error: err.message });
  }
}