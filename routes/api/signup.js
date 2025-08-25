// routes/signup.js or routes/api/signup.js (depending on your structure)

const express = require("express");
const router = express.Router();
const SignupEntry = require("../../models/signupentry"); // Adjust path if needed

// POST /api/signup
router.post("/", async (req, res) => {
  try {
    const {
      email,
      name,
      phone,
      message,
      formId,
      tags = [],
      sourcePage = "",
      metadata = {}
    } = req.body;

    // Required field check
    if (!email || !formId) {
      return res.status(400).json({ error: "Email and formId are required." });
    }

    const entry = new signupentry({
      email,
      name,
      phone,
      message,
      formId,
      tags,
      sourcePage,
      metadata
    });

    await entry.save();
    console.log("✅ New signup saved:", email);

    res.status(201).json({ message: "signup saved successfully." });
  } catch (err) {
    console.error("❌ Error saving signup entry:", err);
    res.status(500).json({ error: "failed to save entry." });
  }
});

module.exports = router;
