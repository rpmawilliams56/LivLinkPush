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
   const express = require('express');
const router = express.Router();
const Optin = require('../../models/optin');

router.post('/', async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      phoneorsms,
      email,
      optin_sms_email_anytime,
      optin_sms_email_showonly,
      optin_email_only,
      optout_all,
      band_demo_interest,
      business_partnership_interest
    } = req.body;

    if (!firstname || !lastname || !phoneorsms || !email) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const newOptin = new Optin({
      firstname: firstname.toLowerCase(),
      lastname: lastname.toLowerCase(),
      phoneorsms: phoneorsms.toLowerCase(),
      email: email.toLowerCase(),
      optin_sms_email_anytime: !!optin_sms_email_anytime,
      optin_sms_email_showonly: !!optin_sms_email_showonly,
      optin_email_only: !!optin_email_only,
      optout_all: !!optout_all,
      band_demo_interest: !!band_demo_interest,
      business_partnership_interest: !!business_partnership_interest,
      needs_review: true  // flag this for review per your previous request
    });

    await newOptin.save();

    res.status(201).json({ message: 'Opt-in saved successfully.' });
  } catch (error) {
    console.error('❌ Error saving opt-in:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;

