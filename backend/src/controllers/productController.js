const Product = require("../models/Product");
const Branch = require("../models/Branch");

// ➕ Add Product
exports.addProduct = async (req, res) => {
  try {
    const { name, category, branchId } = req.body;

    // ✅ validation
    if (!name || !category || !branchId) {
      return res.status(400).json({
        message: "Name, category and branch required",
      });
    }

    // 🔐 CHECK BRANCH BELONGS TO USER
    const branch = await Branch.findOne({
      _id: branchId,
      userId: req.user.id,
    });

    if (!branch) {
      return res.status(404).json({
        message: "Invalid branch",
      });
    }

    const product = await Product.create({
      name,
      category,
      stock: 0,
      branchId, // 🔥 IMPORTANT
      userId: req.user.id,
    });

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📄 Get All Products (FILTER BY BRANCH)
exports.getProducts = async (req, res) => {
  try {
    const { branchId } = req.query;

    if (!branchId) {
      return res.status(400).json({
        message: "branchId is required",
      });
    }

    const products = await Product.find({
      userId: req.user.id,
      branchId, // 🔥 FILTER
    });

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete Product (WITH BRANCH SAFETY)
exports.deleteProduct = async (req, res) => {
  try {
    const { branchId } = req.query;

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
      branchId, // 🔥 IMPORTANT
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found in this branch",
      });
    }

    res.json({ message: "Product deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};