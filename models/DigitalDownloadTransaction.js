
const mongoose = require('mongoose');

const digitalDownloadTransactionSchema = new mongoose.Schema({
  payerEmail: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  transactionId: { type: String, required: true, unique: true },
  status: { type: String, required: true }, // e.g. 'Completed', 'Pending'
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DigitalDownloadTransaction', digitalDownloadTransactionSchema);
