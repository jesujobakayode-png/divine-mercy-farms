require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const makeRoutes = require("./routes/resourceRoutes");
const resources = require("./controllers/resourceController");
const { protect } = require("./middleware/authMiddleware");
const { getDashboard } = require("./controllers/dashboardController");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors({
  origin(origin, callback) {
    const allowedOrigins = [
      "https://divine-mercy-farms.vercel.app",
      "http://localhost:5173",
      ...(process.env.FRONTEND_URLS || "")
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean),
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json());

app.get("/api/health", (_, res) =>
  res.json({
    success: true,
    message: "Divine Mercy Farms API is running.",
  })
);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/flocks", makeRoutes(resources.flocks));
app.use("/api/mortalities", makeRoutes(resources.mortalities));
app.use("/api/production", makeRoutes(resources.production));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/sales", makeRoutes(resources.sales));
app.use("/api/payments", makeRoutes(resources.payments));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/dashboard", dashboardRoutes);

const frontendDist = path.join(__dirname, "..", "frontend", "dist");
const fs = require("fs");

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    return res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use((_, res) =>
  res.status(404).json({
    success: false,
    message: "Route not found.",
  })
);

const port = process.env.PORT || 5000;

connectDB().then(() =>
  app.listen(port, () => console.log(`Server running on port ${port}`))
);
