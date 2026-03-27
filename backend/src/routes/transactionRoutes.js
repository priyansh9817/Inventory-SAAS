const express = require("express");
const router = express.Router();

const {
  addTransaction,
  getTransactions,
  getLedger,
} = require("../controllers/transactionController");

const protect = require("../middleware/authMiddleware");

// routes
router.post("/", protect, addTransaction);
router.get("/", protect, getTransactions);
router.get("/ledger/:productId", protect, getLedger);

module.exports = router;