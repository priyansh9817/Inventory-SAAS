const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

// 📊 DASHBOARD WITH FILTER (FINAL)
exports.getDashboard = async (req, res) => {
  try {
    const { filter, startDate, endDate, branchId } = req.query;
    const userId = req.user.id;

    let dateFilter = {};
    const now = new Date();

    // ✅ PREDEFINED FILTERS
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

    // ✅ CUSTOM DATE
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      dateFilter = { $gte: start, $lte: end };
    }

    // ✅ BASE QUERY
    const query = {
      userId,
      $or: [
        { isDeleted: false },
        { isDeleted: { $exists: false } },
      ],
    };

    // 🔥 BRANCH FILTER
    if (branchId && branchId !== "all") {
      query.branchId = branchId;
    }

    // 🔥 DATE FILTER
    if (Object.keys(dateFilter).length > 0) {
      query.transactionDate = dateFilter; // 🔥 FIXED (use transactionDate)
    }

    // ✅ FETCH
    const transactions = await Transaction.find(query);

    let totalSales = 0;
    let totalPurchase = 0;
    let totalAmount = 0;

    const monthlyData = {};

    transactions.forEach((t) => {
      const month = new Date(t.transactionDate).toLocaleString("default", {
        month: "short",
      });

      if (!monthlyData[month]) {
        monthlyData[month] = {
          sales: 0,
          purchase: 0,
        };
      }

      if (t.type === "sale") {
        totalSales += t.totalAmount;
        monthlyData[month].sales += t.totalAmount;
      } else {
        totalPurchase += t.totalAmount;
        monthlyData[month].purchase += t.totalAmount;
      }

      totalAmount += t.totalAmount;
    });

    const chartData = Object.keys(monthlyData).map((m) => ({
      name: m,
      sales: monthlyData[m].sales,
      purchase: monthlyData[m].purchase,
      profit: monthlyData[m].sales - monthlyData[m].purchase,
    }));

    res.json({
      totalTransactions: transactions.length,
      totalSales,
      totalPurchase,
      profit: totalSales - totalPurchase,
      totalAmount,
      chartData, // 🔥 NEW
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getAnalytics = async (req, res) => {
  try {
    const { period, startDate, endDate, branchId } = req.query;
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
    // 🔥 BRANCH FILTER
    if (branchId && branchId !== "all") {
  match.branchId = new mongoose.Types.ObjectId(branchId);
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
    const { startDate, endDate,branchId } = req.query;
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
    // 🔥 BRANCH FILTER
    if (branchId && branchId !== "all") {
  match.branchId = new mongoose.Types.ObjectId(branchId);
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