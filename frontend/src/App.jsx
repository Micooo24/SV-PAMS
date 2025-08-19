import React, { useState } from "react";
import Welcome from "./components/Welcome";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("welcome");

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "login":
        return (
          <Login
            onBack={() => handleNavigation("welcome")}
            onRegister={() => handleNavigation("register")}
          />
        );
      case "register":
        return (
          <Register
            onBack={() => handleNavigation("welcome")}
            onLogin={() => handleNavigation("login")}
          />
        );
      case "admin":
        // TODO: Implement admin login page
        alert("Admin login functionality coming soon!");
        return (
          <Welcome
            onLogin={() => handleNavigation("login")}
            onRegister={() => handleNavigation("register")}
            onAdmin={() => handleNavigation("admin")}
          />
        );
      case "welcome":
      default:
        return (
          <Welcome
            onLogin={() => handleNavigation("login")}
            onRegister={() => handleNavigation("register")}
            onAdmin={() => handleNavigation("admin")}
          />
        );
    }
  };

  return <div className="App">{renderCurrentPage()}</div>;
}

export default App;
