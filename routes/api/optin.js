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

    if (!firstName || !lastName || !phoneOrSMS || !email) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const newOptin = new Optin({
      firstName,
      lastName,
      phoneOrSMS,
      email,
      optinSmsAndEmail: !!optinSmsAndEmail,
      optinLateNightNotifications: !!optinLateNightNotifications,
      optinEmailOnly: !!optinEmailOnly,
      bandInterestedInTestingLLNK: !!bandInterestedInTestingLLNK
    });

    await newOptin.save();

    res.status(201).json({ message: 'Opt-in saved successfully.' });
  } catch (error) {
    console.error('❌ Error saving opt-in:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
