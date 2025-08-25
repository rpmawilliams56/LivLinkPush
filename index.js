

require('dotenv').config();

const fs = require('fs');
console.log("Files in routes/api:", fs.readdirSync('./routes/api'));

console.log("✅ MONGO_URI loaded as:", process.env.MONGO_URI);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const saveDigitalPurchaseRoute = require('./routes/api/saveDigitalPurchase');
const optinRoute = require('./routes/api/optin');
const signupRoute = require('./routes/api/signup');
const claimRoute = require('./routes/api/claim');
const savePurchaseRoute = require('./routes/api/savePurchase');

// Import model for supporters endpoint
const Purchase = require('./models/Purchase');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Live Link API is running');
});

// Mount routes
app.use('/api/saveDigitalPurchase', saveDigitalPurchaseRoute);
app.use('/api/optin', optinRoute);
app.use('/api/signup', signupRoute);
app.use('/api/claim', claimRoute);
app.use('/api/savePurchase', savePurchaseRoute);

// Supporters wall endpoint
app.get('/supporters', async (req, res) => {
  try {
    const purchases = await Purchase.find({ payer_name: { $ne: null } })
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

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🌐 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });
