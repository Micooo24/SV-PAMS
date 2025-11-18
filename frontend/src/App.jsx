// App.jsx
import React, { useState } from "react";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import SuperadminDashboard from "./dashboards/SuperadminDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import SanitaryDashboard from "./dashboards/SanitaryDashboard";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import UserSubmissions from "./pages/admin/UserSubmissions";
import BaseDocument from "./pages/admin/BaseDocument";

import Compare from "./test_code/Compare";

import { mockUsers } from "./mockUsers";

function App() {
  // still keeping your old local state
  const [currentPage, setCurrentPage] = useState("welcome");
  const [currentUser, setCurrentUser] = useState(null);

  const handleNavigation = (page) => setCurrentPage(page);

  const handleLogin = (email, password) => {
    const user = mockUsers.find((u) => u.email === email && u.password === password);
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

  // ————————————————
  // 🔵 OLD CODE (your previous page switching logic)
  // ————————————————
  // const renderCurrentPage = () => {
  //   switch(currentPage) {
  //     case "login":
  //       return <Login onBack={() => handleNavigation("welcome")} onLogin={handleLogin} />;
  //     case "superadminDashboard":
  //       return <SuperadminDashboard onLogout={handleLogout} />;
  //     case "adminDashboard":
  //       return <AdminDashboard onLogout={handleLogout} />;
  //     case "sanitaryDashboard":
  //       return <SanitaryDashboard onLogout={handleLogout} />;
  //     case "welcome":
  //     default:
  //       return <LandingPage onLogin={() => handleNavigation("login")} onRegister={() => handleNavigation("register")} />;
  //   }
  // };

  // return (
  //   <div className="App">
  //     {renderCurrentPage()}
  //   </div>
  // );
  // ————————————————
  // END OF OLD CODE (still preserved)
  // ————————————————

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Superadmin */}
        <Route path="/superadmin" element={<SuperadminDashboard onLogout={handleLogout} />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard onLogout={handleLogout} />} />
        <Route path="/admin/documents" element={<BaseDocument />} />
        <Route path="/admin/usersubmissions" element={<UserSubmissions onLogout={handleLogout} />} />

        {/* Sanitary */}
        <Route path="/sanitary" element={<SanitaryDashboard onLogout={handleLogout} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/compare" element={<Compare />} />
      </Routes>

    </Router>
  );
}

export default App;
