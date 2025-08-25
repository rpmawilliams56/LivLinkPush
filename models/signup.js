const mongoose = require('mongoose');

const signupSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: String,
  consentEmail: { type: Boolean, default: false },
  consentSMS: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Signup', signupSchema);
