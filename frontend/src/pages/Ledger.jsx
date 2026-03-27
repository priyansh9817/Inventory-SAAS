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
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">Stock Ledger</h1>

      {/* SELECT PRODUCT */}
      <div className="flex gap-3 mb-6">

        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="bg-[#111827] border p-2 rounded"
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
          className="bg-indigo-500 px-4 py-2 rounded"
        >
          View Ledger
        </button>

      </div>

      {/* TABLE */}
      <table className="w-full border">

        <thead>
          <tr className="bg-[#1f2937]">
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
  );
};

export default Ledger;