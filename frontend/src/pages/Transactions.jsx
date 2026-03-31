import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
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
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0]);

  const [productSearch, setProductSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [filterType, setFilterType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const fetchProducts = async () => {
    if (!branchId) return;
    const res = await API.get(`/products?branchId=${branchId}`);
    setProducts(res.data);
  };

  const fetchTransactions = async () => {
    if (!branchId) return;
    try {
      setLoading(true);
      const res = await API.get(`/transactions?branchId=${branchId}`);
      setTransactions(res.data);
    } catch {
      toast.error("Error fetching transactions");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = async () => {
    try {
      const params = [`branchId=${branchId}`];
      if (filterType) params.push(`type=${filterType}`);
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      const res = await API.get(`/transactions?${params.join("&")}`);
      setTransactions(res.data);
      if (res.data.length === 0) toast.error("No data found ❌");
    } catch {
      toast.error("Filter error ❌");
    }
  };

  useEffect(() => {
    if (branchId) { fetchProducts(); fetchTransactions(); }
  }, [branchId]);

  const handleAdd = async () => {
    if (!productId || !quantity || !price) { toast.error("All fields required ❌"); return; }
    try {
      await API.post("/transactions", {
        type, productId,
        quantity: Number(quantity),
        pricePerUnit: Number(price),
        transactionDate, branchId,
      });
      toast.success("Transaction added ✅");
      setQuantity(""); setPrice(""); setProductId(""); setProductSearch("");
      setStartDate(""); setEndDate(""); setFilterType("");
      await fetchTransactions(); await fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error ❌");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ This will affect stock. Delete?")) return;
    try {
      setLoading(true);
      await API.delete(`/transactions/${id}?branchId=${branchId}`);
      toast.custom((t) => (
        <div className="bg-[#111827] border border-gray-700 text-white px-4 py-2 rounded-xl shadow-xl flex gap-3 items-center">
          <span className="text-sm">Transaction deleted</span>
          <button
            onClick={async () => {
              await API.put(`/transactions/restore/${id}`);
              fetchTransactions();
              toast.dismiss(t.id);
            }}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
          >Undo</button>
        </div>
      ));
      fetchTransactions();
    } catch {
      toast.error("Delete failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (transactions.length === 0) { toast.error("No data to export ❌"); return; }
    const data = transactions.map((t) => ({
      Type: t.type, Product: t.productId?.name,
      Quantity: t.quantity, Price: t.pricePerUnit, Total: t.totalAmount,
      "Transaction Date": new Date(t.transactionDate).toLocaleDateString(),
      "Entry Date": new Date(t.createdAt).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), "transactions.xlsx");
  };

  const totalSales = transactions.filter(t => t.type === "sale").reduce((s, t) => s + t.totalAmount, 0);
  const totalPurchase = transactions.filter(t => t.type === "purchase").reduce((s, t) => s + t.totalAmount, 0);

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto animate-fadeIn" onClick={() => setShowDropdown(false)}>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Transactions</h1>
          <p className="text-xs text-gray-500 mt-0.5">{transactions.length} records found</p>
        </div>
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-500 active:scale-95 transition-all px-4 py-2 rounded-xl text-sm font-medium shadow-lg hover:shadow-green-500/25 whitespace-nowrap self-start sm:self-auto"
        >
          ↓ Export Excel
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total", value: transactions.length, color: "text-white", bg: "from-gray-800 to-gray-900", border: "hover:border-gray-600", icon: "🧾" },
          { label: "Sales", value: `₹${totalSales}`, color: "text-green-400", bg: "from-green-900/30 to-gray-900", border: "hover:border-green-500/40", icon: "📈" },
          { label: "Purchase", value: `₹${totalPurchase}`, color: "text-blue-400", bg: "from-blue-900/30 to-gray-900", border: "hover:border-blue-500/40", icon: "🛒" },
        ].map((item) => (
          <div key={item.label} className={`bg-gradient-to-br ${item.bg} border border-gray-800 ${item.border} rounded-2xl p-3 sm:p-4 hover:scale-[1.03] hover:shadow-lg transition-all duration-200 cursor-default group`}>
            <div className="flex justify-between items-start">
              <p className="text-gray-400 text-xs font-medium">{item.label}</p>
              <span className="text-base group-hover:scale-125 transition-transform duration-200">{item.icon}</span>
            </div>
            <p className={`${item.color} text-base sm:text-xl font-bold mt-2 tracking-tight`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* ADD FORM */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] border border-gray-800 hover:border-indigo-500/20 rounded-2xl p-4 mb-5 shadow-lg transition-all duration-300" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">New Transaction</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={`p-2.5 bg-[#020617] border rounded-xl text-sm w-full focus:outline-none transition-colors ${
              type === "sale" ? "border-green-500/40 text-green-400 focus:border-green-500" : "border-blue-500/40 text-blue-400 focus:border-blue-500"
            }`}
          >
            <option value="purchase">Purchase</option>
            <option value="sale">Sale</option>
          </select>

          <div className="relative col-span-2 sm:col-span-1">
            <input
              type="text"
              placeholder="Search product..."
              value={productSearch}
              onChange={(e) => { setProductSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              className="p-2.5 bg-[#020617] border border-gray-700 focus:border-indigo-500 focus:outline-none rounded-xl text-sm w-full transition-colors placeholder-gray-600"
            />
            {showDropdown && filteredProducts.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 bg-[#0f172a] border border-gray-700 rounded-xl mt-1 max-h-48 overflow-y-auto shadow-2xl">
                {filteredProducts.map((p) => (
                  <div
                    key={p._id}
                    onMouseDown={() => { setProductId(p._id); setProductSearch(p.name); setShowDropdown(false); }}
                    className="px-3 py-2.5 text-sm hover:bg-indigo-500/15 cursor-pointer flex justify-between items-center border-b border-gray-800/50 last:border-0 transition-colors"
                  >
                    <span className="text-white">{p.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      p.stock > 10 ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
            {showDropdown && productSearch && filteredProducts.length === 0 && (
              <div className="absolute z-50 top-full left-0 right-0 bg-[#0f172a] border border-gray-700 rounded-xl mt-1 px-3 py-3 text-sm text-gray-500 text-center">
                No products found
              </div>
            )}
          </div>

          <input type="number" placeholder="Quantity" value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="p-2.5 bg-[#020617] border border-gray-700 focus:border-indigo-500 focus:outline-none rounded-xl text-sm w-full transition-colors placeholder-gray-600"
          />

          <input type="number" placeholder="Price / Unit" value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="p-2.5 bg-[#020617] border border-gray-700 focus:border-indigo-500 focus:outline-none rounded-xl text-sm w-full transition-colors placeholder-gray-600"
          />

          <input type="date" value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="p-2.5 bg-[#020617] border border-gray-700 focus:border-indigo-500 focus:outline-none rounded-xl text-sm w-full transition-colors"
          />

          <button
            onClick={handleAdd}
            className="bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all px-4 py-2.5 rounded-xl text-sm font-semibold w-full col-span-2 sm:col-span-1 shadow-lg hover:shadow-indigo-500/25"
          >
            + Add
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] border border-gray-800 rounded-2xl p-4 mb-5 shadow">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Filter</p>
        <div className="flex flex-wrap gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 bg-[#020617] border border-gray-700 focus:border-indigo-500 focus:outline-none rounded-xl text-sm transition-colors"
          >
            <option value="">All Types</option>
            <option value="sale">Sales</option>
            <option value="purchase">Purchases</option>
          </select>

          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="p-2 bg-[#020617] border border-gray-700 focus:border-indigo-500 focus:outline-none rounded-xl text-sm transition-colors"
          />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="p-2 bg-[#020617] border border-gray-700 focus:border-indigo-500 focus:outline-none rounded-xl text-sm transition-colors"
          />

          <button onClick={applyFilter}
            className="bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all px-4 py-2 rounded-xl text-sm font-medium shadow hover:shadow-indigo-500/20"
          >Apply</button>

          <button
            onClick={() => { setStartDate(""); setEndDate(""); setFilterType(""); fetchTransactions(); }}
            className="bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all px-4 py-2 rounded-xl text-sm border border-gray-700"
          >Clear</button>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
        </div>
      ) : (
        <>
          {/* TABLE - desktop */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-800 shadow-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0f172a] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 text-left">Type</th>
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Qty</th>
                  <th className="p-4 text-left">Price</th>
                  <th className="p-4 text-left">Total</th>
                  <th className="p-4 text-left">Txn Date</th>
                  <th className="p-4 text-left">Entry</th>
                  <th className="p-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <p className="text-3xl mb-2">📭</p>
                      <p>No transactions found</p>
                    </td>
                  </tr>
                ) : transactions.map((t) => (
                  <tr key={t._id} className="border-t border-gray-800/60 hover:bg-[#0f172a] transition-colors duration-150 group">
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        t.type === "sale"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>{t.type}</span>
                    </td>
                    <td className="p-4 font-medium text-white group-hover:text-indigo-300 transition-colors">{t.productId?.name}</td>
                    <td className="p-4 text-gray-300">{t.quantity}</td>
                    <td className="p-4 text-gray-300">₹{t.pricePerUnit}</td>
                    <td className="p-4 font-semibold text-green-400">₹{t.totalAmount}</td>
                    <td className="p-4 text-gray-500">{new Date(t.transactionDate).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="bg-red-500/10 hover:bg-red-500/25 active:scale-95 text-red-400 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CARDS - mobile */}
          <div className="sm:hidden flex flex-col gap-3">
            {transactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-3xl mb-2">📭</p>
                <p>No transactions found</p>
              </div>
            )}
            {transactions.map((t) => (
              <div key={t._id} className="bg-gradient-to-br from-[#0f172a] to-[#020617] border border-gray-800 hover:border-indigo-500/20 rounded-2xl p-4 shadow transition-all duration-200">
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    t.type === "sale"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}>{t.type}</span>
                  <button
                    onClick={() => handleDelete(t._id)}
                    className="bg-red-500/10 hover:bg-red-500/25 active:scale-95 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-lg text-xs transition-all"
                  >Delete</button>
                </div>
                <p className="text-white font-semibold mb-3">{t.productId?.name}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "Quantity", value: t.quantity, color: "text-white" },
                    { label: "Price", value: `₹${t.pricePerUnit}`, color: "text-white" },
                    { label: "Total", value: `₹${t.totalAmount}`, color: "text-green-400 font-semibold" },
                    { label: "Date", value: new Date(t.transactionDate).toLocaleDateString(), color: "text-gray-300" },
                  ].map((s) => (
                    <div key={s.label} className="bg-[#111827] border border-gray-800 rounded-xl p-2.5">
                      <p className="text-gray-500 mb-0.5">{s.label}</p>
                      <p className={s.color}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Transactions;
