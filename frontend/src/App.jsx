import React, { useState } from "react";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import SuperadminDashboard from "./dashboards/SuperadminDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import SanitaryDashboard from "./dashboards/SanitaryDashboard";
import { mockUsers } from "./mockUsers";

function App() {
  const [currentPage, setCurrentPage] = useState("welcome");
  const [currentUser, setCurrentUser] = useState(null);

  const handleNavigation = (page) => setCurrentPage(page);

  const handleLogin = (email, password) => {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) return alert("Invalid credentials (mock)");

    setCurrentUser(user);

    switch(user.role) {
      case "superadmin": setCurrentPage("superadminDashboard"); break;
      case "admin": setCurrentPage("adminDashboard"); break;
      case "sanitary": setCurrentPage("sanitaryDashboard"); break;
      default: setCurrentPage("welcome");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage("welcome");
  };

  const renderCurrentPage = () => {
    switch(currentPage) {
      case "login": return <Login onBack={() => handleNavigation("welcome")} onLogin={handleLogin} />;
      case "superadminDashboard": return <SuperadminDashboard onLogout={handleLogout} />;
      case "adminDashboard": return <AdminDashboard onLogout={handleLogout} />;
      case "sanitaryDashboard": return <SanitaryDashboard onLogout={handleLogout} />;
      case "welcome":
      default: return <LandingPage onLogin={() => handleNavigation("login")} onRegister={() => handleNavigation("register")} />;
    }
  };

  return <div className="App">{renderCurrentPage()}</div>;
}

export default App;
