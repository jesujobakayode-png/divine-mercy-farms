const mongoose = require("mongoose");
module.exports = mongoose.model("Payment", new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true }, customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true }, saleId: { type: mongoose.Schema.Types.ObjectId, ref: "Sale", default: null },
  amount: { type: Number, required: true, min: 0.01 }, method: { type: String, enum: ["cash", "transfer", "pos", "other"], default: "cash" }, date: { type: Date, required: true }, notes: String
}, { timestamps: true }));
