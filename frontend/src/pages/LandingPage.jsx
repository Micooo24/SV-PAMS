import React from "react";

export default function LandingPage({ onLogin }) {
  const styles = {
    container: {
      fontFamily: "Poppins, sans-serif",
      width: "100vw",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#e6eaf0",
    },
    navbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 64px",
      backgroundColor: "#002248",
      color: "#ffffff",
      boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
    },
    navLogo: {
      fontWeight: 700,
      fontSize: "24px",
      cursor: "pointer",
    },
    navLinks: {
      display: "flex",
      gap: "24px",
      fontSize: "16px",
      fontWeight: 500,
      cursor: "pointer",
      color: "#ffffff",
    },
    hero: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: "100px 40px",
      backgroundColor: "#ffffff",
    },
    heroTitle: {
      fontSize: "48px",
      fontWeight: 700,
      color: "#003067",
      marginBottom: "16px",
    },
    heroSubtitle: {
      fontSize: "20px",
      color: "#002248",
      maxWidth: "700px",
      marginBottom: "32px",
      lineHeight: "1.6",
    },
    primaryButton: {
      fontFamily: "Poppins, sans-serif",
      fontWeight: 600,
      padding: "16px 32px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
      backgroundColor: "#118df0",
      color: "#ffffff",
      boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
      marginRight: "16px",
    },
    secondaryButton: {
      fontFamily: "Poppins, sans-serif",
      fontWeight: 600,
      padding: "16px 32px",
      borderRadius: "8px",
      border: "2px solid #118df0",
      cursor: "pointer",
      fontSize: "16px",
      backgroundColor: "#ffffff",
      color: "#118df0",
      boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
    },
    section: {
      padding: "60px 64px",
      textAlign: "center",
      backgroundColor: "#f9fafe",
    },
    sectionTitle: {
      fontSize: "36px",
      fontWeight: 700,
      color: "#003067",
      marginBottom: "24px",
    },
    sectionSubtitle: {
      fontSize: "18px",
      color: "#002248",
      maxWidth: "800px",
      margin: "0 auto 48px",
      lineHeight: "1.5",
    },
    featuresContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "30px",
      flexWrap: "wrap",
    },
    featureCard: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "24px",
      width: "250px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxShadow: "0px 6px 12px rgba(0,0,0,0.1)",
      color: "#002248",
    },
    featureIcon: {
      fontSize: "48px",
      color: "#118df0",
      marginBottom: "16px",
    },
    footer: {
      backgroundColor: "#002248",
      color: "#ffffff",
      textAlign: "center",
      padding: "24px",
      marginTop: "40px",
    },
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLogo}>SV-PAMS</div>
        <div style={styles.navLinks}>
          <span onClick={onLogin}>Login</span>
          <span>About</span>
        </div>
      </div>

      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Street Vendor Permit & AI-powered Monitoring System
        </h1>
        <p style={styles.heroSubtitle}>
          SV-PAMS provides a centralized, digital solution to streamline the process of issuing permits 
          to street vendors while ensuring compliance through AI-assisted monitoring. 
          With real-time data synchronization across web and mobile platforms, government agencies 
          can efficiently manage urban vendor operations and maintain public order.
        </p>
        <div>
          <button style={styles.primaryButton} onClick={onLogin}>
            Get Started
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>System Highlights</h2>
        <p style={styles.sectionSubtitle}>
          Key features designed to enhance operational efficiency and regulatory compliance.
        </p>
        <div style={styles.featuresContainer}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📝</div>
            <h3>Vendor Permit Management</h3>
            <p>Streamlined application, approval, and record-keeping of permits.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🤖</div>
            <h3>AI Compliance Monitoring</h3>
            <p>Automated checks to ensure vendors adhere to regulations.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📊</div>
            <h3>Data Analytics</h3>
            <p>Insights and reports for informed decision-making.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📱</div>
            <h3>Web & Mobile Access</h3>
            <p>Manage operations seamlessly across devices in real-time.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        &copy; {new Date().getFullYear()} SV-PAMS. All rights reserved.
      </div>
    </div>
  );
}
