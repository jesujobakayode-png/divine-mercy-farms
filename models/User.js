const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
  name: { type: String, required: true, trim: true }, email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false }, role: { type: String, enum: ["admin", "staff"], default: "admin" }
}, { timestamps: true });
userSchema.index({ businessId: 1, email: 1 }, { unique: true });
userSchema.pre("save", async function save(next) { if (!this.isModified("password")) return next(); this.password = await bcrypt.hash(this.password, 12); next(); });
userSchema.methods.matchesPassword = function matchesPassword(password) { return bcrypt.compare(password, this.password); };
module.exports = mongoose.model("User", userSchema);
