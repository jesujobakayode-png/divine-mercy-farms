const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    flockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flock",
      default: null,
    },
    product: {
      type: String,
      enum: ["eggs", "birds", "manure", "other"],
      required: true,
    },
    quantity: { type: Number, required: true, min: 0.01 },
    unit: { type: String, required: true, trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    date: { type: Date, required: true },
    notes: String,
  },
  { timestamps: true }
);

saleSchema.index({ businessId: 1, date: -1 });

module.exports = mongoose.model("Sale", saleSchema);
