const mongoose = require("mongoose");
const productionSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true }, flockId: { type: mongoose.Schema.Types.ObjectId, ref: "Flock", required: true, index: true },
  date: { type: Date, required: true }, goodCrates: { type: Number, default: 0, min: 0 }, extraEggs: { type: Number, default: 0, min: 0 }, brokenEggs: { type: Number, default: 0, min: 0 }, notes: String
}, { timestamps: true });
productionSchema.index({ businessId: 1, flockId: 1, date: 1 }, { unique: true });
module.exports = mongoose.model("Production", productionSchema);
