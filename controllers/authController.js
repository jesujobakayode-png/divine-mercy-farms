const jwt = require("jsonwebtoken");
const Business = require("../models/Business");
const User = require("../models/User");
const tokenFor = (user) => jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, businessId: user.businessId });

exports.register = async (req, res) => { try {
  const { name, email, password, businessName } = req.body;
  if (!name || !email || !password || !businessName) return res.status(400).json({ success: false, message: "Name, email, password and business name are required." });
  const business = await Business.create({ name: businessName });
  const user = await User.create({ businessId: business._id, name, email, password });
  res.status(201).json({ success: true, token: tokenFor(user), user: publicUser(user), business });
} catch (error) { res.status(error.code === 11000 ? 409 : 500).json({ success: false, message: error.code === 11000 ? "An account with this email already exists for this business." : "Could not create account." }); } };
exports.login = async (req, res) => { try {
  const { email, password } = req.body; const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
  if (!user || !(await user.matchesPassword(password))) return res.status(401).json({ success: false, message: "Invalid email or password." });
  res.json({ success: true, token: tokenFor(user), user: publicUser(user) });
} catch (_) { res.status(500).json({ success: false, message: "Could not sign in." }); } };
exports.me = async (req, res) => res.json({ success: true, user: publicUser(req.user), business: await Business.findById(req.user.businessId) });
