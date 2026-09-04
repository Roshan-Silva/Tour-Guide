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
    partySize: {
        type: Number,
        min: 1,
        max: 20,
        default: 1,
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500,
        default: '',
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed',
    },
    driver:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

bookingSchema.index(
    { driver: 1, tripDate: 1 },
    { unique: true, partialFilterExpression: { status: 'confirmed' } },
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
