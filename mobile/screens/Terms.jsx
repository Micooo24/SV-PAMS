import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useGlobalFonts } from "../hooks/font";

export default function Terms() {
  const fontsLoaded = useGlobalFonts();
  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>

      {/* Header */}
      <Text variant="headlineLarge" style={styles.header}>
        Terms & Conditions
      </Text>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing and using SV-PAMS, you agree to comply with all rules, 
          policies, and guidelines outlined in this document. Continued use of 
          the platform indicates acceptance of these terms.
        </Text>

        <Text style={styles.sectionTitle}>2. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          Users must provide accurate information, protect their login 
          credentials, and follow all applicable local regulations regarding 
          street vending operations.
        </Text>

        <Text style={styles.sectionTitle}>3. Data Privacy</Text>
        <Text style={styles.paragraph}>
          All data collected by the system is used solely for vendor management, 
          compliance monitoring, and improving government services. Personal 
          information is securely stored and handled in accordance with 
          applicable privacy laws.
        </Text>

        <Text style={styles.sectionTitle}>4. System Usage</Text>
        <Text style={styles.paragraph}>
          Unauthorized access, tampering, or misuse of system features is 
          strictly prohibited. Users who violate these rules may have their 
          accounts suspended or revoked.
        </Text>

        <Text style={styles.sectionTitle}>5. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          SV-PAMS reserves the right to update these terms at any time. Users 
          will be notified of changes through the app or official communication 
          channels.
        </Text>

      </ScrollView>

    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  header: {
    textAlign: "center",
    fontFamily: "Poppins-Bold",
    marginBottom: 20,
    color: "#0066CC",
  },

  scrollArea: {
    flex: 1,
    paddingBottom: 20,
  },

  sectionTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    marginBottom: 6,
    color: "#222",
  },

  paragraph: {
    fontFamily: "Poppins-Regular",
    fontSize: 14.5,
    lineHeight: 24,
    color: "#555",
    marginBottom: 18,
    textAlign: "justify",
  },
});
