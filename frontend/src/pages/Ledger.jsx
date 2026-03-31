import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { BranchContext } from "../context/BranchContext";
import toast from "react-hot-toast";

const Ledger = () => {
  const { branchId } = useContext(BranchContext);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (branchId) fetchProducts();
  }, [branchId]);

  const fetchProducts = async () => {
    const res = await API.get(`/products?branchId=${branchId}`);
    setProducts(res.data);
  };

  const fetchLedger = async () => {
    if (!selectedProduct) { toast.error("Select a product first ❌"); return; }
    try {
      setLoading(true);
      const res = await API.get(`/transactions/ledger/${selectedProduct}?branchId=${branchId}`);
      setLedger(res.data);
      if (res.data.length === 0) toast.error("No ledger data found ❌");
    } catch {
      toast.error("Failed to load ledger ❌");
    } finally {
      setLoading(false);
    }
  };

  const totalIn = ledger.reduce((s, l) => s + (l.qtyIn || 0), 0);
  const totalOut = ledger.reduce((s, l) => s + (l.qtyOut || 0), 0);
  const finalBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;
  const totalValue = ledger.reduce((s, l) => s + (l.total || 0), 0);

  const selectedProductName = products.find(p => p._id === selectedProduct)?.name;

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto animate-fadeIn">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Stock Ledger</h1>
        <p className="text-xs text-gray-500 mt-0.5">Track stock movement per product</p>
      </div>

      {/* PRODUCT SELECTOR */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] border border-gray-800 hover:border-indigo-500/20 rounded-2xl p-4 mb-6 shadow-lg transition-all duration-300">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Select Product</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedProduct}
            onChange={(e) => { setSelectedProduct(e.target.value); setLedger([]); }}
            className="flex-1 bg-[#020617] border border-gray-700 focus:border-indigo-500 focus:outline-none p-2.5 rounded-xl text-sm text-white transition-colors"
          >
            <option value="">-- Choose a product --</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>
            ))}
          </select>
          <button
            onClick={fetchLedger}
            className="bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-indigo-500/25 whitespace-nowrap"
          >
            View Ledger
          </button>
        </div>
      </div>

      {/* STAT CARDS - show only when ledger loaded */}
      {ledger.length > 0 && (
        <>
          <p className="text-xs uppercase tracking-widest text-gray-600 mb-2">
            Summary — {selectedProductName}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total In", value: totalIn, color: "text-green-400", bg: "from-green-900/30 to-gray-900", border: "hover:border-green-500/40", icon: "📥" },
              { label: "Total Out", value: totalOut, color: "text-red-400", bg: "from-red-900/30 to-gray-900", border: "hover:border-red-500/40", icon: "📤" },
              { label: "Balance", value: finalBalance, color: "text-indigo-400", bg: "from-indigo-900/30 to-gray-900", border: "hover:border-indigo-500/40", icon: "⚖️" },
              { label: "Total Value", value: `₹${totalValue}`, color: "text-yellow-400", bg: "from-yellow-900/20 to-gray-900", border: "hover:border-yellow-500/40", icon: "💰" },
            ].map((item) => (
              <div key={item.label} className={`bg-gradient-to-br ${item.bg} border border-gray-800 ${item.border} rounded-2xl p-3 sm:p-4 hover:scale-[1.03] hover:shadow-lg transition-all duration-200 cursor-default group`}>
                <div className="flex justify-between items-start">
                  <p className="text-gray-400 text-xs font-medium">{item.label}</p>
                  <span className="text-base group-hover:scale-125 transition-transform duration-200">{item.icon}</span>
                </div>
                <p className={`${item.color} text-lg sm:text-2xl font-bold mt-2 tracking-tight`}>{item.value}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
        </div>
      ) : ledger.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-5xl mb-4">📒</p>
          <p className="text-lg font-medium text-gray-400">No ledger data</p>
          <p className="text-sm mt-1">Select a product and click View Ledger</p>
        </div>
      ) : (
        <>
          {/* TABLE - desktop */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-800 shadow-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0f172a] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 text-left">#</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Type</th>
                  <th className="p-4 text-left">In</th>
                  <th className="p-4 text-left">Out</th>
                  <th className="p-4 text-left">Balance</th>
                  <th className="p-4 text-left">Price</th>
                  <th className="p-4 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((l, i) => (
                  <tr key={i} className="border-t border-gray-800/60 hover:bg-[#0f172a] transition-colors duration-150 group">
                    <td className="p-4 text-gray-600 text-xs">{i + 1}</td>
                    <td className="p-4 text-gray-400">{new Date(l.date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        l.type === "purchase"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-green-500/10 text-green-400 border-green-500/20"
                      }`}>{l.type}</span>
                    </td>
                    <td className="p-4">
                      {l.qtyIn ? (
                        <span className="text-green-400 font-semibold">+{l.qtyIn}</span>
                      ) : <span className="text-gray-700">—</span>}
                    </td>
                    <td className="p-4">
                      {l.qtyOut ? (
                        <span className="text-red-400 font-semibold">-{l.qtyOut}</span>
                      ) : <span className="text-gray-700">—</span>}
                    </td>
                    <td className="p-4">
                      <span className="text-indigo-400 font-bold">{l.balance}</span>
                    </td>
                    <td className="p-4 text-gray-300">₹{l.price}</td>
                    <td className="p-4 text-yellow-400 font-semibold">₹{l.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CARDS - mobile */}
          <div className="md:hidden flex flex-col gap-3">
            {ledger.map((l, i) => (
              <div key={i} className="bg-gradient-to-br from-[#0f172a] to-[#020617] border border-gray-800 hover:border-indigo-500/20 rounded-2xl p-4 shadow transition-all duration-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-500 text-xs">#{i + 1} · {new Date(l.date).toLocaleDateString()}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    l.type === "purchase"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-green-500/10 text-green-400 border-green-500/20"
                  }`}>{l.type}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "In", value: l.qtyIn ? `+${l.qtyIn}` : "—", color: l.qtyIn ? "text-green-400 font-semibold" : "text-gray-600" },
                    { label: "Out", value: l.qtyOut ? `-${l.qtyOut}` : "—", color: l.qtyOut ? "text-red-400 font-semibold" : "text-gray-600" },
                    { label: "Balance", value: l.balance, color: "text-indigo-400 font-bold" },
                    { label: "Total", value: `₹${l.total}`, color: "text-yellow-400 font-semibold" },
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

export default Ledger;
