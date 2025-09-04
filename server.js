const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const PushSubscription = require('./models/pushSubscription');
require('dotenv').config();


// Load your VAPID keys from config or env variables
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

// Configure web-push with your VAPID keys and contact email
webpush.setVapidDetails(
  'mailto:your-livelink@lightningstik.com', // Change this to your contact email
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

/**
 * @route   POST /api/push/subscribe
 * @desc    Save push subscription to database
 * @body    { endpoint, keys: { p256dh, auth }, email?, phone?, bandId?, showId?, optedIn? }
 */
router.post('/subscribe', async (req, res) => {
  try {
    const subscription = req.body;

    // Check if subscription already exists (avoid duplicates)
    const existing = await PushSubscription.findOne({ endpoint: subscription.endpoint });

    if (!existing) {
      await new PushSubscription(subscription).save();
      return res.status(201).json({ message: 'Subscription saved successfully.' });
    } else {
      return res.status(200).json({ message: 'Subscription already exists.' });
    }
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription.' });
  }
});

/**
 * @route   POST /api/push/send-offer
 * @desc    Send push notification offer to all opted-in subscribers for a band and show
 * @body    { bandId, showId, title, message, url }
 */
router.post('/send-offer', async (req, res) => {
  const { bandId, showId, title, message, url } = req.body;

  if (!bandId || !showId || !title || !message) {
    return res.status(400).json({ error: 'Missing required fields: bandId, showId, title, message' });
  }

  try {
    // Find all subscriptions opted in for this band and show
    const subscriptions = await PushSubscription.find({ bandId, showId, optedIn: true });

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No subscribers found for this band and show.' });
    }

    // Prepare the payload for the push notification
    const payload = JSON.stringify({ title, message, url });

    // Send notification to each subscriber
    const sendPromises = subscriptions.map(sub =>
      webpush.sendNotification(sub, payload).catch(err => {
        console.error('Push send error for endpoint:', sub.endpoint, err);
      })
    );

    await Promise.all(sendPromises);

    res.json({ message: `Push notification sent to ${subscriptions.length} subscribers.` });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    res.status(500).json({ error: 'Failed to send push notifications.' });
  }
});

module.exports = router;
