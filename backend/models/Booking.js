const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: String }, // 🟢 Intha line thaan munnadi thavari delete aayiruku boss!
    name: { type: String, required: true },
    email: { type: String, required: true },
    service: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Old duplicate index prachana varaama irukka intha safe index setup
BookingSchema.index({ bookingId: 1 }, { unique: false, sparse: true });

module.exports = mongoose.model('Booking', BookingSchema);