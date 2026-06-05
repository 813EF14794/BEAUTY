const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    service: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
// models/Booking.js ஃபைலில் schema-விற்கு கீழே இதைச் சேர்க்கவும்:

// 🛠️ பழைய தேவையில்லாத இன்டெக்ஸ்களை டேட்டாபேஸில் இருந்து நீக்க இது உதவும்
BookingSchema.index({ bookingId: 1 }, { unique: false, sparse: true });

module.exports = mongoose.model('Booking', BookingSchema);
