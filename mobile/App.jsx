import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from 'react-native-paper';
import MainNavigator from "./navigators/MainNavigator";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
  <PaperProvider>
      <NavigationContainer>
        <MainNavigator />
          <StatusBar style="auto" />
      </NavigationContainer>
  </PaperProvider>
  );
}