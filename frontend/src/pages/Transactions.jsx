import { useEffect, useState } from "react";
import API from "../api/axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import { useContext } from "react";
import { BranchContext } from "../context/BranchContext";
const Transactions = () => {
  const { branchId } = useContext(BranchContext);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  

  const [type, setType] = useState("purchase");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [filterType, setFilterType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 📄 FETCH PRODUCTS
  const fetchProducts = async () => {
    if (!branchId) return;

    const res = await API.get(`/products?branchId=${branchId}`);
    setProducts(res.data);
  };

  // 📄 FETCH TRANSACTIONS
  const fetchTransactions = async () => {
    if (!branchId) return;

    try {
      const res = await API.get(`/transactions?branchId=${branchId}`);
      setTransactions(res.data);
    } catch {
      toast.error("Error fetching transactions");
    }
  };

  // 🔍 FILTER
  const applyFilter = async () => {
    try {
      const params = [`branchId=${branchId}`];

      if (filterType) params.push(`type=${filterType}`);
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);

      const url = `/transactions?${params.join("&")}`;

      const res = await API.get(url);
      setTransactions(res.data);

      if (res.data.length === 0) {
        toast.error("No data found ❌");
      }
    } catch {
      toast.error("Filter error ❌");
    }
  };

 useEffect(() => {
  if (branchId) {
    fetchProducts();
    fetchTransactions();
  }
}, [branchId]);

  // ➕ ADD
  const handleAdd = async () => {
    if (!productId || !quantity || !price) {
      toast.error("All fields required ❌");
      return;
    }

    try {
      await API.post("/transactions", {
        type,
        productId,
        quantity: Number(quantity),
        pricePerUnit: Number(price),
        transactionDate,
        branchId, // 🔥 IMPORTANT
      });

      toast.success("Transaction added ✅");

      setQuantity("");
      setPrice("");
      setStartDate("");
      setEndDate("");
      setFilterType("");

      await fetchTransactions();
      await fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error ❌");
    }
  };

  // 🗑 DELETE (SOFT)
 const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "⚠️ This will affect stock. Delete?"
  );

  if (!confirmDelete) return;

  try {
    setLoading(true);

    await API.delete(`/transactions/${id}?branchId=${branchId}`);

    // 🔥 UNDO TOAST
    toast.custom((t) => (
  <div className="bg-[#111827] text-white px-4 py-2 rounded shadow flex gap-3 items-center">
    <span>Deleted</span>
    <button
      onClick={async () => {
        await API.delete(`/transactions/${id}?branchId=${branchId}`);
        fetchTransactions();
        toast.dismiss(t.id);
      }}
      className="text-indigo-400"
    >
      Undo
    </button>
  </div>
));

    fetchTransactions();

  } catch (err) {
    toast.error("Delete failed ❌");
  } finally {
    setLoading(false);
  }
};
  // 📊 EXPORT
  const exportToExcel = () => {
    if (transactions.length === 0) {
      toast.error("No data to export ❌");
      return;
    }

    const data = transactions.map((t) => ({
      Type: t.type,
      Product: t.productId?.name,
      Quantity: t.quantity,
      Price: t.pricePerUnit,
      Total: t.totalAmount,
      "Transaction Date": new Date(t.transactionDate).toLocaleDateString(),
      "Entry Date": new Date(t.createdAt).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const blob = new Blob([buffer], { type: "application/octet-stream" });

    saveAs(blob, "transactions.xlsx");
  };

  return (
    <div className="p-3 sm:p-5 max-w-7xl mx-auto">

      <h1 className="text-lg sm:text-2xl font-bold mb-4">Transactions</h1>

      {/* ADD FORM */}
      <div className="bg-[#111827] p-4 rounded-xl mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 bg-[#020617] rounded text-sm w-full">
          <option value="purchase">Purchase</option>
          <option value="sale">Sale</option>
        </select>

        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="p-2 bg-[#020617] rounded text-sm w-full col-span-2 sm:col-span-1">
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>{p.name} ({p.stock})</option>
          ))}
        </select>

        <input type="number" placeholder="Qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="p-2 bg-[#020617] rounded text-sm w-full" />

        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="p-2 bg-[#020617] rounded text-sm w-full" />

        <input type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} className="p-2 bg-[#020617] rounded text-sm w-full" />

        <button onClick={handleAdd} className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded text-sm w-full col-span-2 sm:col-span-1">
          Add
        </button>
      </div>

      {/* FILTER */}
      <div className="mb-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="p-2 bg-[#020617] rounded text-sm">
          <option value="">All</option>
          <option value="sale">Sales</option>
          <option value="purchase">Purchases</option>
        </select>

        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 bg-[#020617] rounded text-sm" />

        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 bg-[#020617] rounded text-sm" />

        <button onClick={applyFilter} className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded text-sm">Apply</button>

        <button
          onClick={() => { setStartDate(""); setEndDate(""); setFilterType(""); fetchTransactions(); }}
          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm"
        >
          Clear
        </button>

        <button onClick={exportToExcel} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-sm">
          Export
        </button>
      </div>

      {/* TABLE - desktop */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1f2937] text-gray-300">
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Qty</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Txn Date</th>
              <th className="p-3 text-left">Entry</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id} className="border-t border-gray-800 hover:bg-[#1f2937] transition">
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    t.type === "sale" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                  }`}>{t.type}</span>
                </td>
                <td className="p-3">{t.productId?.name}</td>
                <td className="p-3">{t.quantity}</td>
                <td className="p-3">₹{t.pricePerUnit}</td>
                <td className="p-3 text-green-400 font-medium">₹{t.totalAmount}</td>
                <td className="p-3 text-gray-400">{new Date(t.transactionDate).toLocaleDateString()}</td>
                <td className="p-3 text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <button onClick={() => handleDelete(t._id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CARDS - mobile */}
      <div className="sm:hidden flex flex-col gap-3">
        {transactions.map((t) => (
          <div key={t._id} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                t.type === "sale" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
              }`}>{t.type}</span>
              <button onClick={() => handleDelete(t._id)} className="text-red-400 text-xs">Delete</button>
            </div>
            <p className="text-white font-medium text-sm">{t.productId?.name}</p>
            <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-gray-400">
              <span>Qty: <span className="text-white">{t.quantity}</span></span>
              <span>Price: <span className="text-white">₹{t.pricePerUnit}</span></span>
              <span>Total: <span className="text-green-400 font-medium">₹{t.totalAmount}</span></span>
              <span>Date: <span className="text-white">{new Date(t.transactionDate).toLocaleDateString()}</span></span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Transactions;