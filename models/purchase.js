const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  txn_id: { type: String, required: true, unique: true },
  email: String,
  payer_name: String,
  partner: String,
  item_name: String,
  amount: Number,
  currency: { type: String, default: 'USD' },
  status: String, // Optional: Completed, Pending, etc.
  claimed: { type: Boolean, default: false },
  wallet_address: String,
  is_digital: { type: Boolean, default: false }, // Distinguish digital purchases
  download_link: String, // Optionally populated for digital purchases
}, { timestamps: true });

const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);

async function savePurchase(purchaseData) {
  const existing = await Purchase.findOne({ txn_id: purchaseData.txn_id });
  if (existing) {
    return 'Purchase with this txn_id already exists.';
  }

  const newPurchase = new Purchase(purchaseData);
  await newPurchase.save();

  return 'Purchase saved successfully.';
}

module.exports = {
  Purchase,
  savePurchase
};
