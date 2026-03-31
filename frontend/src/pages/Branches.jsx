import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await API.get("/branches");
      setBranches(res.data);
    } catch {
      toast.error("Failed to load branches ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  const handleAdd = async () => {
    if (!name) { toast.error("Branch name required ❌"); return; }
    try {
      await API.post("/branches", { name, location });
      toast.success("Branch created ✅");
      setName(""); setLocation(""); setOpen(false);
      fetchBranches();
    } catch {
      toast.error("Error creating branch ❌");
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto animate-fadeIn">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Branches</h1>
          <p className="text-xs text-gray-500 mt-0.5">{branches.length} branches configured</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-indigo-500/25 self-start sm:self-auto"
        >
          + Add Branch
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: "Total Branches", value: branches.length, color: "text-white", bg: "from-gray-800 to-gray-900", border: "hover:border-gray-600", icon: "🏢" },
          { label: "Locations", value: branches.filter(b => b.location).length, color: "text-indigo-400", bg: "from-indigo-900/30 to-gray-900", border: "hover:border-indigo-500/40", icon: "📍" },
        ].map((item) => (
          <div key={item.label} className={`bg-gradient-to-br ${item.bg} border border-gray-800 ${item.border} rounded-2xl p-4 hover:scale-[1.03] hover:shadow-lg transition-all duration-200 cursor-default group`}>
            <div className="flex justify-between items-start">
              <p className="text-gray-400 text-xs font-medium">{item.label}</p>
              <span className="text-lg group-hover:scale-125 transition-transform duration-200">{item.icon}</span>
            </div>
            <p className={`${item.color} text-2xl font-bold mt-2 tracking-tight`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
        </div>
      ) : branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-5xl mb-4">🏢</p>
          <p className="text-lg font-medium text-gray-400">No branches yet</p>
          <p className="text-sm mt-1">Click "+ Add Branch" to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {branches.map((b, i) => (
            <div
              key={b._id}
              className="bg-gradient-to-br from-[#0f172a] to-[#020617] border border-gray-800 hover:border-indigo-500/30 rounded-2xl p-5 shadow-lg hover:shadow-indigo-500/10 hover:scale-[1.02] transition-all duration-200 group cursor-default"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform duration-200">
                  🏢
                </div>
                <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  #{i + 1}
                </span>
              </div>
              <h2 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors mb-1">{b.name}</h2>
              {b.location ? (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span>📍</span> {b.location}
                </p>
              ) : (
                <p className="text-sm text-gray-700 italic">No location set</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-gradient-to-br from-[#0f172a] to-[#020617] border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">New Branch</h2>
                <p className="text-xs text-gray-500 mt-0.5">Add a new branch to your account</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
              >✕</button>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              <input
                type="text"
                placeholder="Branch name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full p-2.5 bg-[#020617] border border-gray-700 focus:border-indigo-500 focus:outline-none rounded-xl text-sm text-white placeholder-gray-600 transition-colors"
              />
              <input
                type="text"
                placeholder="Location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full p-2.5 bg-[#020617] border border-gray-700 focus:border-indigo-500 focus:outline-none rounded-xl text-sm text-white placeholder-gray-600 transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all py-2.5 rounded-xl text-sm border border-gray-700"
              >Cancel</button>
              <button
                onClick={handleAdd}
                className="flex-1 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-indigo-500/25"
              >Create Branch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
