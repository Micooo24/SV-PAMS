import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainNavigator from "./navigators/MainNavigator";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MainNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
