const mongoose = require("mongoose");

const signupentrySchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true },
    phone: String,
    message: String,
    formId: { type: String, required: true },     // identifies form source
    tags: [String],
    sourcePage: String,
    metadata: Object
  },
  { timestamps: true }
);

module.exports = mongoose.model("signupentry", signupentrySchema);