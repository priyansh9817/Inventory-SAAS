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

    // ✅ DATE FILTER
    let start, end;

    if (startDate) {
      start = new Date(startDate);
    }

    if (endDate) {
      end = new Date(endDate);
    }

    if (start && end) {
      filter.transactionDate = { $gte: start, $lte: end };
    } else if (start) {
      filter.transactionDate = { $gte: start };
    } else if (end) {
      filter.transactionDate = { $lte: end };
    }

    // ✅ FETCH
    const transactions = await Transaction.find(filter)
      .populate("productId", "name category")
      .sort({ transactionDate: -1 });

    // 🔥 FINAL FIX
    res.json(transactions);

  } catch (error) {
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