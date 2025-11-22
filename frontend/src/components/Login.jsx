import React, { useState } from "react";
import "./Auth.css";
import axios from "axios";

const BASE_URL = "http://192.168.1.7:8000";

const Login = ({ onBack, onRegister }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting login for:", formData.email);
      console.log("Using BASE_URL:", BASE_URL);

      const response = await axios.post(
        `${BASE_URL}/api/users/login`,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("Login successful:", response.data);

      // Store token if provided
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }

      alert("Login successful!");

      // Handle navigation or state update here
      // e.g., redirect to dashboard
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        baseURL: BASE_URL,
      });

      let errorMessage = "Login failed. Please try again.";

      if (error.message === "Network Error") {
        errorMessage = `Cannot connect to server at ${BASE_URL}\n\nPlease check:\n1. Backend server is running\n2. IP address is correct (192.168.1.7)\n3. Both devices are on same network\n4. No firewall blocking the connection`;
      } else if (error.response) {
        errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Invalid email or password";
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-header">
          <button className="back-btn" onClick={onBack}>
            ← Back to Welcome
          </button>
          <h2>Vendor Login</h2>
          <p>Access your vendor account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <button className="link-btn" onClick={onRegister}>
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
