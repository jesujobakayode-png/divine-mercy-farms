const mongoose = require("mongoose");

const connectDB = () => mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => { console.error("MongoDB connection error:", error.message); process.exit(1); });

module.exports = connectDB;
