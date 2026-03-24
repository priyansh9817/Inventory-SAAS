const express = require("express");
const router = express.Router();

const {
  addProduct,
  getProducts,
  deleteProduct,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, addProduct);
router.get("/", protect, getProducts);
router.delete("/:id", protect, deleteProduct);

module.exports = router;