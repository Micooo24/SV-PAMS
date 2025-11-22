import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const Introduction = ({ navigation }) => {
  const features = [
    {
      icon: "shield-checkmark",
      title: "Secure Vendor Management",
      description:
        "Manage and verify street vendors with comprehensive documentation",
    },
    {
      icon: "location",
      title: "Real-time Cart Detection",
      description: "Detect and track vendor carts using advanced AI technology",
    },
    {
      icon: "document-text",
      title: "Document Submission",
      description: "Easy and secure document submission process for vendors",
    },
    {
      icon: "analytics",
      title: "Permit Analytics",
      description: "Track and analyze vendor permits and compliance status",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="cart" size={60} color="#118df0" />
          </View>
          <Text style={styles.title}>SV-PAMS</Text>
          <Text style={styles.subtitle}>
            Street Vendor Permit and Monitoring System
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name={feature.icon} size={32} color="#118df0" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Section */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Auth")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6eaf0",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#002248",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#002248",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#003067",
    textAlign: "center",
    fontWeight: "500",
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#002248",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e6eaf0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#002248",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: "#6683a4",
    lineHeight: 18,
  },
  ctaContainer: {
    marginTop: 20,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#118df0",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#118df0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
});

export default Introduction;
