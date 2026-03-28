const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema({
  action: String,
  transactionId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  message: String,
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", auditSchema);