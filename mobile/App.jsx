import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from 'react-native-paper';
import MainNavigator from "./navigators/MainNavigator";
import { StatusBar } from "expo-status-bar";
import messaging from '@react-native-firebase/messaging';
import { Alert } from "react-native";

export default function App() {

  useEffect(() => {
    // ✅ 1. Request permission
    requestUserPermission();

    // ✅ 2. Get FCM token (just log it for now)
    getFCMToken();

    // ✅ 3. Handle foreground notifications (when app is open)
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📱 Foreground notification:', remoteMessage);
      
      Alert.alert(
        remoteMessage.notification?.title || 'Notification',
        remoteMessage.notification?.body || '',
        [{ text: 'OK' }]
      );
    });

    // ✅ 4. Handle notification tap (when app is in background)
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('🔔 App opened from notification:', remoteMessage);
    });

    // ✅ 5. Check if app was opened by notification (when app was closed)
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('🚀 App opened from closed state:', remoteMessage);
        }
      });

    return unsubscribe;
  }, []);

  // Request notification permission
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Permission granted');
    } else {
      console.log('Permission denied');
    }
  };

  // Get FCM token
  const getFCMToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <PaperProvider>
      <NavigationContainer>
        <MainNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </PaperProvider>
  );
}