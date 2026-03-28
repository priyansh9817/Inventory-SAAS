const express = require("express");
const router = express.Router();

const {
  addTransaction,
  getTransactions,
  getLedger,
  softDeleteTransaction,
  restoreTransaction,
  getDeletedTransactions,
} = require("../controllers/transactionController");

const protect = require("../middleware/authMiddleware");

// routes
router.post("/", protect, addTransaction);
router.get("/", protect, getTransactions);
router.get("/ledger/:productId", protect, getLedger);
router.delete("/:id", protect, softDeleteTransaction);
router.put("/restore/:id", protect, restoreTransaction);
router.get("/deleted", protect, getDeletedTransactions);
module.exports = router;