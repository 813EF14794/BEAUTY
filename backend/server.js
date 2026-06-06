const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio'); // 🟢 Twilio imported
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Contact = require('./models/Contact');
const auth = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Beauty Parlour Backend Running Successfully');
});

// Connect Database
connectDB();

mongoose.connection.once('open', async () => {
    try {
        await mongoose.connection.db.collection('bookings').dropIndex('bookingId_1');
        console.log('✅ Old duplicate bookingId index dropped successfully!');
    } catch (err) {
        console.log('ℹ️ Index already dropped or not found, moving on...');
    }
});

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey123';

// Mock Services Data Endpoint
const servicesData = [
    { id: 1, title: 'Glamour Makeup', price: '$80', duration: '60 mins', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=500' },
    { id: 2, title: 'Luxury Spa Treatment', price: '$120', duration: '90 mins', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=500' },
    { id: 3, title: 'Trendy Haircut & Style', price: '$50', duration: '45 mins', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=500' },
    { id: 4, title: 'Deep Cleansing Facial', price: '$65', duration: '50 mins', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=500' },
    { id: 5, title: 'Royal Bridal Package', price: '$350', duration: '180 mins', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=500' }
];

// --- ROUTES ---

// Get Services List
app.get('/api/services', (req, res) => {
    res.json(servicesData);
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create protected Booking WITH WHATSAPP NOTIFICATION
app.post('/api/bookings', auth, async (req, res) => {
    const { name, email, service, date, time } = req.body;
    
    if (!name || !email || !service || !date || !time) {
        return res.status(400).json({ 
            message: 'All fields (name, email, service, date, time) are required!' 
        });
    }

    // try block-ku munnadiye let vachu define panna thaan catch block-la use panna mudiyum boss!
    let savedBooking = null;

    try {
        const newBooking = new Booking({
            userId: req.user.id,
            name,
            email,
            service,
            date, 
            time
        });
        
        savedBooking = await newBooking.save();

        // 🟢 WHATSAPP NOTIFICATION SETUP:
        const accountSid ='ACc90ef293f675c581956b22f1479ecb4e'; 
        const authToken ='fd14aca8bcae901a5e58ed3418f45655';   
        const client = twilio(accountSid, authToken);

        await client.messages.create({
            from: 'whatsapp:+14155238886', 
            to: 'whatsapp:+918148200355', 
            body: `🔔 *New Parlour Booking Alert!*\n\nHi Santhiya,\nWebsite-la pudhu booking vanthuruku boss!\n\n• *Name:* ${name}\n• *Service:* ${service}\n• *Date:* ${date}\n• *Time:* ${time}`
        });

        console.log('✅ WhatsApp alert sent to phone successfully!');
        return res.status(201).json({ message: 'Appointment booked successfully!', booking: savedBooking });

    } catch (err) {
        console.error("🔥 ACTUAL BOOKING OR WHATSAPP ERROR:", err); 
        
        // 🛡️ CRASH SAFETY SYSTEM: Twilio auth error aanaalum database-la data save aagirundha customer-ku safe-ah success respond pogum.
        if (savedBooking) {
            return res.status(201).json({ 
                message: 'Booking done, but alert failed', 
                booking: savedBooking, 
                error: err.message 
            });
        } else {
            return res.status(500).json({ 
                message: 'Database save failure error', 
                error: err.message 
            });
        }
    }
});

// Contact Route
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.status(201).json({ message: 'Message submitted successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error submitting contact query' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));