// src/dashboards/SuperadminDashboard.jsx
import React from "react";
import Sidebar from "../components/Sidebar";

export default function SuperadminDashboard({ onLogout }) {
  const styles = {
    main: {
      flex: 1,
      padding: "40px",
      backgroundColor: "#e6eaf0",
      minHeight: "100vh",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "40px",
    },
    title: {
      fontSize: "32px",
      fontWeight: 700,
      color: "#003067",
    },
    logoutButton: {
      padding: "10px 20px",
      backgroundColor: "#118df0",
      color: "#ffffff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: 600,
    },
    contentCard: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "30px",
      boxShadow: "0px 6px 12px rgba(0,0,0,0.1)",
      minHeight: "300px",
      color: "#002248",
    },
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar role="superadmin" />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Superadmin Dashboard</h1>
          <button style={styles.logoutButton} onClick={onLogout}>
            Logout
          </button>
        </div>

        <div style={styles.contentCard}>
          <h2>Welcome, Superadmin!</h2>
          <p>
            This dashboard allows you to manage the system at the highest level.
            You can oversee admins, monitor vendor permits, and review system reports.
          </p>
          <p>Placeholder for future widgets, analytics, and system controls.</p>
        </div>
      </main>
    </div>
  );
}
