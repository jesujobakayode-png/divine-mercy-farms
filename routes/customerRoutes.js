const makeRoutes = require("./resourceRoutes"); const { customers, customerBalances } = require("../controllers/resourceController");
module.exports = makeRoutes(customers, (router) => router.get("/balances", customerBalances));
