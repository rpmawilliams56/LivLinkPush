const mongoose = require('mongoose');

const optinSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  phoneorsms: String,
  email: String,
  optin_sms_email_anytime: Boolean,
  optin_sms_email_showonly: Boolean,
  optin_email_only: Boolean,
  optout_all: Boolean,
  band_demo_interest: Boolean,
  business_partnership_interest: Boolean,
  needs_review: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('optin', optinSchema);
