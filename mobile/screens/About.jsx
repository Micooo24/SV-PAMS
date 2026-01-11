import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useGlobalFonts } from "../hooks/font";

export default function About() {
  const fontsLoaded = useGlobalFonts();
  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>

      {/* Header */}
      <Text variant="headlineLarge" style={styles.header}>
        About SV-PAMS
      </Text>

      {/* Content */}
      <ScrollView 
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.paragraph}>
          SV-PAMS (Street Vendor Permit and AI-powered Monitoring System) is an
          innovative digital solution designed to modernize the regulation,
          monitoring, and management of street vendors within local communities.
        </Text>

        <Text style={styles.paragraph}>
          The system streamlines the vendor permit application process, promotes
          fair vendor distribution, and supports local government units in
          maintaining organized and safe public spaces through technology-driven
          oversight.
        </Text>

        <Text style={styles.paragraph}>
          SV-PAMS integrates AI-powered monitoring to assess street vendor cart
          compliance based on approved size, structure, and placement guidelines.
          This enables authorities to identify violations efficiently while
          reducing the need for manual inspections.
        </Text>

        <Text style={styles.paragraph}>
          The platform also incorporates real-time location tracking to monitor
          vendor activity and ensure vendors operate only within authorized zones.
          This feature enhances transparency, improves urban planning, and helps
          prevent overcrowding in restricted areas.
        </Text>

        <Text style={styles.paragraph}>
          Through its web and mobile applications, SV-PAMS allows vendors,
          administrators, and field inspectors to access real-time data, receive
          automated notifications, submit reports, and manage compliance records
          securely and efficiently.
        </Text>

        <Text style={styles.paragraph}>
          Built using modern technologies such as FastAPI, React, React Native,
          and MongoDB, the system delivers a scalable, high-performance, and
          reliable platform that supports smart city initiatives and modern
          urban governance.
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
    color: "#0066CC",
    marginBottom: 20,
  },

  scrollArea: {
    flex: 1,
    paddingBottom: 20,
  },

  paragraph: {
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    lineHeight: 24,
    color: "#444",
    marginBottom: 18,
    textAlign: "justify",
  },
});
