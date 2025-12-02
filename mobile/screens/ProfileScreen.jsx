import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CommonActions } from '@react-navigation/native';
import useAuth from '../hooks/useAuth'; // Import the auth hook

export default function ProfileScreen({ navigation }) {
  const { logout, loading } = useAuth(); // Use the logout function from the hook

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Use the logout function from the hook
              const result = await logout();

              if (result.success) {
                // Reset navigation stack completely to Welcome screen
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Welcome' }],
                  })
                );
              } else {
                Alert.alert('Error', 'Failed to logout. Please try again.');
              }

            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={styles.header}>Profile</Text>

        <View style={styles.section}>
          <Option 
            label="Personal Information"
            icon="account"
            onPress={() => navigation.navigate("PersonalInfo")}
          />
          <Option 
            label="Business Information"
            icon="store"
            onPress={() => navigation.navigate("BusinessInfo")}
          />
        </View>

        <View style={styles.section}>
          <Option label="FAQs" icon="help-circle" onPress={() => navigation.navigate("Faqs")} />
          <Option label="About SV:PAMS" icon="information" onPress={() => navigation.navigate("About")} />
          <Option label="Terms and Conditions" icon="file-document" onPress={() => navigation.navigate("Terms")} />
          <Option label="TBF" icon="dots-horizontal" onPress={() => {}} />
          
          {/* LOGOUT - RED with loading state */}
          <Option 
            label={loading ? "Logging out..." : "Logout"} 
            icon="logout" 
            onPress={handleLogout}
            iconColor="#ef4444"
            textColor="#ef4444"
            disabled={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable Option with customizable colors and disabled state
const Option = ({ label, icon, onPress, iconColor = "#2563eb", textColor = "#1e293b", disabled = false }) => (
  <TouchableOpacity 
    style={[styles.option, disabled && styles.optionDisabled]} 
    onPress={disabled ? null : onPress}
    disabled={disabled}
  >
    <View style={styles.iconWrapper}>
      <MaterialCommunityIcons 
        name={icon} 
        size={24} 
        color={disabled ? "#94a3b8" : iconColor} 
      />
    </View>
    <Text style={[
      styles.optionText, 
      { color: disabled ? "#94a3b8" : textColor }
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { fontSize: 32, fontWeight: "700", marginTop: 20, marginHorizontal: 20, color: "#1e293b" },
  section: { marginTop: 20, marginHorizontal: 20, backgroundColor: "#fff", borderRadius: 16, paddingVertical: 10, elevation: 4 },
  option: { flexDirection: "row", alignItems: "center", paddingVertical: 18, paddingHorizontal: 16 },
  optionDisabled: { opacity: 0.6 },
  iconWrapper: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#dbeafe", justifyContent: "center", alignItems: "center", marginRight: 14 },
  optionText: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
});