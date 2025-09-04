const express = require('express');
const router = express.Router();
const path = require('path');
const ContactCampaign = require('../../models/contactcampaign');

// YES Click
router.get('/yes/:id', async (req, res) => {
  try {
    const contact = await ContactCampaign.findById(req.params.id);
    if (!contact) return res.status(404).send('Not found');

    contact.interactionLog.push({
      type: 'user_action',
      actionTaken: 'clicked_yes',
      timestamp: new Date()
    });

    await contact.save();

    res.sendFile(path.resolve('views/offer.html'));
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// OPT-OUT Click
router.get('/optout/:id', async (req, res) => {
  try {
    const contact = await ContactCampaign.findById(req.params.id);
    if (!contact) return res.status(404).send('Not found');

    contact.optedOut = true;
    contact.interactionLog.push({
      type: 'user_action',
      actionTaken: 'opted_out',
      timestamp: new Date()
    });

    await contact.save();

    res.sendFile(path.resolve('views/optout-confirm.html'));
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
