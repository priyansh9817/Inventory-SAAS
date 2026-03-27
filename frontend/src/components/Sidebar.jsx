import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ArrowRightLeft, BarChart } from "lucide-react";

const Sidebar = ({ closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "Products",
      path: "/products",
      icon: <Package size={18} />,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: <ArrowRightLeft size={18} />,
    },
    {
  name: "Ledger",
  path: "/ledger",
  icon: <BarChart size={18} />,
}];

  return (
    <div className="w-64 h-full bg-[#020617] border-r border-gray-800 p-4 flex flex-col">

      {/* 🔥 LOGO */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-indigo-400 tracking-wide">
          Pratima
        </h1>
        <p className="text-xs text-gray-500">Enterprises</p>
      </div>

      {/* 🔥 MENU */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">

        {menu.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (closeSidebar) closeSidebar(); // ✅ safe auto close
              }}
              className={`
                relative group flex items-center gap-3 px-3 py-2 rounded-lg
                transition-all duration-200 ease-in-out

                ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              {/* 🔥 ACTIVE LEFT INDICATOR */}
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-1 bg-indigo-400 rounded-r"></span>
              )}

              {/* 🔥 ICON */}
              <span className="transition-transform duration-200 group-hover:scale-110">
                {item.icon}
              </span>

              {/* 🔥 TEXT */}
              <span className="text-sm font-medium tracking-wide">
                {item.name}
              </span>
            </button>
          );
        })}

      </div>

      {/* 🔥 FOOTER */}
      <div className="pt-4 border-t border-gray-800 text-xs text-gray-500">
        © 2026 Pratima
      </div>

    </div>
  );
};

export default Sidebar;