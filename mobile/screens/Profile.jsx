import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FloatingNavBar from "../components/FloatingNavBar";

const Profile = ({ navigation }) => {
  const profileOptions = [
    {
      icon: "person-outline",
      title: "Personal Information",
      screen: "PersonalInfo",
    },
    {
      icon: "document-text-outline",
      title: "My Documents",
      screen: "DocSubmission",
    },
    {
      icon: "notifications-outline",
      title: "Notifications",
      screen: "Notifications",
    },
    { icon: "settings-outline", title: "Settings", screen: "Settings" },
    { icon: "help-circle-outline", title: "Help & Support", screen: "Support" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={50} color="#118df0" />
          </View>
          <Text style={styles.name}>Vendor Name</Text>
          <Text style={styles.email}>vendor@email.com</Text>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          {profileOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionCard}
              onPress={() =>
                option.screen && navigation.navigate(option.screen)
              }
              activeOpacity={0.7}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name={option.icon} size={24} color="#118df0" />
              </View>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6683a4" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate("Introduction")}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={24} color="#ffffff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <FloatingNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e6eaf0",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120, // Space for floating navbar
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 24,
    shadowColor: "#002248",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e6eaf0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#118df0",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#002248",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#6683a4",
  },
  optionsContainer: {
    paddingHorizontal: 20,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#002248",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e6eaf0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#002248",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#118df0",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#118df0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderBottomWidth: 2,
    borderBottomColor: "#0c6db8",
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default Profile;
