const express = require("express");
const router = express.Router();

const { getDashboard, getAnalytics, getProductAnalytics } = require("../controllers/dashboardController");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, getDashboard);
router.get("/analytics", protect, getAnalytics);
router.get("/product-analytics", protect, getProductAnalytics);

module.exports = router;