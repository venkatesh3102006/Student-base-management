const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Some Windows environments (or local DNS proxies) use 127.0.0.1 as the DNS server
// and can refuse SRV lookups required for MongoDB Atlas connection strings.
// Force a public resolver to ensure SRV resolution works.
if (dns.getServers().some((s) => s.startsWith('127.') || s === '::1')) {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
}

dotenv.config();

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const malpracticeRoutes = require('./routes/malpractice');
const userRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');

const app = express();

// Middleware
import cors from "cors";

app.use(cors({
origin: "*",
methods: ["GET","POST","PUT","DELETE","PATCH"],
allowedHeaders: ["Content-Type","Authorization"]
})); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/malpractice', malpracticeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'College Portal API is running', timestamp: new Date() });
});

// API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'College Student Management Portal API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'Login with email and password',
        'POST /api/auth/logout': 'Logout current user',
        'GET /api/auth/me': 'Get current user profile'
      },
      students: {
        'GET /api/students': 'Get all students (with pagination, search, filter)',
        'GET /api/students/:id': 'Get student by ID',
        'POST /api/students': 'Create new student (Admin only)',
        'PUT /api/students/:id': 'Update student (Admin only)',
        'DELETE /api/students/:id': 'Delete student (Admin only)',
        'GET /api/students/search': 'Search students'
      },
      malpractice: {
        'GET /api/malpractice': 'Get all malpractice records',
        'GET /api/malpractice/student/:studentId': 'Get records for a student',
        'POST /api/malpractice': 'Add malpractice record (Admin only)',
        'PUT /api/malpractice/:id': 'Update record (Admin only)',
        'DELETE /api/malpractice/:id': 'Delete record (Admin only)'
      },
      users: {
        'GET /api/users': 'Get all users (Admin only)',
        'POST /api/users': 'Create faculty user (Admin only)',
        'PUT /api/users/:id': 'Update user (Admin only)',
        'DELETE /api/users/:id': 'Delete user (Admin only)'
      },
      stats: {
        'GET /api/stats/dashboard': 'Get dashboard statistics'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_portal';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Docs available at http://localhost:${PORT}/api/docs`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
