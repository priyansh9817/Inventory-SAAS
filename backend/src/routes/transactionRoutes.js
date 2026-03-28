const express = require("express");
const router = express.Router();

const {
  addTransaction,
  getTransactions,
  getLedger,
  softDeleteTransaction,
  restoreTransaction,
  getDeletedTransactions,
  permanentDeleteTransaction,
} = require("../controllers/transactionController");

const protect = require("../middleware/authMiddleware");

// routes
router.post("/", protect, addTransaction);
router.get("/", protect, getTransactions);
router.get("/ledger/:productId", protect, getLedger);
router.delete("/:id", protect, softDeleteTransaction);
router.put("/restore/:id", protect, restoreTransaction);
router.delete("/permanent/:id", protect, permanentDeleteTransaction);
router.get("/deleted", protect, getDeletedTransactions);

module.exports = router;