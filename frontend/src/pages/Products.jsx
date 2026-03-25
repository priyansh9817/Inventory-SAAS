import { useEffect, useState } from "react";
import API from "../api/axios";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  // 📄 Fetch Products
  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ➕ Add Product
  const handleAdd = async () => {
    if (!name || !category) {
      alert("All fields required");
      return;
    }

    try {
      await API.post("/products", { name, category });
      setName("");
      setCategory("");
      fetchProducts(); // refresh
    } catch (error) {
      console.log(error);
    }
  };

  // ❌ Delete Product
  const handleDelete = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

 return (
  <div className="p-6">

    <h1 className="text-2xl font-bold mb-6">Products</h1>

    {/* ➕ Add Product */}
    <div className="mb-6 flex flex-wrap gap-3">

      <input
        className="bg-[#111827] border border-gray-700 p-2 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
        placeholder="Enter product name (e.g. Rice)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="bg-[#111827] border border-gray-700 p-2 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
        placeholder="Enter category (e.g. Grocery)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <button
        onClick={handleAdd}
        className="bg-green-500 hover:bg-green-600 transition px-4 py-2 rounded text-white"
      >
        Add Product
      </button>

    </div>

    {/* 📄 Product Table */}
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border border-gray-800">

        <thead>
          <tr className="bg-[#1f2937] text-gray-300">
            <th className="p-3">Name</th>
            <th className="p-3">Category</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr
              key={p._id}
              className="border-t border-gray-800 hover:bg-[#1f2937] transition"
            >
              <td className="p-3">{p.name}</td>
              <td className="p-3">{p.category}</td>

              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    p.stock > 10
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {p.stock}
                </span>
              </td>

              <td className="p-3">
                <button
                  onClick={() => handleDelete(p._id)}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white"
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

export default Products;