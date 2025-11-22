import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalFonts } from "../hooks/font";
import FloatingNavBar from "../components/FloatingNavBar";

const Home = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();

  const features = [
    {
      icon: "shield-checkmark",
      title: "Secure Verification",
      description:
        "AI-powered document authentication ensures vendor legitimacy",
      color: "#10b981",
      gradient: ["#10b981", "#059669"],
    },
    {
      icon: "analytics",
      title: "Smart Analytics",
      description: "Real-time monitoring and compliance tracking for vendors",
      color: "#3b82f6",
      gradient: ["#3b82f6", "#2563eb"],
    },
    {
      icon: "camera",
      title: "Cart Detection",
      description:
        "Advanced AI recognizes and tracks vendor carts automatically",
      color: "#f59e0b",
      gradient: ["#f59e0b", "#d97706"],
    },
    {
      icon: "document-text",
      title: "Digital Permits",
      description: "Streamlined permit management and instant verification",
      color: "#8b5cf6",
      gradient: ["#8b5cf6", "#7c3aed"],
    },
  ];

  const stats = [
    { icon: "people", value: "500+", label: "Verified Vendors" },
    { icon: "checkmark-circle", value: "98%", label: "Success Rate" },
    { icon: "flash", value: "2min", label: "Avg Processing" },
  ];

  const quickActions = [
    {
      icon: "document-text",
      title: "Submit Documents",
      subtitle: "Upload for AI verification",
      screen: "DocSubmission",
      color: "#2563eb",
    },
    {
      icon: "time",
      title: "View History",
      subtitle: "Check past activities",
      screen: "VendorCarts",
      color: "#8b5cf6",
    },
  ];

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBackground}>
            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />
          </View>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>SV</Text>
            <View style={styles.logoBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.title}>SV: PAMS</Text>
          <Text style={styles.subtitle}>
            Street Vendor Permit and Monitoring System
          </Text>
          <Text style={styles.tagline}>
            Empowering street vendors through AI-powered compliance
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name={stat.icon} size={24} color="#2563eb" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { borderLeftColor: action.color }]}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: action.color + "15" },
                ]}
              >
                <Ionicons name={action.icon} size={28} color={action.color} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Features Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose SV: PAMS?</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View
                  style={[
                    styles.featureIconContainer,
                    { backgroundColor: feature.color + "15" },
                  ]}
                >
                  <Ionicons
                    name={feature.icon}
                    size={32}
                    color={feature.color}
                  />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Benefits</Text>
          <View style={styles.benefitsContainer}>
            {[
              {
                icon: "rocket",
                text: "Fast permit processing with AI assistance",
              },
              {
                icon: "lock-closed",
                text: "Secure document storage and verification",
              },
              { icon: "phone-portrait", text: "Mobile-first easy access" },
              {
                icon: "notifications",
                text: "Real-time status updates and alerts",
              },
              {
                icon: "trending-up",
                text: "Improved compliance and transparency",
              },
              { icon: "people", text: "Community-driven vendor support" },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitIconContainer}>
                  <Ionicons name={benefit.icon} size={20} color="#2563eb" />
                </View>
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {[
            {
              step: "1",
              title: "Register & Verify",
              description: "Create your account and verify your identity",
              icon: "person-add",
              color: "#3b82f6",
            },
            {
              step: "2",
              title: "Submit Documents",
              description: "Upload required documents for AI analysis",
              icon: "cloud-upload",
              color: "#8b5cf6",
            },
            {
              step: "3",
              title: "AI Processing",
              description: "Our AI verifies and compares your documents",
              icon: "hardware-chip",
              color: "#f59e0b",
            },
            {
              step: "4",
              title: "Get Approved",
              description: "Receive your digital permit instantly",
              icon: "checkmark-done-circle",
              color: "#10b981",
            },
          ].map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View
                style={[styles.stepNumber, { backgroundColor: step.color }]}
              >
                <Text style={styles.stepNumberText}>{step.step}</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Ionicons name={step.icon} size={24} color={step.color} />
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <Ionicons name="rocket" size={48} color="#2563eb" />
            <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
            <Text style={styles.ctaDescription}>
              Join hundreds of verified vendors using SV: PAMS for seamless
              permit management
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate("DocSubmission")}
            >
              <Text style={styles.ctaButtonText}>Start Verification</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <FloatingNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: "relative",
    overflow: "hidden",
  },
  heroBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#2563eb",
    opacity: 0.05,
    top: -100,
    right: -100,
  },
  heroCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#8b5cf6",
    opacity: 0.05,
    bottom: -50,
    left: -50,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    position: "relative",
  },
  logoText: {
    fontSize: 40,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },
  logoBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#f8fafc",
  },
  title: {
    fontSize: 36,
    fontFamily: "Poppins-Bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#64748b",
    textAlign: "center",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#94a3b8",
    textAlign: "center",
    fontStyle: "italic",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#64748b",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#64748b",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#1e293b",
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#64748b",
    lineHeight: 18,
  },
  benefitsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  benefitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#475569",
    lineHeight: 20,
  },
  stepCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#1e293b",
  },
  stepDescription: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#64748b",
    lineHeight: 20,
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 20,
  },
  ctaCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  ctaTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaButton: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    gap: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },
});

export default Home;
