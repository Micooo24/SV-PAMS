import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from 'react-native-paper';
import MainNavigator from "./navigators/MainNavigator";
import { StatusBar } from "expo-status-bar";
import messaging from '@react-native-firebase/messaging';
import { useEffect } from "react";
import { Alert } from "react-native";

export default function App() {

  //Handle foreground only notifications
    useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Background notification received');
      
      Alert.alert(
        remoteMessage.notification?.title || 'New Notification',
        remoteMessage.notification?.body || '',
        [
          { text: 'OK', onPress: () => console.log('Notification dismissed') }
        ]
      );
    });

    return unsubscribe;
  }, []);

  return (
  <PaperProvider>
      <NavigationContainer>
        <MainNavigator />
          <StatusBar style="auto" />
      </NavigationContainer>
  </PaperProvider>
  );
}