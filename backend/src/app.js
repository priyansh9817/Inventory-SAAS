const express = require("express");
const cors = require("cors");

const app = express();

// ✅ FIRST: CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://inventory-saas-wheat.vercel.app"
  ],
  credentials: true,
}));

// ✅ SECOND: Body parser
app.use(express.json());

// routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

module.exports = app;