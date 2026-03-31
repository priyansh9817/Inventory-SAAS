import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { BranchContext } from "../context/BranchContext";

const DeletedTransactions = () => {
  const { branchId } = useContext(BranchContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDeleted = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/transactions/deleted?branchId=${branchId}`);
      setTransactions(res.data);
    } catch {
      toast.error("Failed to load deleted data ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (branchId) fetchDeleted();
  }, [branchId]);

  const handleRestore = async (id) => {
    try {
      await API.put(`/transactions/restore/${id}`);
      toast.success("Restored successfully ♻️");
      fetchDeleted();
    } catch {
      toast.error("Restore failed ❌");
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm("⚠️ This will permanently delete data. Continue?")) return;
    const secret = prompt("Enter secret key:");
    if (!secret) return;
    try {
      await API.delete(`/transactions/permanent/${id}`, {
        data: { secret },
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Deleted permanently 💀");
      fetchDeleted();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error ❌");
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto animate-fadeIn">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            🗑 Recycle Bin
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">{transactions.length} deleted transactions</p>
        </div>
      </div>

      {/* STAT CARD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Deleted Items", value: transactions.length, color: "text-white", bg: "from-gray-800 to-gray-900", border: "hover:border-gray-600", icon: "🗑" },
          { label: "Sales Deleted", value: transactions.filter(t => t.type === "sale").length, color: "text-green-400", bg: "from-green-900/30 to-gray-900", border: "hover:border-green-500/40", icon: "📈" },
          { label: "Purchase Deleted", value: transactions.filter(t => t.type === "purchase").length, color: "text-blue-400", bg: "from-blue-900/30 to-gray-900", border: "hover:border-blue-500/40", icon: "🛒" },
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

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-red-500 rounded-full"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-5xl mb-4">✅</p>
          <p className="text-lg font-medium text-gray-400">Recycle bin is empty</p>
          <p className="text-sm mt-1">No deleted transactions found</p>
        </div>
      ) : (
        <>
          {/* TABLE - desktop */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-800 shadow-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0f172a] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 text-left">#</th>
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Type</th>
                  <th className="p-4 text-left">Qty</th>
                  <th className="p-4 text-left">Total</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={t._id} className="border-t border-gray-800/60 hover:bg-[#0f172a] transition-colors duration-150 group">
                    <td className="p-4 text-gray-600 text-xs">{i + 1}</td>
                    <td className="p-4 font-medium text-white group-hover:text-red-300 transition-colors">{t.productId?.name}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        t.type === "sale"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>{t.type}</span>
                    </td>
                    <td className="p-4 text-gray-300">{t.quantity}</td>
                    <td className="p-4 text-gray-300">₹{t.totalAmount}</td>
                    <td className="p-4 text-gray-500">{new Date(t.transactionDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestore(t._id)}
                          className="bg-green-500/10 hover:bg-green-500/25 active:scale-95 text-green-400 border border-green-500/20 hover:border-green-500/40 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        >
                          ♻️ Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(t._id)}
                          className="bg-red-500/10 hover:bg-red-500/25 active:scale-95 text-red-400 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        >
                          💀 Delete Forever
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CARDS - mobile */}
          <div className="md:hidden flex flex-col gap-3">
            {transactions.map((t) => (
              <div key={t._id} className="bg-gradient-to-br from-[#0f172a] to-[#020617] border border-gray-800 hover:border-red-500/20 rounded-2xl p-4 shadow transition-all duration-200 group">

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-white font-semibold group-hover:text-red-300 transition-colors">{t.productId?.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{new Date(t.transactionDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    t.type === "sale"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}>{t.type}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-[#111827] border border-gray-800 rounded-xl p-2.5">
                    <p className="text-gray-500 mb-0.5">Quantity</p>
                    <p className="text-white font-medium">{t.quantity}</p>
                  </div>
                  <div className="bg-[#111827] border border-gray-800 rounded-xl p-2.5">
                    <p className="text-gray-500 mb-0.5">Total</p>
                    <p className="text-white font-medium">₹{t.totalAmount}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(t._id)}
                    className="flex-1 bg-green-500/10 hover:bg-green-500/25 active:scale-95 text-green-400 border border-green-500/20 py-2 rounded-xl text-xs font-medium transition-all"
                  >
                    ♻️ Restore
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(t._id)}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/25 active:scale-95 text-red-400 border border-red-500/20 py-2 rounded-xl text-xs font-medium transition-all"
                  >
                    💀 Delete Forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DeletedTransactions;
