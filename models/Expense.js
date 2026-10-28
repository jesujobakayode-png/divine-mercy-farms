const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    flockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flock",
      default: null,
      index: true,
    },
    category: {
      type: String,
      enum: ["feed", "medication", "labor", "utilities", "transport", "repairs", "equipment", "other"],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, min: 0 },
    unit: String,
    unitCost: { type: Number, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    supplier: String,
    date: { type: Date, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "transfer", "pos", "credit", "other"],
      default: "cash",
    },
    notes: String,
  },
  { timestamps: true }
);

expenseSchema.index({ businessId: 1, date: -1 });

module.exports = mongoose.model("Expense", expenseSchema);
