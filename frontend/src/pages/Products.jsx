import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { BranchContext } from "../context/BranchContext";
import toast from "react-hot-toast";

const Products = () => {
  const { branchId } = useContext(BranchContext);

  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  // 📄 Fetch Products
  const fetchProducts = async () => {
    if (!branchId) return;

    try {
      const res = await API.get(`/products?branchId=${branchId}`);
      setProducts(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch products ❌");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [branchId]);

  // ➕ Add Product
  const handleAdd = async () => {
    if (!name || !category) {
      toast.error("All fields required ❌");
      return;
    }

    if (!branchId) {
      toast.error("Select branch first ❌");
      return;
    }

    try {
      await API.post("/products", {
        name,
        category,
        branchId, // 🔥 FIXED
      });

      toast.success("Product added ✅");

      setName("");
      setCategory("");
      fetchProducts();
    } catch (error) {
      console.log(error);
      toast.error("Error adding product ❌");
    }
  };

  // ❌ Delete Product
  const handleDelete = async (id) => {
    if (!branchId) {
      toast.error("Select branch first ❌");
      return;
    }

    try {
      await API.delete(`/products/${id}?branchId=${branchId}`); // 🔥 FIXED
      toast.success("Product deleted 🗑");
      fetchProducts();
    } catch (error) {
      console.log(error);
      toast.error("Delete failed ❌");
    }
  };

  return (
    <div className="p-4 sm:p-6">

      <h1 className="text-xl sm:text-2xl font-bold mb-6">Products</h1>

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
          disabled={!branchId}
          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 transition px-4 py-2 rounded text-white"
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
            {products.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-400">
                  No products found 🚫
                </td>
              </tr>
            ) : (
              products.map((p) => (
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
              ))
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
};

export default Products;