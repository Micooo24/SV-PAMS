// App.jsx
import React, { useState } from "react";
import { Toaster } from "react-hot-toast";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import SuperadminDashboard from "./dashboards/SuperadminDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import SanitaryDashboard from "./dashboards/SanitaryDashboard";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import UserSubmissions from "./pages/admin/UserSubmissions";
import BaseDocument from "./pages/admin/BaseDocument";
import UserManagement from "./pages/admin/UserManagement";
import AdminVendorCartMonitoring from "./pages/admin/VendorCartMonitoring";
import ReportStats from "./pages/admin/ReportStats";
import VendorReports from "./pages/admin/VendorReports";
import VendorApplications from "./pages/admin/VendorApplications";

// import Compare from "./test_code/Compare";

import { mockUsers } from "./mockUsers";

function App() {
  // still keeping your old local state
  const [currentPage, setCurrentPage] = useState("welcome");
  const [currentUser, setCurrentUser] = useState(null);

  const handleNavigation = (page) => setCurrentPage(page);

  const handleLogin = (email, password) => {
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password,
    );
    if (!user) return { success: false };

    setCurrentUser(user);

    switch (user.role) {
      case "superadmin":
        setCurrentPage("superadminDashboard");
        break;
      case "admin":
        setCurrentPage("adminDashboard");
        break;
      case "sanitary":
        setCurrentPage("sanitaryDashboard");
        break;
      default:
        setCurrentPage("welcome");
    }

    return { success: true, role: user.role };
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage("welcome");
  };

  return (
    <Router>
      {/*  ADD TOASTER COMPONENT AT TOP LEVEL */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 20,
          right: 20,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 500,
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
            style: {
              background: "#10b981",
              color: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
            style: {
              background: "#ef4444",
              color: "#fff",
            },
          },
          loading: {
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#fff",
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Superadmin */}
        <Route
          path="/superadmin"
          element={<SuperadminDashboard onLogout={handleLogout} />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={<AdminDashboard onLogout={handleLogout} />}
        />
        <Route
          path="/admin/approve-applications"
          element={<VendorApplications onLogout={handleLogout} />}
        />
        <Route path="/admin/documents" element={<BaseDocument />} />
        <Route
          path="/admin/usersubmissions"
          element={<UserSubmissions onLogout={handleLogout} />}
        />
        <Route
          path="/admin/users"
          element={<UserManagement onLogout={handleLogout} />}
        />
        <Route
          path="/admin/vendor-cart-monitoring"
          element={<AdminVendorCartMonitoring onLogout={handleLogout} />}
        />
        <Route path="/admin/reports" element={<ReportStats />} />
        <Route
          path="/admin/vendor-reports"
          element={<VendorReports onLogout={handleLogout} />}
        />

        {/* Sanitary */}
        <Route
          path="/sanitary"
          element={<SanitaryDashboard onLogout={handleLogout} />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* <Route path="/compare" element={<Compare />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
