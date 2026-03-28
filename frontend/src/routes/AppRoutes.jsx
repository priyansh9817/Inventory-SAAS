import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Transactions from "../pages/Transactions";
import Layout from "../components/Layout";
import PrivateRoute from "./PrivateRoute";
import Ledger from "../pages/Ledger";
import DeletedTransactions from "../pages/DeletedTransactions";
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Layout><Products /></Layout></PrivateRoute>} />
        <Route path="/transactions" element={<PrivateRoute><Layout><Transactions /></Layout></PrivateRoute>} />
        <Route path="/ledger" element={<PrivateRoute><Layout><Ledger /></Layout></PrivateRoute>} />
        <Route path="/deleted-transactions" element={<PrivateRoute><Layout><DeletedTransactions /></Layout></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;