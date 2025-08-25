require('dotenv').config();
console.log("✅ MONGO_URI loaded as:", process.env.MONGO_URI);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const optinRoute = require('./routes/api/optin');
const signupRoute = require('./routes/api/signup');
const claimRoute = require('./routes/api/claim');

// Import model
const { purchase } = require('./models/purchase');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Live Link API is running');
});

// Routes
app.use('/api/optin', optinRoute);
app.use('/api/signup', signupRoute);
app.use('/api/claim', claimRoute);

// MongoDB + Server init
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🌐 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });
