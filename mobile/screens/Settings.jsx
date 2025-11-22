import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FloatingNavBar from "../components/FloatingNavBar";

const Settings = ({ navigation }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotif: true,
    smsNotif: false,
    pushNotif: true,
    biometric: true,
    autoBackup: true,
    darkMode: false,
    locationTracking: true,
    dataSharing: false,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem = ({
    icon,
    title,
    subtitle,
    type = "toggle",
    value,
    onPress,
    color = "#2563eb",
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={type === "toggle" ? 1 : 0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === "toggle" ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: "#cbd5e1", true: "#93c5fd" }}
          thumbColor={value ? "#2563eb" : "#f1f5f9"}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Settings */}
        <SettingSection title="Account">
          <SettingItem
            icon="person-circle"
            title="Edit Profile"
            subtitle="Update your personal information"
            type="navigation"
            onPress={() => navigation.navigate("PersonalInfo")}
            color="#2563eb"
          />
          <SettingItem
            icon="key"
            title="Change Password"
            subtitle="Update your account password"
            type="navigation"
            color="#8b5cf6"
          />
          <SettingItem
            icon="shield-checkmark"
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            type="navigation"
            color="#10b981"
          />
        </SettingSection>

        {/* Notification Settings */}
        <SettingSection title="Notifications">
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Receive alerts on your device"
            type="toggle"
            value={settings.pushNotif}
            onPress={() => toggleSetting("pushNotif")}
            color="#f59e0b"
          />
          <SettingItem
            icon="mail"
            title="Email Notifications"
            subtitle="Get updates via email"
            type="toggle"
            value={settings.emailNotif}
            onPress={() => toggleSetting("emailNotif")}
            color="#3b82f6"
          />
          <SettingItem
            icon="chatbox"
            title="SMS Notifications"
            subtitle="Receive text message alerts"
            type="toggle"
            value={settings.smsNotif}
            onPress={() => toggleSetting("smsNotif")}
            color="#06b6d4"
          />
        </SettingSection>

        {/* Security Settings */}
        <SettingSection title="Security">
          <SettingItem
            icon="finger-print"
            title="Biometric Login"
            subtitle="Use fingerprint or face ID"
            type="toggle"
            value={settings.biometric}
            onPress={() => toggleSetting("biometric")}
            color="#10b981"
          />
          <SettingItem
            icon="location"
            title="Location Tracking"
            subtitle="Allow cart location detection"
            type="toggle"
            value={settings.locationTracking}
            onPress={() => toggleSetting("locationTracking")}
            color="#ef4444"
          />
          <SettingItem
            icon="lock-closed"
            title="Two-Factor Authentication"
            subtitle="Add extra security layer"
            type="navigation"
            color="#8b5cf6"
          />
        </SettingSection>

        {/* App Settings */}
        <SettingSection title="App Preferences">
          <SettingItem
            icon="moon"
            title="Dark Mode"
            subtitle="Switch to dark theme"
            type="toggle"
            value={settings.darkMode}
            onPress={() => toggleSetting("darkMode")}
            color="#64748b"
          />
          <SettingItem
            icon="cloud-upload"
            title="Auto Backup"
            subtitle="Automatically backup your data"
            type="toggle"
            value={settings.autoBackup}
            onPress={() => toggleSetting("autoBackup")}
            color="#2563eb"
          />
          <SettingItem
            icon="language"
            title="Language"
            subtitle="English (US)"
            type="navigation"
            color="#f59e0b"
          />
        </SettingSection>

        {/* Data & Privacy */}
        <SettingSection title="Data & Privacy">
          <SettingItem
            icon="analytics"
            title="Data Sharing"
            subtitle="Share usage data for improvement"
            type="toggle"
            value={settings.dataSharing}
            onPress={() => toggleSetting("dataSharing")}
            color="#06b6d4"
          />
          <SettingItem
            icon="download"
            title="Download My Data"
            subtitle="Export your account data"
            type="navigation"
            color="#3b82f6"
          />
          <SettingItem
            icon="trash"
            title="Clear Cache"
            subtitle="Free up storage space"
            type="navigation"
            color="#ef4444"
          />
        </SettingSection>

        {/* About */}
        <SettingSection title="About">
          <SettingItem
            icon="information-circle"
            title="App Version"
            subtitle="Version 1.0.0 (Build 2025)"
            type="navigation"
            color="#64748b"
          />
          <SettingItem
            icon="document-text"
            title="Terms & Conditions"
            subtitle="Read our terms of service"
            type="navigation"
            color="#8b5cf6"
          />
          <SettingItem
            icon="shield"
            title="Privacy Policy"
            subtitle="How we protect your data"
            type="navigation"
            color="#10b981"
          />
        </SettingSection>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.dangerButton}>
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text style={styles.dangerButtonText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dangerButton, styles.deleteButton]}>
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={[styles.dangerButtonText, { color: "#fff" }]}>
              Delete Account
            </Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: "#64748b",
  },
  dangerSection: {
    marginTop: 16,
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  dangerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ef4444",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ef4444",
    marginBottom: 12,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  },
});

export default Settings;
