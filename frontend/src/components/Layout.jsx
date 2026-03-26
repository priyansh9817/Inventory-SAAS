import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden relative">

      {/* 🔥 SIDEBAR */}
      <div
        className={`
          fixed z-50 top-0 left-0 h-full w-64 bg-[#020617]
          transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          transition-all duration-300 ease-in-out
          shadow-2xl
        `}
      >
        <Sidebar setIsOpen={setIsOpen} />
      </div>

      {/* 🔥 BACKDROP (click outside to close) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* 🔥 MAIN CONTENT */}
      <div className="flex-1 flex flex-col md:ml-64">

        {/* 🔝 NAVBAR */}
        <div className="flex items-center bg-[#020617] border-b border-gray-800 px-4 py-3">

          {/* ☰ TOGGLE BUTTON (LEFT SIDE) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden mr-3 text-white text-xl"
          >
            ☰
          </button>

          <Navbar />
        </div>

        {/* 📄 PAGE CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Layout;