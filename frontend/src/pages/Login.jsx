import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { Login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("🔐 Login attempt:", { email });

      // ✅ Create FormData for backend (expects 'username' field)
      const loginFormData = new FormData();
      loginFormData.append('email', email); // Backend expects 'email'
      loginFormData.append('password', password);

      // ✅ Call Login from useAuth hook
      const success = await Login(loginFormData);

      if (success) {
        console.log("✅ Login successful!");
        
        // Get user from localStorage to check role
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        console.log("👤 User role:", user?.role);

        // Navigate based on role
        if (user?.role === 'superadmin') {
          navigate('/superadmin');
        } else if (user?.role === 'admin') {
          navigate('/admin');
        } else if (user?.role === 'sanitary') {
          navigate('/sanitary');
        } else {
          navigate('/'); // default for regular users
        }
      } else {
        setError("Login failed. Please check your credentials.");
      }

    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => navigate("/");

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
      opacity: isLoading ? 0.6 : 1,
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
    errorMessage: {
      backgroundColor: "#fee",
      color: "#c33",
      padding: "12px",
      borderRadius: "6px",
      marginBottom: "20px",
      fontSize: "14px",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Login</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={styles.errorMessage}>{error}</div>
          )}

          <label style={styles.label}>Email</label>
          <input
            type="email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            disabled={isLoading}
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
            disabled={isLoading}
          />

          <button 
            type="submit" 
            style={styles.buttonPrimary}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <button 
            type="button" 
            style={styles.buttonSecondary} 
            onClick={handleBack}
            disabled={isLoading}
          >
            Back
          </button>
        </form>

        <div style={styles.footerText}>
          Enter your credentials to access your account.
        </div>
      </div>
    </div>
  );
}