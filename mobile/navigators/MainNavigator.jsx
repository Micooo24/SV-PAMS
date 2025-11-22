import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../screens/Home";
import Welcome from "../screens/Welcome";
import DocSubmission from "../screens/DocSubmission";
import AuthNavigator from "./AuthNavigator";
import VendorCarts from "../screens/Cart_DetectionScreen";
import Introduction from "../screens/Introduction";
import Profile from "../screens/Profile";
import PersonalInfo from "../screens/PersonalInfo";
import Notifications from "../screens/Notifications";
import Settings from "../screens/Settings";
import Support from "../screens/Support";

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      {/* Auth Flow: Welcome -> Login -> Introduction -> Home */}
      <Stack.Screen
        name="Welcome"
        component={Welcome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Introduction"
        component={Introduction}
        options={{ headerShown: false }}
      />

      {/* Main App Screens - With NavBar */}
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VendorCarts"
        component={VendorCarts}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DocSubmission"
        component={DocSubmission}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PersonalInfo"
        component={PersonalInfo}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={Notifications}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Support"
        component={Support}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
