import { useEffect, useState } from "react";
import API from "../api/axios";
import * as XLSX from "xlsx"; // For Excel export
import { saveAs } from "file-saver"; // For saving files

const Transactions = () => {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [type, setType] = useState("purchase");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [filterType, setFilterType] = useState("");

  // 📄 Fetch Products
  const fetchProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data);
  };

  // 📄 Fetch Transactions
  const fetchTransactions = async () => {
    let url = "/transactions";

    if (filterType) {
      url += `?type=${filterType}`;
    }

    const res = await API.get(url);
    setTransactions(res.data);
  };

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, []);

  // ➕ Add Transaction
  const handleAdd = async () => {
    if (!productId || !quantity || !price) {
      alert("All fields required");
      return;
    }

    try {
      await API.post("/transactions", {
        type,
        productId,
        quantity: Number(quantity),
        pricePerUnit: Number(price),
      });

      setQuantity("");
      setPrice("");

      await fetchTransactions(); // 🔥 update list
      await fetchProducts();     // 🔥 update stock

    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  const exportToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, "inventory-report.xlsx");
  };

  return (
   
    <div className="overflow-x-auto">
  <table className="min-w-full text-sm min-w-full text-sm text-left">
     <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>

      {/* ➕ Add Transaction */}
      <div className="mb-6 flex gap-2 flex-wrap">

        <select
          className="border p-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="purchase">Purchase</option>
          <option value="sale">Sale</option>
        </select>

        <select
          className="border p-2"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} (Stock: {p.stock})
            </option>
          ))}
        </select>

        <input
          className="border p-2"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button
          onClick={handleAdd}
          className="bg-indigo-500 px-4 py-2 rounded w-full sm:w-auto"
        >
          Add
        </button>
      </div>

      {/* 🔍 Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
        <select
          className="p-2 rounded bg-[#111827] border border-gray-700 w-full sm:w-auto"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
          }}
        >
          <option value=""  >All</option>
          <option value="sale">Sales</option>
          <option value="purchase">Purchases</option>
        </select>

        <button
          onClick={fetchTransactions}
          className="bg-indigo-500 hover:bg-indigo-600 transition px-4 py-2 rounded w-full sm:w-auto"
        >
          Apply Filter
        </button>

        <button
          onClick={() => exportToExcel(transactions)}
          className="bg-green-500 px-4 py-2 rounded w-full sm:w-auto"
        >
          Export Excel
        </button>
      </div>

      {/* 📄 Transactions Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Type</th>
            <th className="p-2">Product</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Price</th>
            <th className="p-2">Total</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((t) => (
            <tr key={t._id} className="text-center border-t">
              <td className="p-2">{t.type}</td>
              <td className="p-2">{t.productId?.name}</td>
              <td className="p-2">{t.quantity}</td>
              <td className="p-2">{t.pricePerUnit}</td>
              <td className="p-2">{t.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </table>
</div>
  );
};

export default Transactions;