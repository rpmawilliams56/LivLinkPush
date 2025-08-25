const express = require('express');
const router = express.Router();
const { savePurchase } = require('../../models/purchase');

router.post('/', async (req, res) => {
  const { txn_id, email, payer_name, item_name, amount, currency } = req.body;

  if (!txn_id || !email || !item_name) {
    return res.status(400).json({ message: 'Missing required fields: txn_id, email, or item_name.' });
  }

  try {
    const result = await savepurchase({
      txn_id,
      email,
      payer_name,
      item_name,
      amount,
      currency,
      timestamp: new Date()
    });
    res.status(200).json({ message: result });
  } catch (err) {
    console.error('Error saving purchase:', err);
    res.status(500).json({ error: 'Failed to save purchase.' });
  }
});

module.exports = router;
