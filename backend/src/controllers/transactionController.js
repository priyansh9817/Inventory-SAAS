const Transaction = require("../models/Transaction");
const Product = require("../models/Product");

// ➕ ADD TRANSACTION
exports.addTransaction = async (req, res) => {
  try {
    const { type, productId, quantity, pricePerUnit } = req.body;

    // ✅ validation
    if (!type || !productId || !quantity || !pricePerUnit) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (quantity <= 0 || pricePerUnit <= 0) {
      return res.status(400).json({ message: "Invalid values" });
    }

    // ✅ find product (user-specific)
    const product = await Product.findOne({
      _id: productId,
      userId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🔥 STOCK LOGIC
    if (type === "purchase") {
      product.stock += quantity;
    } 
    else if (type === "sale") {
      if (product.stock < quantity) {
        return res.status(400).json({
          message: "Insufficient stock ❌",
        });
      }
      product.stock -= quantity;
    } 
    else {
      return res.status(400).json({ message: "Invalid type" });
    }

    // save updated stock
    await product.save();

    // calculate total
    const totalAmount = quantity * pricePerUnit;

    // save transaction
    const transaction = await Transaction.create({
      type,
      productId,
      quantity,
      pricePerUnit,
      totalAmount,
      userId: req.user.id,
    });

    res.status(201).json({
      message: "Transaction successful",
      transaction,
      updatedStock: product.stock,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// 📄 GET TRANSACTIONS
exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    const filter = {
      userId: req.user.id,
    };

    // ✅ 1. Validate type
    if (type) {
      if (!["sale", "purchase"].includes(type)) {
        return res.status(400).json({
          message: "Invalid type (must be sale or purchase)",
        });
      }
      filter.type = type;
    }

    // ✅ 2. Validate dates
    let start, end;

    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start)) {
        return res.status(400).json({
          message: "Invalid startDate",
        });
      }
    }

    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end)) {
        return res.status(400).json({
          message: "Invalid endDate",
        });
      }
    }

    // ✅ 3. Apply date filter (flexible)
    if (start && end) {
      filter.date = { $gte: start, $lte: end };
    } else if (start) {
      filter.date = { $gte: start };
    } else if (end) {
      filter.date = { $lte: end };
    }

    // ✅ 4. Fetch data
    const transactions = await Transaction.find(filter)
      .populate("productId", "name category")
      .sort({ createdAt: -1 });

    res.json(transactions);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};