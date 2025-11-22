// navigators/AppTabs.jsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

import Home from "../screens/Home";
import CartDetectionScreen from "../screens/Cart_DetectionScreen";

const Notifications = () => null;
const Profile = () => null;

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          height: 80,
          paddingBottom: 12,
          paddingTop: 10,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={Home}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons name="home" size={28} color={focused ? "#2563eb" : "#64748b"} />
          ),
        }}
      />

      {/* BIG FLOATING REPORT BUTTON */}
      <Tab.Screen
        name="Report"
        component={CartDetectionScreen}
        options={{
          tabBarLabel: "",
          tabBarIcon: () => (
            <View style={styles.fab}>
              <MaterialCommunityIcons name="camera" size={36} color="#fff" />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons name="account-circle" size={28} color={focused ? "#2563eb" : "#64748b"} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    top: -25,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
});