// models/optin.js
const mongoose = require('mongoose');

const optinSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneOrSMS: { type: String, required: true },
  email: { type: String, required: true },

  optinSmsAndEmail: { type: Boolean, default: false },       // Checkbox 1
  optinLateNightNotifications: { type: Boolean, default: false }, // Checkbox 2
  optinEmailOnly: { type: Boolean, default: false },          // Checkbox 3
  bandInterestedInTestingLLNK: { type: Boolean, default: false }  // Checkbox 4

}, { timestamps: true });

module.exports = mongoose.model('optin', optinSchema);
