import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);

  // 🔐 If not logged in → redirect
  if (!token) {
    return <Navigate to="/" />;
  }

  // ✅ If logged in → allow access
  return children;
};

export default PrivateRoute;