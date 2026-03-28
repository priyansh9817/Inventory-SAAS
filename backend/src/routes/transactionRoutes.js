const express = require("express");
const router = express.Router();

const {
  addTransaction,
  getTransactions,
  getLedger,
  softDeleteTransaction,
} = require("../controllers/transactionController");

const protect = require("../middleware/authMiddleware");

// routes
router.post("/", protect, addTransaction);
router.get("/", protect, getTransactions);
router.get("/ledger/:productId", protect, getLedger);
router.delete("/:id", protect, softDeleteTransaction);

module.exports = router;