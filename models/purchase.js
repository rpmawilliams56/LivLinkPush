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

const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);

async function savePurchase(purchaseData) {
  // Check if purchase with this txn_id already exists
  const existing = await Purchase.findOne({ txn_id: purchaseData.txn_id });
  if (existing) {
    return 'Purchase with this txn_id already exists.';
  }

  const purchase = new Purchase(purchaseData);
  await purchase.save();

  return 'Purchase saved successfully.';
}

module.exports = {
  Purchase,
  savePurchase,
};
