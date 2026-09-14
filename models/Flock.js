const mongoose = require("mongoose");
module.exports = mongoose.model("Flock", new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
  name: { type: String, required: true, trim: true }, type: { type: String, enum: ["layers", "broilers", "other"], required: true },
  breed: { type: String, trim: true }, arrivalDate: { type: Date, required: true }, initialQuantity: { type: Number, required: true, min: 1 },
  source: { type: String, trim: true }, status: { type: String, enum: ["active", "sold_out", "depleted", "archived"], default: "active" }, notes: String
}, { timestamps: true }));
