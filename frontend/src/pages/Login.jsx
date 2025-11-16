// src/pages/Login.jsx
import React, { useState } from "react";

export default function Login({ onBack, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const styles = {
    page: {
      fontFamily: "Poppins, sans-serif",
      width: "100vw",
      minHeight: "100vh",
      backgroundColor: "#f9fafe",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "30px",
    },
    container: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "30px 50px",
      width: "450px",
      boxShadow: "0px 8px 20px rgba(0,0,0,0.1)",
    },
    title: {
      fontSize: "32px",
      fontWeight: 700,
      color: "#003067",
      marginBottom: "32px",
      textAlign: "center",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: 500,
      color: "#002248",
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      marginBottom: "20px",
      borderRadius: "6px",
      border: "1px solid #cccccc",
      fontSize: "14px",
    },
    buttonPrimary: {
      width: "100%",
      padding: "14px",
      backgroundColor: "#118df0",
      color: "#ffffff",
      fontWeight: 600,
      fontSize: "16px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      marginBottom: "12px",
    },
    buttonSecondary: {
      width: "100%",
      padding: "14px",
      backgroundColor: "#ffffff",
      color: "#118df0",
      fontWeight: 600,
      fontSize: "16px",
      border: "2px solid #118df0",
      borderRadius: "8px",
      cursor: "pointer",
    },
    footerText: {
      marginTop: "20px",
      fontSize: "14px",
      color: "#666",
      textAlign: "center",
    },
    backLink: {
      color: "#118df0",
      cursor: "pointer",
      textDecoration: "underline",
      marginTop: "10px",
      display: "inline-block",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Login</h2>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />

          <button type="submit" style={styles.buttonPrimary}>
            Login
          </button>
          <button type="button" style={styles.buttonSecondary} onClick={onBack}>
            Back
          </button>
        </form>

        <div style={styles.footerText}>
          This is a mock login. Use the provided accounts to test different roles.
        </div>
      </div>
    </div>
  );
}
