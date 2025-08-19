import React from "react";
import "./Welcome.css";

const Welcome = ({ onLogin, onRegister, onAdmin }) => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-header">
          <h1>Welcome to VendorPermitPro</h1>
          <p className="welcome-subtitle">
            Local Government Unit - Vendor Permit Management System
          </p>
        </div>

        <div className="welcome-description">
          <p>
            Streamline vendor permitting, appointment scheduling, and compliance
            tracking with our comprehensive management system for local
            government units.
          </p>
        </div>

        <div className="welcome-features">
          <div className="feature">
            <h3>📋 Online Permit Applications</h3>
            <p>
              Vendors can submit detailed applications with document uploads
            </p>
          </div>
          <div className="feature">
            <h3>📅 Appointment Scheduling</h3>
            <p>Manage and track appointments with calendar integration</p>
          </div>
          <div className="feature">
            <h3>📱 QR Code Generation</h3>
            <p>Generate and download unique QR codes for vendor permits</p>
          </div>
          <div className="feature">
            <h3>📍 Geolocation Tracking</h3>
            <p>Monitor vendor locations and compliance areas in real-time</p>
          </div>
          <div className="feature">
            <h3>🤖 AI Image Processing</h3>
            <p>Detect unauthorized vendors through image analysis</p>
          </div>
          <div className="feature">
            <h3>📊 Analytics Dashboard</h3>
            <p>Generate comprehensive reports on permits and violations</p>
          </div>
        </div>

        <div className="welcome-actions">
          <button className="btn btn-primary" onClick={onLogin}>
            Vendor Login
          </button>
          <button className="btn btn-secondary" onClick={onRegister}>
            Vendor Registration
          </button>
          <button className="btn btn-admin" onClick={onAdmin}>
            Admin Access
          </button>
        </div>

        <div className="welcome-footer">
          <p>For government officials and enforcement officers</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
