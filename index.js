require('dotenv').config();
console.log("✅ MONGO_URI loaded as:", process.env.MONGO_URI);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const savedigitalpurchaseRoute = require('./routes/api/savedigitalpurchase');
const optinRoute = require('./routes/api/optin');
const signupRoute = require('./routes/api/signup');
const claimRoute = require('./routes/api/claim');
const savepurchaseRoute = require('./routes/api/savepurchase');

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
app.use('/api/savedigitalpurchase', savedigitalpurchaseRoute);
app.use('/api/optin', optinRoute);
app.use('/api/signup', signupRoute);
app.use('/api/claim', claimRoute);
app.use('/api/savepurchase', savepurchaseRoute);

// Supporters endpoint
app.get('/supporters', async (req, res) => {
  try {
    const purchases = await purchase.find({ payer_name: { $ne: null } })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const seen = new Set();
    const uniqueNames = [];

    for (const p of purchases) {
      const name = p.payer_name.trim();
      if (!seen.has(name)) {
        seen.add(name);
        uniqueNames.push(name);
        if (uniqueNames.length >= 100) break;
      }
    }

    res.json({ supporters: uniqueNames });
  } catch (err) {
    console.error("❌ Error fetching supporters:", err);
    res.status(500).json({ error: 'Failed to fetch supporters' });
  }
});

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
