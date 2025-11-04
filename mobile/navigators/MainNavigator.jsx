import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../screens/Home";
import Welcome from "../screens/Welcome";
import DocSubmission from "../screens/DocSubmission";
import AuthNavigator from "./AuthNavigator";

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
      <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="DocSubmission" component={DocSubmission} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default MainNavigator;