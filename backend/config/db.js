const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Fallback to local connection if process.env.MONGO_URI is not set
        const connURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/beauty_parlour';
        await mongoose.connect(connURI);
        console.log('MongoDB Connected Successfully');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;