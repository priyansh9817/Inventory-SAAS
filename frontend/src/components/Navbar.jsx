import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { BranchContext } from "../context/BranchContext";
import { User, LogOut } from "lucide-react";
import API from "../api/axios";

const Navbar = ({ toggleSidebar }) => {
  const { logout, user } = useContext(AuthContext);
  const { branchId, setBranchId, branches, setBranches } =
    useContext(BranchContext);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // 🔥 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔥 FETCH BRANCHES
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await API.get("/branches");
        setBranches(res.data);

        // auto select first branch
        if (!branchId && res.data.length > 0) {
          setBranchId(res.data[0]._id);
        }
      } catch (err) {
        console.log("Branch fetch error", err);
      }
    };

    fetchBranches();
  }, []);

  return (
    <div className="w-full flex items-center justify-between bg-[#020617] border-b border-gray-800 px-4 md:px-6 py-3">

      {/* LEFT */}
      <h2 className="text-sm md:text-lg font-semibold text-gray-300 hidden md:block">
        Welcome
      </h2>

      {/* BRANCH SELECTOR - visible on all screens */}
      <select
        value={branchId || ""}
        onChange={(e) => setBranchId(e.target.value)}
        className="bg-[#111827] border border-gray-700 px-3 py-2 rounded text-white text-sm focus:outline-none flex-1 mx-2 md:flex-none md:mx-0 max-w-[180px]"
      >
        {branches.map((b) => (
          <option key={b._id} value={b._id}>
            {b.name}
          </option>
        ))}
      </select>

      {/* RIGHT: Avatar */}
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center cursor-pointer hover:scale-105 transition"
        >
          <User size={18} className="text-white" />
        </div>

        {open && (
          <div className="absolute right-0 mt-3 w-44 bg-[#020617] border border-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-800 text-sm text-gray-300">
              {user?.email || "User"}
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Navbar;