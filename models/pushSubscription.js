const mongoose = require('mongoose');

const PushSubscriptionSchema = new mongoose.Schema({
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: String,
    auth: String,
  },
  email: String,           // Optional: to associate subscription with user email
  phone: String,           // Optional: for SMS integration later
  bandId: String,          // ID to track band/show subscription
  showId: String,
  optedIn: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PushSubscription', PushSubscriptionSchema);
