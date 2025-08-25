const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Missing name or email' });
  }

  // Optionally: Save to database or send a thank-you message
  console.log(`📩 New supporter: ${name} (${email})`);
  res.json({ success: true, message: 'Thank you for your support!' });
});

module.exports = router;
