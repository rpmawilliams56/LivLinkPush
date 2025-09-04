const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const webpush = require('web-push');
require('dotenv').config();

const app = express();

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES =====
const optinRoutes = require('./routes/api/optin');
const signupRoutes = require('./routes/api/signup');
const claimRoutes = require('./routes/api/claim');
const digitalDownloadRoutes = require('./routes/api/savedigitaldownload');
const pushSubscriptionRoutes = require('./routes/api/pushsubscription');
const sendBatchRoutes = require('./routes/api/sendbatch');
const respondRoutes = require('./routes/api/respondtooffer');

app.use('/api/optin', optinRoutes);
app.use('/api/signup', signupRoutes);
app.use('/api/claim', claimRoutes);
app.use('/api/digitaldownload', digitalDownloadRoutes);
app.use('/api/push', pushSubscriptionRoutes);
app.use('/api/sendbatch', sendBatchRoutes);
app.use('/api/respond', respondRoutes);

// ===== STATIC FILES =====
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// ===== TEST ROUTE =====
app.get('/ping', (req, res) => res.send('pong'));

// ===== VERIFY ENV VARIABLES =====
const {
  MONGO_URI,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  VAPID_CONTACT_EMAIL = 'mailto:your-livelink@lightningstik.com'
} = process.env;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set. Please set it in your environment variables.');
  process.exit(1);
}

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('❌ VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY is not set. Please set them in your environment variables.');
  process.exit(1);
}

// ===== MONGO CONNECTION =====
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Mongo connected');
})
.catch((err) => {
  console.error('❌ Mongo connection error:', err);
});

// ===== SETUP WEB PUSH =====
webpush.setVapidDetails(
  VAPID_CONTACT_EMAIL,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
