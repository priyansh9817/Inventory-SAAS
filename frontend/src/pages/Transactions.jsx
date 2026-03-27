import { useEffect, useState } from "react";
import API from "../api/axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

const Transactions = () => {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [type, setType] = useState("purchase");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // 🔍 FILTERS
  const [filterType, setFilterType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 📄 FETCH PRODUCTS
  const fetchProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data);
  };

  // 📄 FETCH ALL TRANSACTIONS (NO FILTER)
  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions");
      console.log("ALL DATA:", res.data);
      setTransactions(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Error fetching transactions");
    }
  };

  // 🔍 APPLY FILTER
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
      toast.error("Error filtering data");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, []);

  // ➕ ADD TRANSACTION
  const handleAdd = async () => {
    console.log("CLICKED 🔥");

    if (!productId || !quantity || !price) {
      toast.error("All fields required ❌");
      return;
    }

    try {
      const res = await API.post("/transactions", {
        type,
        productId,
        quantity: Number(quantity),
        pricePerUnit: Number(price),
        transactionDate: transactionDate // ✅ correct field
      });

      console.log("ADDED:", res.data);

      toast.success("Transaction added ✅");

      // reset form
      setQuantity("");
      setPrice("");

      // reset filters
      setStartDate("");
      setEndDate("");
      setFilterType("");

      // fetch fresh data
      await fetchTransactions();
      await fetchProducts();

    } catch (error) {
      console.log("ERROR:", error);
      toast.error(error.response?.data?.message || "Error ❌");
    }
  };

  // 📊 EXPORT EXCEL
  const exportToExcel = () => {
    if (transactions.length === 0) {
      toast.error("No data to export ❌");
      return;
    }

    const data = transactions.map((t) => ({
      Type: t.type,
      Product: t.productId?.name || "N/A",
      Quantity: t.quantity,
      Price: t.pricePerUnit,
      Total: t.totalAmount,
      "Transaction Date": new Date(t.transactionDate).toLocaleDateString(), // ✅ FIXED
      "Entry Date": new Date(t.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, "transactions-report.xlsx");
  };

  return (
  <div className="p-4 sm:p-6">

    <h1 className="text-xl sm:text-2xl font-bold mb-6">
      Transactions
    </h1>

    {/* ➕ ADD FORM */}
    <div className="bg-[#111827] border border-gray-700 p-4 rounded-lg mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="p-2 rounded bg-[#020617] border border-gray-700 w-full sm:w-auto"
      >
        <option value="purchase">Purchase</option>
        <option value="sale">Sale</option>
      </select>

      <select
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        className="p-2 rounded bg-[#020617] border border-gray-700 w-full sm:w-64"
      >
        <option value="">Select Product</option>
        {products.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} (Stock: {p.stock})
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Qty"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="p-2 rounded bg-[#020617] border border-gray-700 w-full sm:w-24"
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="p-2 rounded bg-[#020617] border border-gray-700 w-full sm:w-32"
      />

      <input
        type="date"
        value={transactionDate}
        onChange={(e) => setTransactionDate(e.target.value)}
        className="p-2 rounded bg-[#020617] border border-gray-700 w-full sm:w-auto"
      />

      <button
        type="button"
        onClick={handleAdd}
        className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded w-full sm:w-auto"
      >
        Add
      </button>
    </div>

    {/* 🔍 FILTER */}
    <div className="bg-[#111827] border border-gray-700 p-4 rounded-lg mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="p-2 rounded bg-[#020617] border border-gray-700 w-full sm:w-auto"
      >
        <option value="">All</option>
        <option value="sale">Sales</option>
        <option value="purchase">Purchases</option>
      </select>

      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="p-2 rounded bg-[#020617] border border-gray-700 w-full sm:w-auto"
      />

      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="p-2 rounded bg-[#020617] border border-gray-700 w-full sm:w-auto"
      />

      <button
        onClick={applyFilter}
        className="bg-indigo-500 px-4 py-2 rounded w-full sm:w-auto"
      >
        Apply
      </button>

      <button
        onClick={async () => {
          setStartDate("");
          setEndDate("");
          setFilterType("");
          await fetchTransactions();
        }}
        className="bg-gray-600 px-4 py-2 rounded w-full sm:w-auto"
      >
        Clear
      </button>

      <button
        onClick={exportToExcel}
        className="bg-green-500 px-4 py-2 rounded w-full sm:w-auto"
      >
        Export
      </button>

    </div>

    {/* 📄 TABLE (DESKTOP) */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full border text-sm">

        <thead>
          <tr className="bg-[#1f2937] text-gray-300">
            <th className="p-3">Type</th>
            <th className="p-3">Product</th>
            <th className="p-3">Qty</th>
            <th className="p-3">Price</th>
            <th className="p-3">Total</th>
            <th className="p-3">Txn Date</th>
            <th className="p-3">Entry Date</th>
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
              <td className="p-3">
                {new Date(t.transactionDate).toLocaleDateString()}
              </td>
              <td className="p-3 text-gray-400">
                {new Date(t.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>

    {/* 📱 MOBILE VIEW */}
    <div className="md:hidden flex flex-col gap-4">

      {transactions.map((t) => (
        <div key={t._id} className="bg-[#111827] border border-gray-700 p-4 rounded-lg shadow">

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

          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm">Price</span>
            <span>₹{t.pricePerUnit}</span>
          </div>

          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm">Total</span>
            <span className="text-green-400">₹{t.totalAmount}</span>
          </div>

          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm">Txn Date</span>
            <span>
              {new Date(t.transactionDate).toLocaleDateString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Entry</span>
            <span>
              {new Date(t.createdAt).toLocaleDateString()}
            </span>
          </div>

        </div>
      ))}

    </div>

  </div>
);
};

export default Transactions;