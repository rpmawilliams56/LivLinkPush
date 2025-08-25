const mongoose = require('mongoose');

const signupSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true },
  phone: String,
  message: String,

  consentEmail: { type: Boolean, default: false },  // from original signup
  consentSMS: { type: Boolean, default: false },    // from original signup

  formId: { type: String, required: true },        // identifies form source
  tags: [String],
  sourcePage: String,
  metadata: Object,
  
}, { timestamps: true });

module.exports = mongoose.model('Signup', signupSchema);
