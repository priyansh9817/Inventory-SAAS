import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ArrowRightLeft } from "lucide-react";

const Sidebar = () => {
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
  ];

  return (
    <div className="w-64 h-screen bg-[#020617] border-r border-gray-800 p-4">

      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-indigo-400">
          Pratima
        </h1>
        <p className="text-sm text-gray-400">Enterprises</p>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-2">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 p-2 rounded transition ${
                isActive
                  ? "bg-indigo-500 text-white"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;