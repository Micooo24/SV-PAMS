// src/screens/SplashLoadingScreen.jsx
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

export default function SplashLoadingScreen({ navigation }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Infinite rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();

    // After 2 seconds → go to logo
    const timer = setTimeout(() => {
      navigation.replace("AppIntro");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Rotation interpolation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, { transform: [{ rotate: spin }] }]}>
        <View style={[styles.dot, { backgroundColor: "#118df0", top: -10 }]} />
        <View style={[styles.dot, { backgroundColor: "#119d57ff", right: -10 }]} />
        <View style={[styles.dot, { backgroundColor: "#189b7dff", bottom: -10 }]} />
        <View style={[styles.dot, { backgroundColor: "#118df0", left: -10 }]} />
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
  circle: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 6,
  },
});
