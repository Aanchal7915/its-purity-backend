const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
console.log('JWT_SECRET test:', process.env.JWT_SECRET ? 'Loaded' : 'Missing'); // Debug log
const PORT = process.env.PORT || 5000;
// Trigger Restart

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://its-purity.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Debug Middleware: Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/purevit';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/reels', require('./routes/reelRoutes'));

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Stack:', err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Routes loaded: /api/categories, /api/reels');
});
