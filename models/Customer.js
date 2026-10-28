const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    address: String,
    type: {
      type: String,
      enum: ["individual", "retailer", "restaurant", "distributor", "other"],
      default: "individual",
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
