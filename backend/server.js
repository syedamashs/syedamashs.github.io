require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));
} else {
    console.warn('⚠️ MONGO_URI is missing in .env file. Database will not be connected. (Add connection string from MongoDB Atlas later)');
}

// Mongoose Schema
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// API Route for Form Submission
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Name, Email, and Message are required fields.' });
        }

        // Check if DB is connected
        if (mongoose.connection.readyState !== 1) {
             return res.status(503).json({ success: false, message: 'Database is not configured yet. (Missing Atlas URI)' });
        }

        // Save to DB
        const newContact = new Contact({ name, email, subject, message });
        await newContact.save();

        return res.status(201).json({ success: true, message: 'Your message has been sent successfully! I will get back to you soon.' });
    } catch (error) {
        console.error('Error in /api/contact:', error);
        return res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
