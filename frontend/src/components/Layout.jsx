import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false); // ✅ inside component

  return (
    <div className="flex h-screen overflow-hidden">

      {/* 🔥 SIDEBAR */}
      <div
        className={`
          fixed z-50 top-0 left-0 h-full w-64 bg-[#020617]
          transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 transition-transform duration-300
        `}
      >
        <Sidebar />
      </div>

      {/* 🔥 MAIN CONTENT */}
      <div className="flex-1 flex flex-col md:ml-64">

        {/* 🔝 NAVBAR */}
        <Navbar />

        {/* ☰ MOBILE MENU BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-white bg-[#020617]"
        >
          ☰
        </button>

        {/* 📄 PAGE CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Layout;