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
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin h-10 w-10 border-t-2 border-indigo-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 max-w-7xl mx-auto">

      {/* OVERALL */}
      <div className="bg-[#020617] border border-gray-800 p-4 rounded-xl mb-5">
        <h2 className="text-sm sm:text-base text-gray-400 mb-3">Overall (All Branches)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Transactions", value: overallData.totalTransactions || 0, color: "text-white" },
            { label: "Sales", value: `₹${overallData.totalSales || 0}`, color: "text-green-400" },
            { label: "Purchase", value: `₹${overallData.totalPurchase || 0}`, color: "text-red-400" },
            { label: "Profit", value: `₹${overallData.profit || 0}`, color: "text-indigo-400" },
          ].map((item) => (
            <div key={item.label} className="bg-[#111827] p-3 rounded-lg">
              <p className="text-gray-400 text-xs">{item.label}</p>
              <p className={`${item.color} text-base sm:text-lg font-bold mt-1`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FILTER */}
      <div className="mb-5 flex flex-wrap gap-2">
        <select
          value={period}
          onChange={(e) => { setFilter(e.target.value); setPeriod(e.target.value); }}
          className="bg-[#111827] border border-gray-700 p-2 rounded text-sm flex-1 min-w-[120px]"
        >
          <option value="">All</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
        <button onClick={exportToExcel} className="bg-green-500 px-4 py-2 rounded text-sm whitespace-nowrap">
          Export Excel
        </button>
      </div>

      {/* BRANCH CARD */}
      <div className="bg-gradient-to-br from-[#020617] to-[#0f172a] border border-gray-800 p-4 rounded-xl mb-5 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-white">
              {viewMode === "all" ? "All Branches" : branches.find(b => b._id === branchId)?.name || "Selected Branch"}
            </h2>
            <p className="text-xs text-gray-400">
              {viewMode === "all" ? "Combined performance" : "Branch performance"}
            </p>
          </div>
          <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded">
            {viewMode === "all" ? "ALL" : "BRANCH"}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Transactions", value: data.totalTransactions || 0, color: "text-white" },
            { label: "Sales", value: `₹${data.totalSales || 0}`, color: "text-green-400" },
            { label: "Purchase", value: `₹${data.totalPurchase || 0}`, color: "text-red-400" },
            { label: "Profit", value: `₹${data.profit || 0}`, color: data.profit >= 0 ? "text-indigo-400" : "text-red-400" },
          ].map((item) => (
            <div key={item.label} className="bg-[#111827] p-3 rounded-lg border border-gray-700 hover:scale-105 transition">
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className={`${item.color} text-base sm:text-lg font-bold mt-1`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CHART */}
      <div className="bg-[#111827] p-4 rounded-xl border border-gray-800 mb-5">
        <h2 className="text-sm sm:text-base font-semibold mb-3">Analytics</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} width={50} />
            <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="sales">
              {chartData.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
            <Bar dataKey="purchase" fill="#EF4444" />
            <Bar dataKey="profit" fill="#6366F1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TOP PRODUCTS */}
      <div className="bg-[#111827] p-4 rounded-xl border border-gray-800">
        <h2 className="text-sm sm:text-base font-semibold mb-3">Top Products</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={productData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} width={50} />
            <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", fontSize: 12 }} />
            <Bar dataKey="sales" fill="#22C55E" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default Dashboard;