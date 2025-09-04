const mongoose = require('mongoose');

const contactCampaignSchema = new mongoose.Schema({
  phoneNumber: String,
  email: String,
  optInType: { type: String, enum: ['full', 'emailOnly'] },
  optedOut: { type: Boolean, default: false },
  band: String,
  showId: String,
  interactionLog: [
    {
      type: String,         // 'sms', 'email', 'push'
      actionTaken: String,  // 'clicked_yes', 'opted_out'
      timestamp: Date
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('contactcampaign', contactCampaignSchema);
