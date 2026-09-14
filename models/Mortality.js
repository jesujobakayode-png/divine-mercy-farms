const mongoose = require("mongoose");
module.exports = mongoose.model("Mortality", new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true }, flockId: { type: mongoose.Schema.Types.ObjectId, ref: "Flock", required: true, index: true },
  quantity: { type: Number, required: true, min: 1 }, reason: { type: String, enum: ["unknown", "illness", "accident", "natural", "other"], default: "unknown" }, date: { type: Date, required: true }, notes: String
}, { timestamps: true }));
