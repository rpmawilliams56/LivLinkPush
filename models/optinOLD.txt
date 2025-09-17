const mongoose = require('mongoose');

const optinSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneOrSMS: { type: String, required: true },
  email: { type: String, required: true },

  optinSmsAndEmail: { type: Boolean, default: false },
  optinLateNightNotifications: { type: Boolean, default: false },
  optinEmailOnly: { type: Boolean, default: false },
  bandInterestedInTestingLLNK: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Optin', optinSchema);
