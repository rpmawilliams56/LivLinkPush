// routes/api/optin.js
const express = require('express');
const router = express.Router();
const OptIn = require('../../models/OptIn');

// POST /api/optin
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneOrSMS,
      email,
      optInSmsAndEmail,
      optInLateNightNotifications,
      optInEmailOnly,
      bandInterestedInTestingLLNK
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phoneOrSMS || !email) {
      return res.status(400).json({ error: 'Missing required fields: firstName, lastName, phoneOrSMS, or email.' });
    }

    const newOptIn = new OptIn({
      firstName,
      lastName,
      phoneOrSMS,
      email,
      optInSmsAndEmail: Boolean(optInSmsAndEmail),
      optInLateNightNotifications: Boolean(optInLateNightNotifications),
      optInEmailOnly: Boolean(optInEmailOnly),
      bandInterestedInTestingLLNK: Boolean(bandInterestedInTestingLLNK)
    });

    await newOptIn.save();

    return res.status(201).json({ message: 'Opt-in saved successfully.' });
  } catch (error) {
    console.error('❌ Error saving opt-in:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
