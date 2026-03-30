const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["sale", "purchase"],
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    pricePerUnit: {
      type: Number,
      required: true,
      min: 1,
    },

    totalAmount: {
      type: Number,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    transactionDate: {
  type: Date, // 🔥 user selected date
},

createdAt: {
  type: Date,
  default: Date.now, // 🔥 system date (already hota hai)
},
isDeleted: {
  type: Boolean,
  default: false,
},
branchId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Branch",
  required: true,
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);