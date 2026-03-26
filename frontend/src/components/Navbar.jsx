import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { User, LogOut } from "lucide-react";

const Navbar = ({ toggleSidebar }) => {
  const { logout, user } = useContext(AuthContext);
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

  return (
    <div className="w-full flex items-center justify-between bg-[#020617] border-b border-gray-800 px-4 md:px-6 py-3">

      {/* 🔥 LEFT: Toggle + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-white text-xl"
        >
        
        </button>

        <h2 className="text-sm md:text-lg font-semibold text-gray-300">
          Welcome 👋
        </h2>
      </div>

      {/* 🔥 RIGHT: Avatar */}
      <div className="relative" ref={dropdownRef}>
        
        {/* Avatar Button */}
        <div
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center cursor-pointer hover:scale-105 transition"
        >
          <User size={18} className="text-white" />
        </div>

        {/* 🔥 DROPDOWN */}
        {open && (
          <div className="absolute right-0 mt-3 w-44 bg-[#020617] border border-gray-800 rounded-lg shadow-xl overflow-hidden animate-fadeIn">

            {/* USER INFO */}
            <div className="px-4 py-2 border-b border-gray-800 text-sm text-gray-300">
              {user?.email || "User"}
            </div>

            {/* LOGOUT */}
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