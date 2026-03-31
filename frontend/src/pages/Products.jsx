import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { BranchContext } from "../context/BranchContext";
import toast from "react-hot-toast";

const Products = () => {
  const { branchId } = useContext(BranchContext);

  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const res = await API.get(`/products?branchId=${branchId}`);
      setProducts(res.data);
    } catch {
      toast.error("Failed to fetch products ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [branchId]);

  const handleAdd = async () => {
    if (!name || !category) { toast.error("All fields required ❌"); return; }
    if (!branchId) { toast.error("Select branch first ❌"); return; }
    try {
      await API.post("/products", { name, category, branchId });
      toast.success("Product added ✅");
      setName("");
      setCategory("");
      fetchProducts();
    } catch {
      toast.error("Error adding product ❌");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await API.delete(`/products/${id}?branchId=${branchId}`);
      toast.success("Product deleted 🗑");
      fetchProducts();
    } catch {
      toast.error("Delete failed ❌");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = products.filter((p) => p.stock <= 10).length;

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto animate-fadeIn">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Products</h1>
          <p className="text-xs text-gray-500 mt-0.5">{products.length} products in this branch</p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Products", value: products.length, color: "text-white", bg: "from-gray-800 to-gray-900", border: "hover:border-gray-600", icon: "📦" },
          { label: "Total Stock", value: totalStock, color: "text-indigo-400", bg: "from-indigo-900/30 to-gray-900", border: "hover:border-indigo-500/40", icon: "🏷️" },
          { label: "Low Stock", value: lowStock, color: lowStock > 0 ? "text-red-400" : "text-green-400", bg: lowStock > 0 ? "from-red-900/30 to-gray-900" : "from-green-900/30 to-gray-900", border: lowStock > 0 ? "hover:border-red-500/40" : "hover:border-green-500/40", icon: lowStock > 0 ? "⚠️" : "✅" },
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

      {/* ADD FORM */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] border border-gray-800 hover:border-indigo-500/20 rounded-2xl p-4 mb-6 shadow-lg transition-all duration-300">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Add New Product</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 bg-[#020617] border border-gray-700 focus:border-indigo-500 focus:outline-none p-2.5 rounded-xl text-sm text-white placeholder-gray-500 transition-colors"
            placeholder="Product name (e.g. Rice)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <input
            className="flex-1 bg-[#020617] border border-gray-700 focus:border-indigo-500 focus:outline-none p-2.5 rounded-xl text-sm text-white placeholder-gray-500 transition-colors"
            placeholder="Category (e.g. Grocery)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={!branchId}
            className="bg-indigo-500 hover:bg-indigo-400 active:scale-95 disabled:opacity-40 transition-all px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-indigo-500/25 whitespace-nowrap"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          className="w-full sm:w-72 bg-[#0f172a] border border-gray-700 focus:border-indigo-500 focus:outline-none p-2.5 rounded-xl text-sm text-white placeholder-gray-500 transition-colors"
          placeholder="🔍  Search by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
        </div>
      ) : (
        <>
          {/* TABLE - desktop */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-800 shadow-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0f172a] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 text-left">#</th>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-left">Stock</th>
                  <th className="p-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      <p className="text-3xl mb-2">📭</p>
                      <p>No products found</p>
                    </td>
                  </tr>
                ) : filtered.map((p, i) => (
                  <tr key={p._id} className="border-t border-gray-800/60 hover:bg-[#0f172a] transition-colors duration-150 group">
                    <td className="p-4 text-gray-600 text-xs">{i + 1}</td>
                    <td className="p-4 font-medium text-white group-hover:text-indigo-300 transition-colors">{p.name}</td>
                    <td className="p-4">
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full text-xs">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.stock > 10
                          ? "bg-green-500/15 text-green-400 border border-green-500/20"
                          : "bg-red-500/15 text-red-400 border border-red-500/20"
                      }`}>
                        {p.stock > 10 ? "✓" : "⚠"} {p.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="bg-red-500/10 hover:bg-red-500/25 active:scale-95 text-red-400 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CARDS - mobile */}
          <div className="sm:hidden flex flex-col gap-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-3xl mb-2">📭</p>
                <p>No products found</p>
              </div>
            ) : filtered.map((p) => (
              <div key={p._id} className="bg-gradient-to-br from-[#0f172a] to-[#020617] border border-gray-800 hover:border-indigo-500/20 rounded-2xl p-4 shadow transition-all duration-200 group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-white font-semibold group-hover:text-indigo-300 transition-colors">{p.name}</p>
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full text-xs mt-1 inline-block">
                      {p.category}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    p.stock > 10
                      ? "bg-green-500/15 text-green-400 border border-green-500/20"
                      : "bg-red-500/15 text-red-400 border border-red-500/20"
                  }`}>
                    {p.stock} units
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="w-full bg-red-500/10 hover:bg-red-500/25 active:scale-95 text-red-400 border border-red-500/20 py-2 rounded-xl text-xs font-medium transition-all duration-150"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Products;
