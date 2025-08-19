import React, { useState } from "react";
import "./Auth.css";

const Register = ({ onBack, onLogin }) => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    middlename: "",
    address: "",
    barangay: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
    mobile_no: "",
    landline_no: "",
    zip_code: "",
    gender: "",
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

  const calculateAge = (birthday) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    const requiredFields = [
      "firstname",
      "lastname",
      "address",
      "barangay",
      "email",
      "password",
      "birthday",
      "mobile_no",
      "zip_code",
      "gender",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")
        } is required`;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Mobile number validation
    if (formData.mobile_no && !/^\d{11}$/.test(formData.mobile_no)) {
      newErrors.mobile_no = "Mobile number must be 11 digits";
    }

    // Zip code validation
    if (formData.zip_code && !/^\d{4}$/.test(formData.zip_code)) {
      newErrors.zip_code = "Zip code must be 4 digits";
    }

    // Age validation
    if (formData.birthday) {
      const age = calculateAge(formData.birthday);
      if (age < 18) {
        newErrors.birthday = "Must be at least 18 years old";
      }
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
      const registrationData = {
        ...formData,
        age: calculateAge(formData.birthday),
        mobile_no: parseInt(formData.mobile_no),
        zip_code: parseInt(formData.zip_code),
        role: "vendor",
      };

      delete registrationData.confirmPassword;

      // TODO: Implement actual registration API call
      console.log("Registration attempt:", registrationData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Handle successful registration
      alert("Registration successful! You can now login.");
      onLogin();
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ general: "Registration failed. Please try again." });
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
          <h2>Vendor Registration</h2>
          <p>Create your vendor account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstname">First Name *</label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className={errors.firstname ? "error" : ""}
                placeholder="Enter first name"
              />
              {errors.firstname && (
                <span className="error-message">{errors.firstname}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastname">Last Name *</label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className={errors.lastname ? "error" : ""}
                placeholder="Enter last name"
              />
              {errors.lastname && (
                <span className="error-message">{errors.lastname}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="middlename">Middle Name</label>
            <input
              type="text"
              id="middlename"
              name="middlename"
              value={formData.middlename}
              onChange={handleChange}
              placeholder="Enter middle name (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                placeholder="Enter password"
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "error" : ""}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? "error" : ""}
              placeholder="Enter complete address"
            />
            {errors.address && (
              <span className="error-message">{errors.address}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="barangay">Barangay *</label>
              <input
                type="text"
                id="barangay"
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                className={errors.barangay ? "error" : ""}
                placeholder="Enter barangay"
              />
              {errors.barangay && (
                <span className="error-message">{errors.barangay}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="zip_code">Zip Code *</label>
              <input
                type="text"
                id="zip_code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                className={errors.zip_code ? "error" : ""}
                placeholder="Enter zip code"
                maxLength="4"
              />
              {errors.zip_code && (
                <span className="error-message">{errors.zip_code}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="birthday">Birthday *</label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className={errors.birthday ? "error" : ""}
              />
              {errors.birthday && (
                <span className="error-message">{errors.birthday}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={errors.gender ? "error" : ""}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <span className="error-message">{errors.gender}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mobile_no">Mobile Number *</label>
              <input
                type="tel"
                id="mobile_no"
                name="mobile_no"
                value={formData.mobile_no}
                onChange={handleChange}
                className={errors.mobile_no ? "error" : ""}
                placeholder="09XXXXXXXXX"
                maxLength="11"
              />
              {errors.mobile_no && (
                <span className="error-message">{errors.mobile_no}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="landline_no">Landline (Optional)</label>
              <input
                type="tel"
                id="landline_no"
                name="landline_no"
                value={formData.landline_no}
                onChange={handleChange}
                placeholder="Enter landline number"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <button className="link-btn" onClick={onLogin}>
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
