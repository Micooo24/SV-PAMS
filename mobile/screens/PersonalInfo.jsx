import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FloatingNavBar from "../components/FloatingNavBar";

const PersonalInfo = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "Juan",
    lastName: "Dela Cruz",
    middleName: "Santos",
    birthday: "01/15/1990",
    age: "34",
    gender: "Male",
    mobile: "+63 912 345 6789",
    email: "vendor@email.com",
    address: "123 Market Street, Barangay Centro",
    barangay: "Centro",
    zipCode: "1000",
  });

  const handleSave = () => {
    Alert.alert("Success", "Personal information updated successfully!");
    setIsEditing(false);
  };

  const InfoSection = ({ icon, title, children }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={24} color="#2563eb" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const InfoField = ({ label, value, field, icon }) => (
    <View style={styles.infoField}>
      <View style={styles.fieldLabel}>
        <Ionicons name={icon} size={18} color="#64748b" />
        <Text style={styles.labelText}>{label}</Text>
      </View>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, [field]: text }))
          }
          placeholder={label}
        />
      ) : (
        <Text style={styles.valueText}>{value}</Text>
      )}
    </View>
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
        <Text style={styles.headerTitle}>Personal Information</Text>
        <TouchableOpacity
          onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
          style={styles.editButton}
        >
          <Ionicons
            name={isEditing ? "checkmark" : "create-outline"}
            size={24}
            color="#2563eb"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={60} color="#2563eb" />
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>
            {formData.firstName} {formData.lastName}
          </Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#10b981" />
            <Text style={styles.verifiedText}>Verified Vendor</Text>
          </View>
        </View>

        {/* Basic Information */}
        <InfoSection icon="person-circle" title="Basic Information">
          <InfoField
            label="First Name"
            value={formData.firstName}
            field="firstName"
            icon="text-outline"
          />
          <InfoField
            label="Middle Name"
            value={formData.middleName}
            field="middleName"
            icon="text-outline"
          />
          <InfoField
            label="Last Name"
            value={formData.lastName}
            field="lastName"
            icon="text-outline"
          />
          <InfoField
            label="Birthday"
            value={formData.birthday}
            field="birthday"
            icon="calendar-outline"
          />
          <InfoField
            label="Age"
            value={formData.age}
            field="age"
            icon="hourglass-outline"
          />
          <InfoField
            label="Gender"
            value={formData.gender}
            field="gender"
            icon="male-female-outline"
          />
        </InfoSection>

        {/* Contact Information */}
        <InfoSection icon="call" title="Contact Information">
          <InfoField
            label="Mobile Number"
            value={formData.mobile}
            field="mobile"
            icon="phone-portrait-outline"
          />
          <InfoField
            label="Email Address"
            value={formData.email}
            field="email"
            icon="mail-outline"
          />
        </InfoSection>

        {/* Address Information */}
        <InfoSection icon="location" title="Address Information">
          <InfoField
            label="Street Address"
            value={formData.address}
            field="address"
            icon="home-outline"
          />
          <InfoField
            label="Barangay"
            value={formData.barangay}
            field="barangay"
            icon="business-outline"
          />
          <InfoField
            label="Zip Code"
            value={formData.zipCode}
            field="zipCode"
            icon="mail-open-outline"
          />
        </InfoSection>

        {/* Account Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Account Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Ionicons name="document-text" size={24} color="#2563eb" />
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Documents</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="time" size={24} color="#8b5cf6" />
              <Text style={styles.statValue}>34</Text>
              <Text style={styles.statLabel}>Activities</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.statValue}>98%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
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
  editButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  profileSection: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 32,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#2563eb",
    position: "relative",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
  },
  section: {
    backgroundColor: "#fff",
    marginBottom: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  sectionContent: {
    paddingHorizontal: 20,
  },
  infoField: {
    marginBottom: 16,
  },
  fieldLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  labelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  valueText: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
  },
  input: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  statsSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
});

export default PersonalInfo;
