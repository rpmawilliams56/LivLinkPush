const mongoose = require('mongoose');

const signupSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String },
  consentEmail: { type: Boolean, default: false },
  consentSMS: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('signup', signupSchema);
