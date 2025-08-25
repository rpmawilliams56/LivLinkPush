
const fs = require('fs');
const path = require('path');

console.log("Listing files at ../../ from claim.js:");

const dirPath = path.resolve(__dirname, '../../');
try {
  const files = fs.readdirSync(dirPath);
  console.log(files);
} catch (err) {
  console.error("Error reading directory:", err);
}


const express = require('express');
const router = express.Router();
const Purchase = require('../../models/purchase');
const { sendtoken } = require('../../sendtoken'); // Adjust path if needed

// POST /api/claim
router.post('/', async (req, res) => {
  const { txn_id, wallet_address } = req.body;

  if (!txn_id || !wallet_address) {
    return res.status(400).json({ error: 'Missing txn_id or wallet_address' });
  }

  try {
    // Find the purchase by transaction ID
    const purchase = awaitPurchase.purchase.findOne({ txn_id });

    if (!purchase) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (purchase.claimed) {
      return res.status(400).json({ error: 'Purchase already claimed' });
    }

    // Call your token sending function
    const result = await sendToken(wallet_address, purchase.amount || 1);

    if (result.success) {
      purchase.claimed = true;
      purchase.wallet_address = wallet_address;
      await purchase.save();

      return res.json({ success: true, txHash: result.hash });
    } else {
      return res.status(500).json({ error: result.error || 'Token send failed' });
    }
  } catch (error) {
    console.error('❌ Claim error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
