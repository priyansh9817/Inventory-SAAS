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

  const initials = user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="w-full flex items-center justify-between bg-gradient-to-r from-[#020617] via-[#0f172a] to-[#020617] border-b border-indigo-900/40 px-4 md:px-8 py-3 shadow-lg shadow-black/30">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-900">
          <span className="text-white text-xs font-bold">PG</span>
        </div>
        <h2 className="text-sm md:text-base font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hidden md:block tracking-wide">
          Pratima Groups
        </h2>
      </div>

      {/* CENTER: BRANCH SELECTOR */}
      <div className="flex items-center gap-2 bg-[#0f172a] border border-indigo-900/60 rounded-lg px-3 py-1.5 hover:border-indigo-600/60 transition-colors">
        <span className="text-indigo-400 text-xs hidden sm:block">Branch:</span>
        <select
          value={branchId || ""}
          onChange={(e) => setBranchId(e.target.value)}
          className="bg-transparent text-white text-sm focus:outline-none cursor-pointer max-w-[140px] md:max-w-[200px]"
        >
          {branches.map((b) => (
            <option key={b._id} value={b._id} className="bg-[#0f172a]">
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* RIGHT: Avatar */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 text-white text-xs font-bold ring-2 ring-indigo-500/30"
        >
          {initials}
        </button>

        {open && (
          <div className="absolute right-0 mt-3 w-52 bg-[#0f172a] border border-indigo-900/50 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fade-in">
            <div className="px-4 py-3 border-b border-indigo-900/40 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Signed in as</span>
                <span className="text-sm text-white truncate max-w-[130px]">{user?.email || "User"}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Navbar;