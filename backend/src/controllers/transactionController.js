const Transaction = require("../models/Transaction");
const Product = require("../models/Product");

// ➕ ADD TRANSACTION
exports.addTransaction = async (req, res) => {
  try {
    const {
      type,
      productId,
      quantity,
      pricePerUnit,
      transactionDate, // 🔥 NEW
    } = req.body;

    // ✅ validation
    if (!type || !productId || !quantity || !pricePerUnit) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (quantity <= 0 || pricePerUnit <= 0) {
      return res.status(400).json({ message: "Invalid values" });
    }

    // ✅ find product
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

    await product.save();

    // 🔥 total calculation
    const totalAmount = quantity * pricePerUnit;

    // 🔥 save transaction
    const transaction = await Transaction.create({
      type,
      productId,
      quantity,
      pricePerUnit,
      totalAmount,

      // ✅ USER SELECTED DATE
      transactionDate: transactionDate
        ? new Date(transactionDate)
        : new Date(),

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
      isDeleted: false, // 🔥 IMPORTANT (hide deleted)
      isDeleted: { $exists: false } // 🔥 IMPORTANT F
    };

    // ✅ TYPE FILTER
    if (type) {
      if (!["sale", "purchase"].includes(type)) {
        return res.status(400).json({
          message: "Invalid type",
        });
      }
      filter.type = type;
    }

    // ✅ DATE FILTER (SAFE FORMAT)
    if (startDate || endDate) {
      filter.transactionDate = {};

      if (startDate) {
        const start = new Date(startDate + "T00:00:00.000Z");
        if (isNaN(start)) {
          return res.status(400).json({ message: "Invalid startDate" });
        }
        filter.transactionDate.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate + "T23:59:59.999Z");
        if (isNaN(end)) {
          return res.status(400).json({ message: "Invalid endDate" });
        }
        filter.transactionDate.$lte = end;
      }
    }

    // ✅ FETCH DATA
    const transactions = await Transaction.find(filter)
      .populate("productId", "name category")
      .sort({ transactionDate: -1 });

    res.json(transactions);

  } catch (error) {
    console.error("GET TRANSACTIONS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// get ledger by product
exports.getLedger = async (req, res) => {
  try {
    const { productId } = req.params;

    const transactions = await Transaction.find({
      productId,
      userId: req.user.id,
    }).sort({ transactionDate: 1 });

    let balance = 0;

    const ledger = transactions.map((t) => {
      let qtyIn = 0;
      let qtyOut = 0;

      if (t.type === "purchase") {
        qtyIn = t.quantity;
        balance += qtyIn;
      } else {
        qtyOut = t.quantity;
        balance -= qtyOut;
      }

      return {
        date: t.transactionDate,
        type: t.type,
        qtyIn,
        qtyOut,
        balance,
        price: t.pricePerUnit,
        total: t.totalAmount,
      };
    });

    res.json(ledger);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SOFT DELETE API (🔥 REVERSE STOCK + HIDE TRANSACTION)

exports.softDeleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user.id,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } }, // 🔥 FIX
      ],
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    const product = await Product.findById(transaction.productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // 🔥 REVERSE STOCK
    if (transaction.type === "purchase") {
      product.stock -= transaction.quantity;
    } else {
      product.stock += transaction.quantity;
    }

    await product.save();

    // 🔥 SOFT DELETE
    transaction.isDeleted = true;
    await transaction.save();

    res.json({
      message: "Transaction deleted safely ✅",
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};