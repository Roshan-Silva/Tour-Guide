import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
    },
    tripDate: {
        type: Date,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    driver:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
    },
}, {
    timestamps: true,
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;