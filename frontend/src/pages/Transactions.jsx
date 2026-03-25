import { useEffect, useState } from "react";
import API from "../api/axios";
import * as XLSX from "xlsx"; // For Excel export
import { saveAs } from "file-saver"; // For saving files

const Transactions = () => {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [type, setType] = useState("purchase");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [filterType, setFilterType] = useState("");

  // 📄 Fetch Products
  const fetchProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data);
  };

  // 📄 Fetch Transactions
  const fetchTransactions = async () => {
    let url = "/transactions";

    if (filterType) {
      url += `?type=${filterType}`;
    }

    const res = await API.get(url);
    setTransactions(res.data);
  };

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, []);

  // ➕ Add Transaction
  const handleAdd = async () => {
    if (!productId || !quantity || !price) {
      toast.error("All fields required");
      return;
    }

    try {
      await API.post("/transactions", {
        type,
        productId,
        quantity: Number(quantity),
        pricePerUnit: Number(price),
      });

      setQuantity("");
      setPrice("");

      await fetchTransactions(); // 🔥 update list
      await fetchProducts();     // 🔥 update stock

    } catch (error) {
      toast.error(error.response?.data?.message || "Error");
    }
  };

  const exportToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, "inventory-report.xlsx");
  };

 return (
  <div className="p-6">

    <h1 className="text-2xl font-bold mb-6">Transactions</h1>

    {/* ➕ Add Transaction */}
    <div className="mb-6 flex flex-wrap gap-3">

      {/* TYPE */}
      <select
        className="bg-[#111827] border border-gray-700 p-2 rounded text-gray-300 focus:ring-2 focus:ring-indigo-500"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="purchase">Purchase</option>
        <option value="sale">Sale</option>
      </select>

      {/* PRODUCT */}
      <select
        className="bg-[#111827] border border-gray-700 p-2 rounded text-gray-300 focus:ring-2 focus:ring-indigo-500"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
      >
        <option value="">Select Product</option>
        {products.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} (Stock: {p.stock})
          </option>
        ))}
      </select>

      {/* QUANTITY */}
      <input
        type="number"
        className="bg-[#111827] border border-gray-700 p-2 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
        placeholder="Enter quantity (e.g. 5)"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      {/* PRICE */}
      <input
        type="number"
        className="bg-[#111827] border border-gray-700 p-2 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
        placeholder={
          type === "sale"
            ? "Selling price (₹)"
            : "Purchase price (₹)"
        }
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      {/* ADD BUTTON */}
      <button
        onClick={handleAdd}
        className="bg-indigo-500 hover:bg-indigo-600 transition px-4 py-2 rounded text-white"
      >
        Add
      </button>
    </div>

    {/* 🔍 FILTER */}
    <div className="flex flex-wrap gap-3 mb-6">

      <select
        className="bg-[#111827] border border-gray-700 p-2 rounded text-gray-300"
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
      >
        <option value="">All</option>
        <option value="sale">Sales</option>
        <option value="purchase">Purchases</option>
      </select>

      <button
        onClick={fetchTransactions}
        className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded"
      >
        Apply Filter
      </button>

      <button
        onClick={() => exportToExcel(transactions)}
        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
      >
        Export Excel
      </button>
    </div>

    {/* 📄 TABLE */}
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border border-gray-800">

        <thead>
          <tr className="bg-[#1f2937] text-gray-300">
            <th className="p-3">Type</th>
            <th className="p-3">Product</th>
            <th className="p-3">Qty</th>
            <th className="p-3">Price</th>
            <th className="p-3">Total</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((t) => (
            <tr
              key={t._id}
              className="border-t border-gray-800 hover:bg-[#1f2937] transition"
            >
              <td className="p-3 capitalize">{t.type}</td>
              <td className="p-3">{t.productId?.name}</td>
              <td className="p-3">{t.quantity}</td>
              <td className="p-3">₹{t.pricePerUnit}</td>
              <td className="p-3 text-green-400">₹{t.totalAmount}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>

  </div>
);
};

export default Transactions;