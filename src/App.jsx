import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from './components/AuthContext';
import Dashboard from "./components/user-dashboard/UserDashboard"; // Import user dashboard
import AdminDashboard from "./components/admin-dashboard/AdminDashboard"; // Import admin dashboard
import Login from "./components/Login";
import ShiftScheduleWrapper from "./components/user-dashboard/ShiftScheduleWrapper";
import ShiftSwapRequests from "./components/user-dashboard/ShiftSwapRequests";
import SwapRequests from "./components/admin-dashboard/SwapRequests";

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* User Dashboard Route */}
        <Route
          path="/user-dashboard"
          element={
            user?.role === "Agent" || user?.role === "teamleader" ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Admin Dashboard Route */}
        <Route
          path="/admin-dashboard"
          element={user?.role === "Admin" ? <AdminDashboard /> : <Navigate to="/login" />}
        />

        {/* Shift Schedule Route - Accessible by Admin and the user themselves */}
        <Route
          path="/user/:userId/schedule"
          element={
            user ? (
              <ShiftScheduleWrapper />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Shift Swap Requests Route */}
        <Route
          path="/shift-swap"
          element={
            user ? (
              <ShiftSwapRequests userId={user.userid} isAdmin={user.role === 'Admin'} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Admin Swap Requests Route */}
        <Route
          path="/admin/swap-requests"
          element={user?.role === "Admin" ? <SwapRequests /> : <Navigate to="/login" />}
        />

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;