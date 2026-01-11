import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function AdminDashboard({ onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  const styles = {
    container: {
      display: "flex",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      backgroundColor: "#e6eaf0",
    },
    main: {
      flexGrow: 1,
      width: "100%",
      height: "100vh",
      padding: "40px",
      backgroundColor: "#e6eaf0",
      overflowY: "auto",
      transition: "margin-left 0.3s ease",
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
      margin: 0,
    },
    logoutButton: {
      padding: "10px 20px",
      backgroundColor: "#118df0",
      color: "#ffffff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: 600,
      transition: "background-color 0.3s ease",
    },
    contentCard: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "30px",
      boxShadow: "0px 6px 12px rgba(0,0,0,0.1)",
      minHeight: "300px",
      color: "#002248",
    },
    welcomeTitle: {
      fontSize: "24px",
      fontWeight: 600,
      color: "#003067",
      marginBottom: "16px",
      marginTop: 0,
    },
    description: {
      fontSize: "16px",
      lineHeight: "1.6",
      color: "#334155",
      marginBottom: "12px",
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar role="admin" collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Dashboard</h1>
        </div>

        <div style={styles.contentCard}>
          <h2 style={styles.welcomeTitle}>Welcome, Admin!</h2>
          <p style={styles.description}>
            This dashboard allows you to manage street vendors, approve permit applications,
            and generate reports. You can also monitor system compliance in real-time.
          </p>
          <p style={styles.description}>
            Placeholder for future widgets, analytics, and system operations.
          </p>
        </div>
      </main>
    </div>
  );
}