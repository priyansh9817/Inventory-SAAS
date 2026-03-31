import { useEffect, useState, useContext } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import API from "../api/axios";
import { BranchContext } from "../context/BranchContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";

const colors = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#A855F7"];

const Dashboard = () => {
  const { branchId, branches} = useContext(BranchContext);
  
  const [data, setData] = useState({});
  const [overallData, setOverallData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [productData, setProductData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [viewMode, setViewMode] = useState("branch"); // 🔥 NEW

  // 🔄 Dashboard Data
  const fetchData = async () => {
    try {
      let url = "/dashboard?";

      if (viewMode === "branch" && branchId) {
        url += `branchId=${branchId}`;
      } else {
        url += `branchId=all`;
      }

      if (filter) {
        url += `&filter=${filter}`;
      }

      const res = await API.get(url);
      setData(res.data);
      setChartData(res.data.chartData || []);
    } catch (error) {
      console.log(error);
    }
  };

  // 

  const fetchOverallData = async () => {
  try {
    const res = await API.get("/dashboard?branchId=all");
    setOverallData(res.data);
  } catch (error) {
    console.log(error);
  }
};

  // 📊 Analytics Data
  const fetchAnalytics = async () => {
    try {
      let url = `/dashboard/analytics?period=${period}`;

      if (viewMode === "branch" && branchId) {
        url += `&branchId=${branchId}`;
      } else {
        url += `&branchId=all`;
      }

      const res = await API.get(url);

      const monthLabels = {
        1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr",
        5: "May", 6: "Jun", 7: "Jul", 8: "Aug",
        9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
      };

      const weekLabels = {
        1: "Sun", 2: "Mon", 3: "Tue",
        4: "Wed", 5: "Thu", 6: "Fri", 7: "Sat",
      };

      const formatted = res.data.map((item) => {
        let label = item._id;

        if (period === "monthly") label = monthLabels[item._id];
        else if (period === "weekly") label = weekLabels[item._id];

        return {
          name: label,
          sales: item.totalSales || 0,
          purchase: item.totalPurchase || 0,
          profit: item.profit || 0,
        };
      });

      setChartData(formatted);

    } catch (error) {
      console.log(error);
    }
  };

  // 📊 Product Analytics
  const fetchProductAnalytics = async () => {
    try {
      let url = "/dashboard/product-analytics";

      if (viewMode === "branch" && branchId) {
        url += `?branchId=${branchId}`;
      } else {
        url += `?branchId=all`;
      }

      const res = await API.get(url);

      const formatted = res.data.map((item) => ({
        name: item.name,
        sales: item.sales,
      }));

      setProductData(formatted);

    } catch (error) {
      console.log(error);
    }
  };

  // 📤 Export Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(chartData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, "dashboard-report.xlsx");
  };

  // 🔁 Load data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchOverallData(),
      fetchData(),
      fetchProductAnalytics(),
    ]).finally(() => setLoading(false));
  }, [branchId, period, viewMode, filter]);

  // ⏳ Loader
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-3">
        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
        <p className="text-gray-500 text-sm animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const branchName = branches.find(b => b._id === branchId)?.name || "Selected Branch";

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto animate-fadeIn">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">{branchName} &mdash; Live Overview</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => { setFilter(e.target.value); setPeriod(e.target.value); }}
            className="bg-[#111827] border border-gray-700 hover:border-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors p-2 rounded-lg text-sm"
          >
            <option value="">All Time</option>
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="quarterly">This Quarter</option>
            <option value="yearly">This Year</option>
          </select>
          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-500 active:scale-95 transition-all px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-green-500/25 whitespace-nowrap"
          >
            ↓ Export
          </button>
        </div>
      </div>

      {/* OVERALL STATS */}
      <p className="text-xs uppercase tracking-widest text-gray-600 mb-2">All Branches</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Transactions", value: overallData.totalTransactions || 0, color: "text-white", bg: "from-gray-800 to-gray-900", glow: "hover:shadow-white/5", icon: "📦", border: "hover:border-gray-600" },
          { label: "Total Sales", value: `₹${overallData.totalSales || 0}`, color: "text-green-400", bg: "from-green-900/30 to-gray-900", glow: "hover:shadow-green-500/20", icon: "📈", border: "hover:border-green-500/40" },
          { label: "Total Purchase", value: `₹${overallData.totalPurchase || 0}`, color: "text-red-400", bg: "from-red-900/30 to-gray-900", glow: "hover:shadow-red-500/20", icon: "🛒", border: "hover:border-red-500/40" },
          { label: "Net Profit", value: `₹${overallData.profit || 0}`, color: "text-indigo-400", bg: "from-indigo-900/30 to-gray-900", glow: "hover:shadow-indigo-500/20", icon: "💰", border: "hover:border-indigo-500/40" },
        ].map((item) => (
          <div key={item.label} className={`bg-gradient-to-br ${item.bg} border border-gray-800 ${item.border} rounded-2xl p-4 hover:scale-[1.03] hover:shadow-xl ${item.glow} transition-all duration-250 cursor-default group`}>
            <div className="flex justify-between items-start">
              <p className="text-gray-400 text-xs font-medium">{item.label}</p>
              <span className="text-lg group-hover:scale-125 transition-transform duration-200">{item.icon}</span>
            </div>
            <p className={`${item.color} text-lg sm:text-2xl font-bold mt-2 tracking-tight`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* BRANCH STATS */}
      <p className="text-xs uppercase tracking-widest text-gray-600 mb-2">Branch — {branchName}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Transactions", value: data.totalTransactions || 0, color: "text-white", bg: "from-gray-800 to-gray-900", glow: "hover:shadow-white/5", icon: "📦", border: "hover:border-gray-600" },
          { label: "Sales", value: `₹${data.totalSales || 0}`, color: "text-green-400", bg: "from-green-900/30 to-gray-900", glow: "hover:shadow-green-500/20", icon: "📈", border: "hover:border-green-500/40" },
          { label: "Purchase", value: `₹${data.totalPurchase || 0}`, color: "text-red-400", bg: "from-red-900/30 to-gray-900", glow: "hover:shadow-red-500/20", icon: "🛒", border: "hover:border-red-500/40" },
          { label: "Profit", value: `₹${data.profit || 0}`, color: data.profit >= 0 ? "text-indigo-400" : "text-red-400", bg: data.profit >= 0 ? "from-indigo-900/30 to-gray-900" : "from-red-900/30 to-gray-900", glow: "hover:shadow-indigo-500/20", icon: data.profit >= 0 ? "💰" : "📉", border: "hover:border-indigo-500/40" },
        ].map((item) => (
          <div key={item.label} className={`bg-gradient-to-br ${item.bg} border border-gray-800 ${item.border} rounded-2xl p-4 hover:scale-[1.03] hover:shadow-xl ${item.glow} transition-all duration-250 cursor-default group`}>
            <div className="flex justify-between items-start">
              <p className="text-gray-400 text-xs font-medium">{item.label}</p>
              <span className="text-lg group-hover:scale-125 transition-transform duration-200">{item.icon}</span>
            </div>
            <p className={`${item.color} text-lg sm:text-2xl font-bold mt-2 tracking-tight`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* ANALYTICS CHART */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] border border-gray-800 hover:border-indigo-500/30 rounded-2xl p-4 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs uppercase tracking-widest text-gray-500">Analytics</p>
            <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">{period || "All"}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#4B5563" tick={{ fontSize: 10 }} />
              <YAxis stroke="#4B5563" tick={{ fontSize: 10 }} width={45} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, fontSize: 12 }}
                cursor={{ fill: "rgba(99,102,241,0.07)" }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="sales" radius={[6, 6, 0, 0]} fill="#22C55E" />
              <Bar dataKey="purchase" fill="#EF4444" radius={[6, 6, 0, 0]} />
              <Bar dataKey="profit" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* TOP PRODUCTS CHART */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] border border-gray-800 hover:border-green-500/30 rounded-2xl p-4 shadow-lg hover:shadow-green-500/10 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs uppercase tracking-widest text-gray-500">Top Products</p>
            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">By Sales</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={productData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#4B5563" tick={{ fontSize: 10 }} />
              <YAxis stroke="#4B5563" tick={{ fontSize: 10 }} width={45} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, fontSize: 12 }}
                cursor={{ fill: "rgba(34,197,94,0.07)" }}
              />
              <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                {productData.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;