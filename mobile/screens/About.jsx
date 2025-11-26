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
          innovative digital solution designed to modernize the management of 
          street vendors within local communities.
        </Text>

        <Text style={styles.paragraph}>
          The system simplifies the permit application process, enhances fairness 
          in vendor distribution, and introduces AI-driven compliance monitoring 
          that helps ensure safe and organized public spaces.
        </Text>

        <Text style={styles.paragraph}>
          Using a combination of web and mobile platforms, SV-PAMS allows 
          vendors, administrators, and field inspectors to seamlessly interact 
          through real-time data, secured transactions, and automated reporting.
        </Text>

        <Text style={styles.paragraph}>
          With technologies like FastAPI, React, React Native, and MongoDB, the 
          platform offers high performance, scalability, and a reliable workflow 
          built for modern urban governance.
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
