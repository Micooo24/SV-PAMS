import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { CommonActions } from '@react-navigation/native'; // Critical import

export default function ProfileScreen({ navigation }) {

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
              // 1. Firebase sign out
              await signOut(auth);

              // 2. Clear AsyncStorage (all user data)
              const keys = await AsyncStorage.getAllKeys();
              const userKeys = keys.filter(key =>
                key.startsWith('user_') ||
                ['access_token', 'token_type', 'expires_in', 'user_data', 'firebase_uid'].includes(key)
              );
              if (userKeys.length > 0) {
                await AsyncStorage.multiRemove(userKeys);
              }

              // 3. Reset navigation stack completely to Welcome screen
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Welcome' }], // This is your welcome screen
                })
              );

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
          
          {/* LOGOUT - RED */}
          <Option 
            label="Logout" 
            icon="logout" 
            onPress={handleLogout}
            iconColor="#ef4444"
            textColor="#ef4444"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable Option with customizable colors
const Option = ({ label, icon, onPress, iconColor = "#2563eb", textColor = "#1e293b" }) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <View style={styles.iconWrapper}>
      <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
    </View>
    <Text style={[styles.optionText, { color: textColor }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { fontSize: 32, fontWeight: "700", marginTop: 20, marginHorizontal: 20, color: "#1e293b" },
  section: { marginTop: 20, marginHorizontal: 20, backgroundColor: "#fff", borderRadius: 16, paddingVertical: 10, elevation: 4 },
  option: { flexDirection: "row", alignItems: "center", paddingVertical: 18, paddingHorizontal: 16 },
  iconWrapper: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#dbeafe", justifyContent: "center", alignItems: "center", marginRight: 14 },
  optionText: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
});