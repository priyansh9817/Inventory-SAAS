const express = require("express");
const router = express.Router();

const {
  addTransaction,
  getTransactions,
} = require("../controllers/transactionController");

const protect = require("../middleware/authMiddleware");

// routes
router.post("/", protect, addTransaction);
router.get("/", protect, getTransactions);

module.exports = router;