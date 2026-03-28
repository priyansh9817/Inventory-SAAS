import { useEffect, useState } from "react";
import API from "../api/axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

const Transactions = () => {
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
    const res = await API.get("/products");
    setProducts(res.data);
  };

  // 📄 FETCH TRANSACTIONS
  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions");
      setTransactions(res.data);
    } catch {
      toast.error("Error fetching transactions");
    }
  };

  // 🔍 FILTER
  const applyFilter = async () => {
    try {
      let url = "/transactions?";
      const params = [];

      if (filterType) params.push(`type=${filterType}`);
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);

      url += params.join("&");

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
    fetchProducts();
    fetchTransactions();
  }, []);

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

    await API.delete(`/transactions/${id}`);

    // 🔥 UNDO TOAST
    toast.custom((t) => (
  <div className="bg-[#111827] text-white px-4 py-2 rounded shadow flex gap-3 items-center">
    <span>Deleted</span>
    <button
      onClick={async () => {
        await API.put(`/transactions/restore/${id}`);
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
    <div className="p-4 sm:p-6">

      <h1 className="text-xl sm:text-2xl font-bold mb-6">Transactions</h1>

      {/* ADD FORM */}
      <div className="bg-[#111827] p-4 rounded mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

        <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 bg-[#020617] rounded">
          <option value="purchase">Purchase</option>
          <option value="sale">Sale</option>
        </select>

        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="p-2 bg-[#020617] rounded">
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.stock})
            </option>
          ))}
        </select>

        <input type="number" placeholder="Qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="p-2 bg-[#020617] rounded" />

        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="p-2 bg-[#020617] rounded" />

        <input type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} className="p-2 bg-[#020617] rounded" />

        <button onClick={handleAdd} className="bg-indigo-500 px-4 py-2 rounded">
          Add
        </button>
      </div>

      {/* FILTER */}
      <div className="mb-6 flex flex-wrap gap-3">

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="p-2 bg-[#020617] rounded">
          <option value="">All</option>
          <option value="sale">Sales</option>
          <option value="purchase">Purchases</option>
        </select>

        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 bg-[#020617] rounded" />

        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 bg-[#020617] rounded" />

        <button onClick={applyFilter} className="bg-indigo-500 px-4 py-2 rounded">Apply</button>

        <button
          onClick={() => {
            setStartDate("");
            setEndDate("");
            setFilterType("");
            fetchTransactions();
          }}
          className="bg-gray-600 px-4 py-2 rounded"
        >
          Clear
        </button>

        <button onClick={exportToExcel} className="bg-green-500 px-4 py-2 rounded">
          Export
        </button>

      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">

          <thead>
            <tr className="bg-[#1f2937]">
              <th className="p-3">Type</th>
              <th className="p-3">Product</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Price</th>
              <th className="p-3">Total</th>
              <th className="p-3">Txn Date</th>
              <th className="p-3">Entry</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t) => (
              <tr key={t._id} className="border-t">
                <td className="p-3">{t.type}</td>
                <td className="p-3">{t.productId?.name}</td>
                <td className="p-3">{t.quantity}</td>
                <td className="p-3">₹{t.pricePerUnit}</td>
                <td className="p-3 text-green-400">₹{t.totalAmount}</td>
                <td className="p-3">{new Date(t.transactionDate).toLocaleDateString()}</td>
                <td className="p-3">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(t._id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
};

export default Transactions;