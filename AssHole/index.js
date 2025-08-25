require('dotenv').config();
console.log("✅ MONGO_URI loaded as:", process.env.MONGO_URI);  // Add this for debug


// ==============================
// 🌐 LLNK Token Backend Server
// ==============================

// 📦 Load Environment Variables
require('dotenv').config();

// 🚀 Import Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { sendToken } = require('./sendToken');
const Purchase = require('./models/Purchase');

const app = express();
const PORT = process.env.PORT || 3000;

// 🧠 Middleware
app.use(bodyParser.json());

// 🗄️ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// ============================
// 🔐 CLAIM ENDPOINT
// ============================
app.post('/claim', async (req, res) => {
  const { txn_id, wallet_address } = req.body;

  if (!txn_id || !wallet_address) {
    return res.status(400).json({ error: 'Missing txn_id or wallet_address' });
  }

  try {
    const purchase = await Purchase.findOne({ txn_id });

    if (!purchase) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (purchase.claimed) {
      return res.status(400).json({ error: 'Already claimed' });
    }

    const result = await sendToken(wallet_address, purchase.amount || 1);

    if (result.success) {
      purchase.claimed = true;
      purchase.wallet_address = wallet_address;
      await purchase.save();

      return res.json({ success: true, txHash: result.hash });
    } else {
      return res.status(500).json({ error: result.error });
    }

  } catch (error) {
    console.error("❌ Claim error:", error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ============================
// 💾 PURCHASE SAVE ENDPOINT
// Called from PayPal IPN (PHP)
// ============================
app.post('/api/savePurchase', async (req, res) => {
  const { txn_id, email, payer_name, partner, amount, currency } = req.body;

  try {
    const existing = await Purchase.findOne({ txn_id });
    if (existing) return res.status(200).send('Already exists');

    const purchase = new Purchase({
      txn_id,
      email,
      payer_name,
      partner,
      amount,
      currency
    });

    await purchase.save();
    res.status(200).send('Saved');
  } catch (err) {
    console.error("❌ Error saving purchase:", err);
    res.status(500).send('Error');
  }
});

// ✅ Start the server
// ============================
// 🧱 SUPPORTERS WALL ENDPOINT
// ============================
app.get('/supporters', async (req, res) => {
  try {
    const purchases = await Purchase.find({ payer_name: { $ne: null } })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const seen = new Set();
    const uniqueNames = [];

    for (let p of purchases) {
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

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
