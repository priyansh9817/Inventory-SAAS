import { useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await API.post("/auth/login", {
      email,
      password,
    });

    login(res.data.token);
    window.location.href = "/dashboard";
  };

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="p-6 shadow-lg rounded">
        <h2 className="text-xl mb-4">Login</h2>

        <input
          className="border p-2 mb-2 w-full"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 mb-2 w-full"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white p-2 w-full"
        >
          Login
        </button>


        {/* 🔥 Signup Button */}
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 cursor-pointer"
          >
            Signup
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;