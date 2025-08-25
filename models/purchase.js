const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  txn_id: { type: String, required: true, unique: true },
  email: String,
  payer_name: String,
  partner: String,
  item_name: String,
  amount: Number,
  currency: String,
  claimed: { type: Boolean, default: false },
  wallet_address: String,
}, { timestamps: true });

const purchase = mongoose.models.purchase || mongoose.model('purchase', purchaseSchema);

async function savepurchase(purchaseData) {
  // Check if purchase with this txn_id already exists
  const existing = await purchase.findOne({ txn_id: purchaseData.txn_id });
  if (existing) {
    return 'purchase with this txn_id already exists.';
  }

  const purchase = new purchase(purchaseData);
  await purchase.save();

  return 'purchase saved successfully.';
}

module.exports = {
  purchase,
  savepurchase,
};
