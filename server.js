// server.js

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const Contact    = require('./models/Contact');

const app  = express();
const PORT = 3000;

// ─── MIDDLEWARE ───
app.use(cors());
app.use(express.json());
app.use(express.static('public'));   // serves index.html from /public

// ─── CONNECT TO MONGODB (local) ───
mongoose.connect('mongodb://127.0.0.1:27017/portfolio')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ─── POST /contact → save message ───
app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    console.log(`📩 New message from: ${name} (${email})`);
    res.status(201).json({ success: true, message: 'Message saved!' });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ─── GET /messages → view all messages ───
app.get('/messages', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch.' });
  }
});

// ─── START ───
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});