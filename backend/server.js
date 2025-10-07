const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Sara:1234512345@cluster0.ctncent.mongodb.net/SamrtSchedular';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// User Schema (matching your database structure)
const userSchema = new mongoose.Schema({
  userID: Number,
  First_Name: { type: String, required: true },
  Last_Name: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  role: String,
  comments: [{ content: String }]
});

const User = mongoose.model('User', userSchema, 'User');

// ROUTES

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { First_Name, Last_Name, Email, Password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Get the highest userID and increment
    const lastUser = await User.findOne().sort({ userID: -1 });
    const newUserID = lastUser ? lastUser.userID + 1 : 1;

    // Create new user
    const newUser = new User({
      userID: newUserID,
      First_Name,
      Last_Name,
      Email,
      Password,
      role: role !== 'Student' ? role : undefined,
      comments: []
    });

    await newUser.save();

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        userID: newUser.userID,
        First_Name: newUser.First_Name,
        Last_Name: newUser.Last_Name,
        Email: newUser.Email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const user = await User.findOne({ Email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.Password !== Password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        userID: user.userID,
        First_Name: user.First_Name,
        Last_Name: user.Last_Name,
        Email: user.Email,
        role: user.role || 'Student'
      },
      token: 'dummy-token'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});