import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { BranchContext } from "../context/BranchContext";

const DeletedTransactions = () => {
  const { branchId } = useContext(BranchContext);
  const [transactions, setTransactions] = useState([]);

  const fetchDeleted = async () => {
    try {
      const res = await API.get(`/transactions/deleted?branchId=${branchId}`);
      setTransactions(res.data);
    } catch {
      toast.error("Failed to load deleted data ❌");
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

  // ⚠️ FIRST CONFIRM
  const confirm1 = window.confirm(
    "⚠️ This will permanently delete data. Continue?"
  );
  if (!confirm1) return;

  // 🔐 SECRET INPUT
  const secret = prompt("Enter secret key:");

  if (!secret) return;

  try {
    await API.delete(`/transactions/permanent/${id}`, {
  data: {
    secret: secret,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

    toast.success("Deleted permanently 💀");

    fetchDeleted();

  } catch (err) {
    toast.error(err.response?.data?.message || "Error ❌");
  }
};

  return (
    <div className="p-4 sm:p-6">

      <h1 className="text-xl sm:text-2xl font-bold mb-6">
        🗑 Recycle Bin
      </h1>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border text-sm">

          <thead>
            <tr className="bg-[#1f2937] text-gray-300">
              <th className="p-3">Product</th>
              <th className="p-3">Type</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Date</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t) => (
              <tr key={t._id} className="border-t">
                <td className="p-3">{t.productId?.name}</td>
                <td className="p-3 capitalize">{t.type}</td>
                <td className="p-3">{t.quantity}</td>
                <td className="p-3">
                  {new Date(t.transactionDate).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleRestore(t._id)}
                    className="text-green-400 hover:text-green-500 gap-3"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(t._id)}
                    className="text-red-400 hover:text-green-500 rounded mt-2"
                  >
                    Delete Forever
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden flex flex-col gap-4">

        {transactions.length === 0 && (
          <p className="text-gray-400 text-center">
            No deleted transactions
          </p>
        )}

        {transactions.map((t) => (
          <div
            key={t._id}
            className="bg-[#111827] border border-gray-700 p-4 rounded-lg"
          >
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Product</span>
              <span>{t.productId?.name}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Type</span>
              <span className="capitalize">{t.type}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Qty</span>
              <span>{t.quantity}</span>
            </div>

            <div className="flex justify-between mb-3">
              <span className="text-gray-400 text-sm">Date</span>
              <span>
                {new Date(t.transactionDate).toLocaleDateString()}
              </span>
            </div>

            <button
              onClick={() => handleRestore(t._id)}
              className="w-full bg-green-500 py-2 rounded"
            >
              Restore ♻️
            </button>
          </div>
        ))}

      </div>

    </div>
  );
};

export default DeletedTransactions;