const makeRoutes = require("./resourceRoutes");
const { expenses, expenseSummary } = require("../controllers/resourceController");

module.exports = makeRoutes(expenses, (router) => {
  router.get("/summary", expenseSummary);
  router.use((req, res, next) => {
    if (["POST", "PUT"].includes(req.method) && ["feed", "medication"].includes(req.body.category)) {
      return res.status(400).json({ success: false, message: "Use Feed & Medication for feed and medication expenses." });
    }
    next();
  });
});
