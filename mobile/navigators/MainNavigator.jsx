// navigators/MainNavigator.jsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Public Screens
import SplashLoadingScreen from "../screens/SplashingLoadingScreen";
import AppIntroScreen from "../screens/AppIntroScreen";
import Welcome from "../screens/Welcome";
import AuthNavigator from "./AuthNavigator";
import DocSubmission from "../screens/DocSubmission";

import PersonalInfo from "../screens/PersonalInfo";
import UpdateProfile from "../screens/UpdateProfile";
import BusinessInfo from "../screens/BusinessInfo";
import Faqs from "../screens/Faqs";
import About from "../screens/About";
import Terms from "../screens/Terms";

// Authenticated App with Bottom Tabs
import AppTabs from "./AppTabs";

import CustomerMapScreen from "../screens/CustomerMapScreen";
import VendorLocationScreen from "../screens/VendorLocationScreen";

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
      <Stack.Screen name="Home" component={AppTabs} />

      {/* Full-screen modals on top of tabs */}
      <Stack.Screen name="DocSubmission" component={DocSubmission} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
      <Stack.Screen name="BusinessInfo" component={BusinessInfo} />
      <Stack.Screen name="Faqs" component={Faqs} />
      <Stack.Screen name="About" component={About} />
      <Stack.Screen name="Terms" component={Terms} />
      {/* Add more later: DigitalPermit, Payments, etc. */}

      <Stack.Screen name="CustomerMap" component={CustomerMapScreen} />
      <Stack.Screen name="VendorLocation" component={VendorLocationScreen} /> 
    </Stack.Navigator>
  );
};

export default MainNavigator;