const express = require('express');
const router = express.Router();
const Optin = require('../../models/optin');  // Make sure your schema matches these fields

// POST /api/optin
router.post('/', async (req, res) => {
  try {
    // Destructure all checkboxes (assuming form sends booleans)
    const {
      firstName,
      lastName,
      phoneOrSMS,
      email,
      optInAnytime,
      optInShowOnly,
      optInEmailOnly,
      optOut,
      bandInterestedInDemo,
      businessInterestedInSponsorship
    } = req.body;

    // Basic validation
    if (!firstName || !lastName || !phoneOrSMS || !email) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Create new document (all booleans forced to lowercase)
    const newOptin = new Optin({
      firstName: firstName.toLowerCase(),
      lastName: lastName.toLowerCase(),
      phoneOrSMS: phoneOrSMS.toLowerCase(),
      email: email.toLowerCase(),
      optInAnytime: !!optInAnytime,
      optInShowOnly: !!optInShowOnly,
      optInEmailOnly: !!optInEmailOnly,
      optOut: !!optOut,
      bandInterestedInDemo: !!bandInterestedInDemo,
      businessInterestedInSponsorship: !!businessInterestedInSponsorship
    });

    await newOptin.save();

    res.status(201).json({ message: 'Opt-in saved successfully.' });
  } catch (error) {
    console.error('❌ Error saving opt-in:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
