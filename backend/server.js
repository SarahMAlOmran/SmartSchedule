const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Sara:1234512345@cluster0.ctncent.mongodb.net/SmartSchedular';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB (SmartSchedular database)'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'SmartSchedule Backend is running!',
    status: 'ok',
    endpoints: {
      login: 'POST /api/login',
      register: 'POST /api/register',
      irregularStudents: 'GET /api/irregular-students',
      courses: 'GET /api/courses'
    }
  });
});

// User Schema
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

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { First_Name, Last_Name, Email, Password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Get the highest userID and increment (starting from 16 since there are 15 existing users)
    const lastUser = await User.findOne().sort({ userID: -1 });
    const newUserID = lastUser ? lastUser.userID + 1 : 16;

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

// Get all irregular students
app.get('/api/irregular-students', async (req, res) => {
  try {
    // Define schema inline to avoid conflicts
    const studentSchema = new mongoose.Schema({}, { strict: false });
    
    // Check if model already exists
    let Student;
    try {
      Student = mongoose.model('student');
    } catch {
      Student = mongoose.model('student', studentSchema, 'student');
    }

    const irregularStudents = await Student.find({ irregulars: true });
    res.json(irregularStudents);
  } catch (error) {
    console.error('Error fetching irregular students:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add irregular student
app.post('/api/irregular-students', async (req, res) => {
  try {
    const studentSchema = new mongoose.Schema({}, { strict: false });
    
    let Student;
    try {
      Student = mongoose.model('student');
    } catch {
      Student = mongoose.model('student', studentSchema, 'student');
    }

    const newStudent = new Student({
      ...req.body,
      irregulars: true
    });

    await newStudent.save();
    res.status(201).json({ message: 'Irregular student added successfully', student: newStudent });
  } catch (error) {
    console.error('Error adding irregular student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete irregular student
app.delete('/api/irregular-students/:id', async (req, res) => {
  try {
    const studentSchema = new mongoose.Schema({}, { strict: false });
    
    let Student;
    try {
      Student = mongoose.model('student');
    } catch {
      Student = mongoose.model('student', studentSchema, 'student');
    }

    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Irregular student deleted successfully' });
  } catch (error) {
    console.error('Error deleting irregular student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courseSchema = new mongoose.Schema({}, { strict: false });
    
    let Course;
    try {
      Course = mongoose.model('Course');
    } catch {
      Course = mongoose.model('Course', courseSchema, 'Course');
    }

    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});