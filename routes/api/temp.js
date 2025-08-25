const express = require('express');
const router = express.Router();
const purchase = require('../../models/purchase'); // Import model

// POST /api/savedigitalpurchase
router.post('/', async (req, res) => {
  const { txn_id, email, payer_name, item_name, amount, currency, partner } = req.body;

  // Validate required fields
  if (!txn_id || !email || !item_name) {
    return res.status(400).json({ message: 'Missing required fields: txn_id, email, or item_name.' });
  }

  try {
    // Check if purchase with txn_id already exists
    const existing = await purchase.findOne({ txn_id });
    if (existing) {
      return res.status(200).json({ message: 'Purchase already exists.' });
    }

    // Create new purchase document
    const newpurchase = new purchase({
      txn_id,
      email,
      payer_name,
      partner,
      item_name,
      amount,
      currency
    });

    await newpurchase.save();

    res.status(201).json({ message: 'Digital purchase saved successfully.' });
  } catch (err) {
    console.error('Error saving digital purchase:', err);
    res.status(500).json({ error: 'Failed to save digital purchase.' });
  }
});

module.exports = router;
