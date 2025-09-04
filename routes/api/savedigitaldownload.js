const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DigitalDownload = require('../../models/digitaldownload');

const jsonFile = path.join(__dirname, '../../purchases.json');

router.post('/', async (req, res) => {
  const {
    txn_id,
    email,
    payer_name,
    partner,
    item_name,
    amount,
    currency,
    status
  } = req.body;

  try {
    // Normalize email and item name to lowercase first
    const normalizedEmail = email.toLowerCase();
    const normalizedItemName = item_name.toLowerCase();

    // Save to MongoDB
    const existing = await DigitalDownload.findOne({ transactionId: txn_id });
    if (existing) {
      return res.status(200).json({ message: 'already exists in db' });
    }

    const purchase = new DigitalDownload({
      transactionId: txn_id,
      payerEmail: normalizedEmail,
      payerName: payer_name,
      partner,
      itemName: normalizedItemName,
      amount,
      currency,
      status
    });

    await purchase.save();
    console.log(`✅ mongodb: saved txn ${txn_id}`);

    // Save to purchases.json
    let purchases = {};
    if (fs.existsSync(jsonFile)) {
      try {
        purchases = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      } catch (err) {
        console.error('❌ error parsing purchases.json:', err);
      }
    }

    if (!purchases[txn_id]) {
      purchases[txn_id] = {
        email: normalizedEmail,
        item_name: normalizedItemName,
        payer_name,
        amount,
        currency,
        partner,
        status,
        timestamp: new Date().toISOString()
      };

      fs.writeFileSync(jsonFile, JSON.stringify(purchases, null, 2));
      console.log(`✅ json: saved txn ${txn_id}`);
    }

    res.status(200).json({ message: 'saved to db and json' });

  } catch (err) {
    console.error('❌ error saving digital download:', err);
    res.status(500).json({ error: 'failed to save purchase' });
  }
});

module.exports = router;
