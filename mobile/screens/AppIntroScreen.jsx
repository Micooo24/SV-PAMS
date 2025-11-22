// src/screens/LogoIntroScreen.jsx
import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, Animated } from "react-native";
import { Text } from "react-native-paper";

export default function AppIntroScreen({ navigation }) {
  const fadeLogo = useRef(new Animated.Value(0)).current;
  const fadeText = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Step 1: Fade in logo
    Animated.timing(fadeLogo, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();

    // Step 2: Fade in text after logo
    setTimeout(() => {
      Animated.timing(fadeText, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }, 500);

    // Step 3: Transition to Welcome
    const timer = setTimeout(() => {
      navigation.replace("Welcome");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/images/logo1.png")}
        style={[styles.logo, { opacity: fadeLogo }]}
        resizeMode="contain"
      />

      <Animated.View style={{ opacity: fadeText }}>
        <Text variant="headlineMedium" style={styles.appName}>
          SV: PAMS
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 280,
    height: 280,
  },
  appName: {
    marginTop: 20,
    fontWeight: "800",
    color: "#118df0", 
    fontSize: 38,
  },
});
