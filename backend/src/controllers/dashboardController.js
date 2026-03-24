const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

// 📊 DASHBOARD WITH FILTER (FINAL)
exports.getDashboard = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;

    const userId = req.user.id;

    let dateFilter = {};
    const now = new Date();

    // ✅ 1. PREDEFINED FILTERS
    if (filter === "daily") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      dateFilter = { $gte: start };

    } else if (filter === "weekly") {
      const start = new Date();
      start.setDate(now.getDate() - 7);
      dateFilter = { $gte: start };

    } else if (filter === "monthly") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { $gte: start };

    } else if (filter === "quarterly") {
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      dateFilter = { $gte: start };
    }

    // ✅ 2. CUSTOM DATE FILTER
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({
          message: "Invalid date format",
        });
      }

      dateFilter = {
        $gte: start,
        $lte: end,
      };
    }

    // ✅ 3. BUILD QUERY
    const query = {
      userId: userId,
    };

    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter; // 🔥 important fix
    }

    // ✅ 4. FETCH DATA (RELIABLE METHOD)
    const transactions = await Transaction.find(query);

    let totalSales = 0;
    let totalPurchase = 0;

    transactions.forEach((t) => {
      if (t.type === "sale") {
        totalSales += t.totalAmount;
      } else if (t.type === "purchase") {
        totalPurchase += t.totalAmount;
      }
    });

    const totalTransactions = transactions.length;
    const profit = totalSales - totalPurchase;

    res.json({
      totalTransactions,
      totalSales,
      totalPurchase,
      profit,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.getAnalytics = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    const userId = req.user.id;

    let groupFormat;

    // 📊 GROUPING FORMAT
    if (period === "weekly") {
      groupFormat = { $dayOfWeek: "$createdAt" };
    } else if (period === "monthly") {
      groupFormat = { $month: "$createdAt" };
    } else if (period === "yearly") {
      groupFormat = { $year: "$createdAt" };
    } else {
      groupFormat = { $month: "$createdAt" };
    }

    // 📅 DATE FILTER (OPTIONAL)
    let match = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const data = await Transaction.aggregate([
      { $match: match },

      {
        $group: {
          _id: groupFormat,

          totalSales: {
            $sum: {
              $cond: [{ $eq: ["$type", "sale"] }, "$totalAmount", 0],
            },
          },

          totalPurchase: {
            $sum: {
              $cond: [{ $eq: ["$type", "purchase"] }, "$totalAmount", 0],
            },
          },
        },
      },

      // 🔥 ADD PROFIT CALCULATION
      {
        $addFields: {
          profit: {
            $subtract: ["$totalSales", "$totalPurchase"],
          },
        },
      },

      { $sort: { _id: 1 } },
    ]);

    res.json(data);

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// 📊 PRODUCT ANALYTICS (TOP SELLING PRODUCTS)
// 📊 PRODUCT ANALYTICS (TOP SELLING PRODUCTS - FINAL)
exports.getProductAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    // 📅 OPTIONAL DATE FILTER
    let match = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const data = await Transaction.aggregate([
      { $match: match },

      {
        $group: {
          _id: "$productId",

          totalSales: {
            $sum: {
              $cond: [
                { $eq: ["$type", "sale"] },
                "$totalAmount",
                0,
              ],
            },
          },
        },
      },

      // ❌ REMOVE PRODUCTS WITH ZERO SALES
      {
        $match: {
          totalSales: { $gt: 0 },
        },
      },

      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },

      { $unwind: "$product" },

      {
        $project: {
          name: "$product.name",
          sales: "$totalSales", // 🔥 rename for frontend
        },
      },

      { $sort: { sales: -1 } },

      // 🔥 TOP 5 ONLY
      { $limit: 5 },
    ]);

    console.log("Product Analytics:", data); // 🔥 debug

    res.json(data);

  } catch (error) {
    console.error("Product Analytics Error:", error);
    res.status(500).json({ message: error.message });
  }
};