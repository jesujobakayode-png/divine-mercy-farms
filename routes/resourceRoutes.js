const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const makeRoutes = (controller, configure) => { const router = express.Router(); router.use(protect); if (configure) configure(router); router.route("/").post(controller.create).get(controller.list); router.route("/:id").get(controller.get).put(controller.update).delete(controller.remove); return router; };
module.exports = makeRoutes;
