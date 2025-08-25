// models/OptIn.js
const mongoose = require('mongoose');

const OptInSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneOrSMS: { type: String, required: true },
  email: { type: String, required: true },

  optInSmsAndEmail: { type: Boolean, default: false },       // Checkbox 1
  optInLateNightNotifications: { type: Boolean, default: false }, // Checkbox 2
  optInEmailOnly: { type: Boolean, default: false },          // Checkbox 3
  bandInterestedInTestingLLNK: { type: Boolean, default: false }  // Checkbox 4

}, { timestamps: true });

module.exports = mongoose.model('OptIn', OptInSchema);
