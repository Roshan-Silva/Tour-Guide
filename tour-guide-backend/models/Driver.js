import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
    name: {
    type: String,
    required: true,
    },

    phoneNumber: {
    type: String,
    required: true,
    },

    vehicleType: {
    type: String, 
    required: true,
    },

    image:{
    type: String,
    required: true,
    },

    availability: {
    type: Boolean,
    default: true,
    },

});

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
