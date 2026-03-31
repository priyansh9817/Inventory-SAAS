import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password) {
      return toast.error("Please fill all fields ❌");
    }
    try {
      setLoading(true);
      const res = await API.post("/auth/signup", form);
      localStorage.setItem("token", res.data.token);
      toast.success("Signup successful ✅");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020617]">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-indigo-900/40 via-[#0f172a] to-[#020617] p-12 border-r border-gray-800 relative overflow-hidden">

        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        {/* LOGO */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
            📦
          </div>
          <span className="text-white font-bold text-xl">Inventory SaaS</span>
        </div>

        {/* CENTER */}
        <div className="z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Start managing<br />
            <span className="text-indigo-400">smarter today.</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed mb-8">
            Join thousands of businesses tracking their inventory with ease.
          </p>

          <div className="flex flex-col gap-3">
            {[
              { icon: "⚡", text: "Set up in under 2 minutes" },
              { icon: "🔒", text: "Secure & private by default" },
              { icon: "🌐", text: "Access from any device" },
              { icon: "📱", text: "Mobile-friendly interface" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-gray-300 text-sm">
                <span className="w-8 h-8 bg-indigo-500/15 border border-indigo-500/20 rounded-lg flex items-center justify-center text-base">{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-xs z-10">© 2024 Inventory SaaS. All rights reserved.</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">

        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm animate-fadeIn">

          {/* MOBILE LOGO */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-indigo-500/30">📦</div>
            <span className="text-white font-bold text-lg">Trackify</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Create account</h2>
          <p className="text-gray-500 text-sm mb-8">Get started for free, no credit card required</p>

          <div className="flex flex-col gap-4">

            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Full name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                className="w-full bg-[#0f172a] border border-gray-700 hover:border-gray-600 focus:border-indigo-500 focus:outline-none p-3 rounded-xl text-sm text-white placeholder-gray-600 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Email address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                className="w-full bg-[#0f172a] border border-gray-700 hover:border-gray-600 focus:border-indigo-500 focus:outline-none p-3 rounded-xl text-sm text-white placeholder-gray-600 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                  className="w-full bg-[#0f172a] border border-gray-700 hover:border-gray-600 focus:border-indigo-500 focus:outline-none p-3 pr-10 rounded-xl text-sm text-white placeholder-gray-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* PASSWORD STRENGTH */}
            {form.password && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    form.password.length >= level * 3
                      ? level <= 1 ? "bg-red-500"
                      : level <= 2 ? "bg-yellow-500"
                      : level <= 3 ? "bg-blue-500"
                      : "bg-green-500"
                      : "bg-gray-800"
                  }`} />
                ))}
              </div>
            )}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all p-3 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-indigo-500/25 flex justify-center items-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : "Create Account →"}
            </button>
          </div>

          <p className="mt-6 text-center text-gray-500 text-sm">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium transition-colors"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
