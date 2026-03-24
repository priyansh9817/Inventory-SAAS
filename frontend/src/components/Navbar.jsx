import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div className="flex justify-between items-center bg-[#020617] border-b border-gray-800 px-6 py-3">

  <h2 className="text-lg font-semibold text-gray-300">
    Welcome 👋
  </h2>

  <button
    onClick={logout}
    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
  >
    Logout
  </button>

</div>
  );
};

export default Navbar;