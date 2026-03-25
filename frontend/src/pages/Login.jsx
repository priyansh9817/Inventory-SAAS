import { useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return toast.error("Please fill all fields ❌");
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        email,
        password,
      });

      // ✅ Backend message
      toast.success(res.data.message || "Login successful 🎉");

      login(res.data.token);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid credentials ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gradient-to-br from-[#0f172a] to-[#020617]">

      {/* Card */}
      <div className="bg-[#111827] p-8 rounded-xl shadow-xl w-80 border border-gray-800 animate-fadeIn">

        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Welcome Back 👋
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Enter your email"
          className="bg-[#020617] border border-gray-700 p-2 rounded w-full mb-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Enter your password"
          className="bg-[#020617] border border-gray-700 p-2 rounded w-full mb-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-indigo-500 hover:bg-indigo-600 transition p-2 w-full rounded text-white flex justify-center items-center"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Signup */}
        <p className="mt-4 text-center text-gray-400">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-indigo-400 cursor-pointer hover:underline"
          >
            Signup
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;