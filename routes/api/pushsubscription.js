const mongoose = require('mongoose');

const PushSubscriptionSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
    unique: true, // no duplicate subscriptions for the same endpoint
  },
  keys: {
    p256dh: {
      type: String,
      required: true,
    },
    auth: {
      type: String,
      required: true,
    }
  },
  email: {
    type: String, // optional: store email if provided
  },
  phone: {
    type: String, // optional: store phone if provided
  },
  bandId: {
    type: String, // to target notifications by band/show
  },
  showId: {
    type: String,
  },
  optedIn: {
    type: Boolean,
    default: true, // user consent for receiving notifications
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('PushSubscription', PushSubscriptionSchema);
