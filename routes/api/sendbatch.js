const express = require('express');
const router = express.Router();
const ContactCampaign = require('../../models/contactcampaign');

// Simulated message sender (replace with real service)
async function sendMockMessage(contact, yesLink, optOutLink) {
  console.log(`Sending message to: ${contact.phoneNumber || contact.email}`);
  console.log(`YES link: ${yesLink}`);
  console.log(`OPT OUT link: ${optOutLink}`);
}

router.post('/', async (req, res) => {
  const { band, showId, channel = 'sms' } = req.body;

  try {
    const recipients = await ContactCampaign.find({
      optedOut: false,
      band,
      showId
    }).limit(100);

    for (const contact of recipients) {
      const id = contact._id.toString();
      const yesLink = `http://localhost:3000/api/respond/yes/${id}`;
      const optOutLink = `http://localhost:3000/api/respond/optout/${id}`;

      await sendMockMessage(contact, yesLink, optOutLink);

      contact.interactionLog.push({
        type: channel,
        actionTaken: 'batch_sent',
        timestamp: new Date()
      });

      await contact.save();
    }

    res.json({ success: true, sent: recipients.length });
  } catch (error) {
    console.error('Error in sendbatch:', error);
    res.status(500).json({ error: 'Batch send failed.' });
  }
});

module.exports = router;
