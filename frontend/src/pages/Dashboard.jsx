import { useEffect, useState } from "react";
import * as XLSX from "xlsx"; // For Excel export
import { saveAs } from "file-saver"; // For saving files

import API from "../api/axios";
import { Cell } from "recharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const colors = [
  "#22C55E", // green
  "#3B82F6", // blue
  "#F59E0B", // yellow
  "#EF4444", // red
  "#A855F7", // purple
];

const Dashboard = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [chartData, setChartData] = useState([]); // ✅ FIXED
  const [period, setPeriod] = useState("monthly");
  const [productData, setProductData] = useState([]); // product analytics

  // 🔄 Dashboard Data
  const fetchData = async () => {
    try {
      let url = "/dashboard";

      if (filter) {
        url += `?filter=${filter}`;
      }

      const res = await API.get(url);
      setData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

// excel export
  const exportToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, "inventory-report.xlsx");
  };
  // 📊 PRODUCT ANALYTICS (TOP SELLING PRODUCTS)
  const fetchProductAnalytics = async () => {
    try {
      const res = await API.get("/dashboard/product-analytics");

      console.log("PRODUCT DATA:", res.data);

      const formatted = res.data.map((item) => ({
        name: item.name,
        sales: item.sales, // ✅ FIXED
      }));

      setProductData(formatted);

    } catch (error) {
      console.log(error);
    }
  };

  // 📊 Analytics Data
  const fetchAnalytics = async () => {
    try {
      const res = await API.get(`/dashboard/analytics?period=${period}`);

      // 📅 LABEL MAPS
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

        if (period === "monthly") {
          label = monthLabels[item._id];
        } else if (period === "weekly") {
          label = weekLabels[item._id];
        } else if (period === "yearly") {
          label = item._id.toString(); // year 그대로
        }

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

  // 🔁 Load data
  useEffect(() => {
    setLoading(true);

    Promise.all([fetchData(), fetchAnalytics()]).finally(() =>
      setLoading(false)
    );
    fetchProductAnalytics();

  }, [period]);

  // ⏳ Loader
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>

      {/* 📅 FILTER */}
      <div className="mb-6 flex gap-2">
        <select
          className="bg-[#111827] border border-gray-700 p-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>

        <button
          onClick={fetchData}
          className="bg-indigo-500 px-4 rounded"
        >
          Apply
        </button>

        {/* 📊 Period Selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-[#111827] border border-gray-700 p-2 rounded"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* 📊 CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-[#111827] p-4 rounded border border-gray-800">
          <h2>Total Sales</h2>
          <p className="text-xl text-green-400">₹{data.totalSales || 0}</p>
        </div>

        <div className="bg-[#111827] p-4 rounded border border-gray-800">
          <h2>Total Purchase</h2>
          <p className="text-xl text-yellow-400">₹{data.totalPurchase || 0}</p>
        </div>

        <div className="bg-[#111827] p-4 rounded border border-gray-800">
          <h2>Profit</h2>
          <p className="text-xl text-indigo-400">₹{data.profit || 0}</p>
        </div>

        <div className="bg-[#111827] p-4 rounded border border-gray-800">
          <h2>Transactions</h2>
          <p className="text-xl">{data.totalTransactions || 0}</p>
        </div>
        <button
          onClick={() => exportToExcel(chartData)}
          className="bg-green-500 px-4 py-2 rounded"
        >
          Export Excel
        </button>

      </div>

      {/* 📈 REAL CHART */}
      <div className="mt-8 bg-[#111827] p-4 rounded border border-gray-800">

        <h2 className="mb-4">Analytics</h2>

        <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 200 : 300}>
          <BarChart data={chartData} barGap={10} barCategoryGap="20%">

            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />

            <Tooltip />

            <Legend />
            <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
              {productData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
            <Bar dataKey="purchase" fill="#EF4444" radius={[6, 6, 0, 0]} />
            <Bar dataKey="profit" fill="#6366F1" />

          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 bg-[#111827] p-4 rounded border border-gray-800">

        <h2 className="mb-4">Top Products</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={productData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Bar dataKey="sales" fill="#22C55E" />
          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
};

export default Dashboard;