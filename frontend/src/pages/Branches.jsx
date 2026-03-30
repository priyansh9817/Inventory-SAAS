import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  // 📄 FETCH BRANCHES
  const fetchBranches = async () => {
    try {
      const res = await API.get("/branches");
      setBranches(res.data);
    } catch {
      toast.error("Failed to load branches ❌");
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // ➕ ADD BRANCH
  const handleAdd = async () => {
    if (!name) {
      toast.error("Branch name required ❌");
      return;
    }

    try {
      await API.post("/branches", { name, location });

      toast.success("Branch created ✅");

      setName("");
      setLocation("");
      setOpen(false);

      fetchBranches();
    } catch {
      toast.error("Error creating branch ❌");
    }
  };

  return (
    <div className="p-4 sm:p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Branches</h1>

        <button
          onClick={() => setOpen(true)}
          className="bg-indigo-500 px-4 py-2 rounded"
        >
          + Add Branch
        </button>
      </div>

      {/* LIST */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {branches.map((b) => (
          <div
            key={b._id}
            className="bg-[#111827] p-4 rounded border border-gray-700"
          >
            <h2 className="text-lg font-semibold text-white">{b.name}</h2>
            <p className="text-sm text-gray-400">{b.location}</p>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

          <div className="bg-[#020617] p-6 rounded w-80 border border-gray-700">

            <h2 className="text-lg mb-4">Add Branch</h2>

            <input
              type="text"
              placeholder="Branch Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-3 p-2 bg-[#111827] rounded"
            />

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full mb-4 p-2 bg-[#111827] rounded"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="bg-gray-600 px-3 py-1 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleAdd}
                className="bg-indigo-500 px-3 py-1 rounded"
              >
                Add
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default Branches;