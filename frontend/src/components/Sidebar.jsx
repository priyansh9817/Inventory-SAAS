import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ArrowRightLeft, BarChart2, Recycle, GitBranch } from "lucide-react";

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Products", path: "/products", icon: Package },
  { name: "Transactions", path: "/transactions", icon: ArrowRightLeft },
  { name: "Ledger", path: "/ledger", icon: BarChart2 },
  { name: "Branches", path: "/branches", icon: GitBranch },
  { name: "Recycle Bin", path: "/deleted-transactions", icon: Recycle },
];

const Sidebar = ({ closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-64 h-full bg-[#020617] border-r border-gray-800/60 flex flex-col relative overflow-hidden">

      {/* BG GLOW */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* LOGO */}
      <div className="p-5 pb-4 border-b border-gray-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-indigo-500/30 shrink-0">
            📦
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Trackify</h1>
            <p className="text-indigo-400/70 text-xs">Inventory Manager</p>
          </div>
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest text-gray-600 px-3 mb-2 mt-1">Menu</p>

        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); if (closeSidebar) closeSidebar(); }}
              className={`relative group flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all duration-200 ${
                isActive
                  ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 shadow-sm"
                  : "text-gray-500 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent"
              }`}
            >
              {/* ACTIVE GLOW */}
              {isActive && (
                <div className="absolute inset-0 bg-indigo-500/5 rounded-xl pointer-events-none" />
              )}

              {/* ACTIVE LEFT BAR */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-400 rounded-full" />
              )}

              {/* ICON */}
              <span className={`shrink-0 transition-all duration-200 ${
                isActive ? "text-indigo-400" : "text-gray-600 group-hover:text-gray-300 group-hover:scale-110"
              }`}>
                <Icon size={17} />
              </span>

              {/* LABEL */}
              <span className={`text-sm font-medium transition-colors duration-200 ${
                isActive ? "text-indigo-300" : ""
              }`}>
                {item.name}
              </span>

              {/* ACTIVE DOT */}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-800/60">
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3">
          <p className="text-xs text-gray-400 font-medium">Pratima Enterprises</p>
          <p className="text-xs text-gray-600 mt-0.5">© 2026 All rights reserved</p>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;
