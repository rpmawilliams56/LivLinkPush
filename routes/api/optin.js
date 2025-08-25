// routes/api/optin.js
const express = require('express');
const router = express.Router();
const Optin = require('../../models/optin');

// POST /api/optin
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneOrSMS,
      email,
      optinSmsAndEmail,
      optinLateNightNotifications,
      optinEmailOnly,
      bandInterestedInTestingLLNK
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phoneOrSMS || !email) {
      return res.status(400).json({ error: 'Missing required fields: firstName, lastName, phoneOrSMS, or email.' });
    }

    const newoptin = new optin({
      firstName,
      lastName,
      phoneOrSMS,
      email,
      optinSmsAndEmail: Boolean(optinSmsAndEmail),
      optinLateNightNotifications: Boolean(optinLateNightNotifications),
      optinEmailOnly: Boolean(optinEmailOnly),
      bandInterestedInTestingLLNK: Boolean(bandInterestedInTestingLLNK)
    });

    await newoptin.save();

    return res.status(201).json({ message: 'opt-in saved successfully.' });
  } catch (error) {
    console.error('❌ Error saving opt-in:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
