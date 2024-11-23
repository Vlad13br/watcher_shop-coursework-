const express = require("express");
const router = express.Router();
const StatsController = require("../controllers/stats-controller");
const { isAdmin} = require("../middlewares/auth");


router.get("/users",isAdmin, StatsController.getAllUsers);

router.get("/newusers",isAdmin, StatsController.getNewUsers);

router.get("/valuableusers",isAdmin, StatsController.getTopEarningUsers);

router.get("/products",isAdmin, StatsController.getTopSellingProducts);

router.get("/stock",isAdmin, StatsController.getProductStock);

router.get("/orders",isAdmin, StatsController.getUncompletedOrders);

router.patch("/orders",isAdmin, StatsController.updateOrderStatus);

module.exports = router;
