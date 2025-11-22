// navigators/MainNavigator.jsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Public Screens
import SplashLoadingScreen from "../screens/SplashingLoadingScreen";
import AppIntroScreen from "../screens/AppIntroScreen";
import Welcome from "../screens/Welcome";
import AuthNavigator from "./AuthNavigator";
import DocSubmission from "../screens/DocSubmission";

// Authenticated App with Bottom Tabs
import AppTabs from "./AppTabs";

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Onboarding & Auth */}
      <Stack.Screen name="SplashLoading" component={SplashLoadingScreen} />
      <Stack.Screen name="AppIntro" component={AppIntroScreen} />
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Auth" component={AuthNavigator} />

      {/* Full App with Bottom Tabs */}
      <Stack.Screen name="MainApp" component={AppTabs} />

      {/* Full-screen modals on top of tabs */}
      <Stack.Screen name="DocSubmission" component={DocSubmission} />
      {/* Add more later: DigitalPermit, Payments, etc. */}
    </Stack.Navigator>
  );
};

export default MainNavigator;