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

  const [productSearch, setProductSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedProduct = products.find((p) => p._id === productId);
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
      setProductId("");
      setProductSearch("");

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
    <div className="p-3 sm:p-5 max-w-7xl mx-auto" onClick={() => setShowDropdown(false)}>

      <h1 className="text-lg sm:text-2xl font-bold mb-5">Transactions</h1>

      {/* ADD FORM */}
      <div className="bg-[#0f172a] border border-gray-800 p-4 rounded-xl mb-5 shadow">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">New Transaction</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

          {/* TYPE */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="p-2 bg-[#020617] border border-gray-700 rounded-lg text-sm w-full focus:border-indigo-500 focus:outline-none"
          >
            <option value="purchase">Purchase</option>
            <option value="sale">Sale</option>
          </select>

          {/* SEARCHABLE PRODUCT */}
          <div className="relative col-span-2 sm:col-span-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              placeholder="Search product..."
              value={productSearch}
              onChange={(e) => { setProductSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              className="p-2 bg-[#020617] border border-gray-700 rounded-lg text-sm w-full focus:border-indigo-500 focus:outline-none"
            />
            {showDropdown && filteredProducts.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 bg-[#1f2937] border border-gray-700 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-xl">
                {filteredProducts.map((p) => (
                  <div
                    key={p._id}
                    onMouseDown={() => { setProductId(p._id); setProductSearch(p.name); setShowDropdown(false); }}
                    className="px-3 py-2 text-sm hover:bg-indigo-500/20 cursor-pointer flex justify-between items-center"
                  >
                    <span>{p.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      p.stock > 10 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>Stock: {p.stock}</span>
                  </div>
                ))}
              </div>
            )}
            {showDropdown && productSearch && filteredProducts.length === 0 && (
              <div className="absolute z-50 top-full left-0 right-0 bg-[#1f2937] border border-gray-700 rounded-lg mt-1 px-3 py-2 text-sm text-gray-400">
                No products found
              </div>
            )}
          </div>

          {/* QTY */}
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="p-2 bg-[#020617] border border-gray-700 rounded-lg text-sm w-full focus:border-indigo-500 focus:outline-none"
          />

          {/* PRICE */}
          <input
            type="number"
            placeholder="Price / Unit"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="p-2 bg-[#020617] border border-gray-700 rounded-lg text-sm w-full focus:border-indigo-500 focus:outline-none"
          />

          {/* DATE */}
          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="p-2 bg-[#020617] border border-gray-700 rounded-lg text-sm w-full focus:border-indigo-500 focus:outline-none"
          />

          {/* ADD BUTTON */}
          <button
            onClick={handleAdd}
            className="bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition px-4 py-2 rounded-lg text-sm font-medium w-full col-span-2 sm:col-span-1"
          >
            + Add
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-[#0f172a] border border-gray-800 p-4 rounded-xl mb-5 shadow">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Filter</p>
        <div className="flex flex-wrap gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 bg-[#020617] border border-gray-700 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="sale">Sales</option>
            <option value="purchase">Purchases</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 bg-[#020617] border border-gray-700 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 bg-[#020617] border border-gray-700 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
          />

          <button onClick={applyFilter} className="bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition px-4 py-2 rounded-lg text-sm font-medium">
            Apply
          </button>

          <button
            onClick={() => { setStartDate(""); setEndDate(""); setFilterType(""); fetchTransactions(); }}
            className="bg-gray-700 hover:bg-gray-600 active:scale-95 transition px-4 py-2 rounded-lg text-sm"
          >
            Clear
          </button>

          <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-500 active:scale-95 transition px-4 py-2 rounded-lg text-sm font-medium ml-auto">
            Export Excel
          </button>
        </div>
      </div>

      {/* TABLE - desktop */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-800 shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1f2937] text-gray-400 text-xs uppercase tracking-wider">
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
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">No transactions found</td>
              </tr>
            ) : transactions.map((t) => (
              <tr key={t._id} className="border-t border-gray-800 hover:bg-[#1f2937] transition">
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    t.type === "sale" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                  }`}>{t.type}</span>
                </td>
                <td className="p-3 font-medium">{t.productId?.name}</td>
                <td className="p-3 text-gray-300">{t.quantity}</td>
                <td className="p-3 text-gray-300">₹{t.pricePerUnit}</td>
                <td className="p-3 text-green-400 font-semibold">₹{t.totalAmount}</td>
                <td className="p-3 text-gray-400">{new Date(t.transactionDate).toLocaleDateString()}</td>
                <td className="p-3 text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(t._id)}
                    className="bg-red-500/10 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded text-xs transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CARDS - mobile */}
      <div className="sm:hidden flex flex-col gap-3">
        {transactions.length === 0 && (
          <p className="text-center text-gray-500 py-6">No transactions found</p>
        )}
        {transactions.map((t) => (
          <div key={t._id} className="bg-[#0f172a] border border-gray-800 rounded-xl p-4 shadow">
            <div className="flex justify-between items-center mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                t.type === "sale" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
              }`}>{t.type}</span>
              <button
                onClick={() => handleDelete(t._id)}
                className="bg-red-500/10 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded text-xs transition"
              >
                Delete
              </button>
            </div>
            <p className="text-white font-semibold text-sm mb-2">{t.productId?.name}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#111827] rounded-lg p-2">
                <p className="text-gray-400">Quantity</p>
                <p className="text-white font-medium">{t.quantity}</p>
              </div>
              <div className="bg-[#111827] rounded-lg p-2">
                <p className="text-gray-400">Price</p>
                <p className="text-white font-medium">₹{t.pricePerUnit}</p>
              </div>
              <div className="bg-[#111827] rounded-lg p-2">
                <p className="text-gray-400">Total</p>
                <p className="text-green-400 font-semibold">₹{t.totalAmount}</p>
              </div>
              <div className="bg-[#111827] rounded-lg p-2">
                <p className="text-gray-400">Date</p>
                <p className="text-white font-medium">{new Date(t.transactionDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Transactions;