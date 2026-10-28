const makeRoutes = require("./resourceRoutes");
const { expenses, expenseSummary } = require("../controllers/resourceController");

module.exports = makeRoutes(expenses, (router) => {
  router.get("/summary", expenseSummary);
});
