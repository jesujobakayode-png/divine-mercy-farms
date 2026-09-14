const mongoose = require("mongoose");
module.exports = mongoose.model("Business", new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true }, address: { type: String, trim: true },
  currency: { type: String, default: "NGN" }, eggsPerCrate: { type: Number, default: 30, min: 1 }
}, { timestamps: true }));
