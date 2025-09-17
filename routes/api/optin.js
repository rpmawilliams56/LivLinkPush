// routes/api/optin.js

const express = require('express');
const router = express.Router();
const optin = require('../../models/optin');
const nodemailer = require('nodemailer');

// setup smtp transport using WP SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.yourdomain.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// POST /api/optin
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
      return res.status(400).json({ error: 'missing required fields.' });
    }

    const needs_review = band_demo_interest || business_partnership_interest;

    const newoptin = new optin({
      firstname,
      lastname,
      phoneorsms,
      email,
      optin_sms_email_anytime: !!optin_sms_email_anytime,
      optin_sms_email_showonly: !!optin_sms_email_showonly,
      optin_email_only: !!optin_email_only,
      optout_all: !!optout_all,
      band_demo_interest: !!band_demo_interest,
      business_partnership_interest: !!business_partnership_interest,
      needs_review
    });

    await newoptin.save();

    // send flag email to rick if review is needed
    if (needs_review) {
      const mailoptions = {
        from: process.env.SMTP_FROM || '"LivLink Notification" <noreply@lightninstik.com>',
        to: 'rick@llnklimited.com',
        subject: '🎸 new opt-in flagged for review',
        text: `
a new user has submitted an opt-in form requiring review.

name: ${firstname} ${lastname}
email: ${email}
phone/sms: ${phoneorsms}

interests:
  - band demo interest: ${band_demo_interest}
  - business partnership interest: ${business_partnership_interest}

timestamp: ${new Date().toISOString()}
        `
      };

      await transporter.sendMail(mailoptions);
    }

    res.status(201).json({ message: 'opt-in saved successfully.' });

  } catch (error) {
    console.error('❌ error saving opt-in:', error);
    res.status(500).json({ error: 'server error.' });
  }
});

module.exports = router;
