const mongoose = require('mongoose');

const digitaldownloadSchema = new mongoose.Schema({
  payerEmail: { type: String, required: true },
  itemName: { type: String, required: true },
  payerName: String,
  amount: Number,
  currency: String,
  transactionId: { type: String, required: true, unique: true },
  partner: String,
  status: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('digitaldownload', digitaldownloadSchema);
