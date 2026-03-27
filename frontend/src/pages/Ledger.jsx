import { useEffect, useState } from "react";
import API from "../api/axios";

const Ledger = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data);
  };

  const fetchLedger = async () => {
    if (!selectedProduct) return;
    const res = await API.get(`/transactions/ledger/${selectedProduct}`);
    setLedger(res.data);
  };

  return (
    <div className="p-4 sm:p-6">

      {/* 🔥 HEADER */}
      <h1 className="text-xl sm:text-2xl font-bold mb-6">
        Stock Ledger
      </h1>

      {/* 🔥 FILTER */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">

        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="bg-[#111827] border border-gray-700 p-2 rounded w-full sm:w-64"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <button
          onClick={fetchLedger}
          className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded w-full sm:w-auto"
        >
          View Ledger
        </button>

      </div>

      {/* 🔥 TABLE (DESKTOP) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border text-sm">

          <thead>
            <tr className="bg-[#1f2937] text-gray-300">
              <th className="p-3">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">In</th>
              <th className="p-3">Out</th>
              <th className="p-3">Balance</th>
              <th className="p-3">Price</th>
              <th className="p-3">Total</th>
            </tr>
          </thead>

          <tbody>
            {ledger.map((l, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">
                  {new Date(l.date).toLocaleDateString()}
                </td>

                <td className="p-3 capitalize">{l.type}</td>

                <td className="p-3 text-green-400">
                  {l.qtyIn || "-"}
                </td>

                <td className="p-3 text-red-400">
                  {l.qtyOut || "-"}
                </td>

                <td className="p-3 font-bold text-indigo-400">
                  {l.balance}
                </td>

                <td className="p-3">₹{l.price}</td>
                <td className="p-3">₹{l.total}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* 🔥 MOBILE VIEW (CARDS) */}
      <div className="md:hidden flex flex-col gap-4">

        {ledger.length === 0 && (
          <p className="text-gray-400 text-center">
            No data available
          </p>
        )}

        {ledger.map((l, i) => (
          <div
            key={i}
            className="bg-[#111827] border border-gray-700 rounded-lg p-4 shadow"
          >
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Date</span>
              <span>
                {new Date(l.date).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Type</span>
              <span className="capitalize">{l.type}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">In</span>
              <span className="text-green-400">
                {l.qtyIn || "-"}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Out</span>
              <span className="text-red-400">
                {l.qtyOut || "-"}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Balance</span>
              <span className="text-indigo-400 font-bold">
                {l.balance}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Price</span>
              <span>₹{l.price}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Total</span>
              <span>₹{l.total}</span>
            </div>
          </div>
        ))}

      </div>

    </div>
  );
};

export default Ledger;