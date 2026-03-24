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
    <div className="overflow-x-auto">
  <table className="min-w-full text-sm text-left">
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {/* ➕ Add Product */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          className="border p-2"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <button
          onClick={handleAdd}
          className="bg-green-500 text-white px-4"
        >
          Add
        </button>
      </div>

      {/* 📄 Product List */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Name</th>
            <th className="p-2">Category</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="text-center border-t">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.category}</td>
              <td className="p-2">{p.stock}</td>

              <td className="p-2">
                <button
                  onClick={() => handleDelete(p._id)}
                  className="bg-red-500 text-white px-3"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </table>
</div>
  );
};

export default Products;