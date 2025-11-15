import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { useGlobalFonts } from "../hooks/font";
import { authService } from "../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OTPVerification = ({ route, navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const { email, provider } = route.params; // provider can be 'google' or 'facebook'
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      console.log("Verifying OTP for:", email);
      const response = await authService.verifyOTP(email, otp);

      console.log("OTP verified successfully:", response);

      Alert.alert("Success", `Welcome back, ${response.user.firstname}!`, [
        {
          text: "OK",
          onPress: () => {
            // Navigate based on user role
            if (response.user.role === "customer") {
              navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
              });
            } else if (response.user.role === "vendor") {
              navigation.reset({
                index: 0,
                routes: [{ name: "VendorDashboard" }],
              });
            } else if (response.user.role === "admin") {
              navigation.reset({
                index: 0,
                routes: [{ name: "AdminDashboard" }],
              });
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
              });
            }
          },
        },
      ]);
    } catch (error) {
      console.error("OTP verification error:", error);
      const errorMessage =
        error.response?.data?.detail ||
        "OTP verification failed. Please try again.";
      Alert.alert("Verification Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) {
      Alert.alert("Please Wait", "You can resend OTP after the timer expires");
      return;
    }

    setResendLoading(true);
    try {
      await authService.resendOTP(email);
      setTimer(300); // Reset timer to 5 minutes
      setOtp(""); // Clear OTP input
      Alert.alert("Success", "A new OTP has been sent to your email");
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || "Failed to resend OTP";
      Alert.alert("Error", errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const getProviderName = () => {
    return provider === "google" ? "Google" : "Facebook";
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Verify Your Email
        </Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{"\n"}
          <Text style={styles.email}>{email}</Text>
        </Text>
        <Text style={styles.provider}>Signed in with {getProviderName()}</Text>

        <TextInput
          label="Enter OTP"
          value={otp}
          onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
          mode="outlined"
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
          disabled={loading}
          autoFocus
        />

        <Text style={[styles.timer, timer === 0 && styles.timerExpired]}>
          {timer > 0 ? `Time remaining: ${formatTime(timer)}` : "OTP expired"}
        </Text>

        <Button
          mode="contained"
          style={styles.verifyButton}
          labelStyle={styles.buttonText}
          onPress={handleVerifyOTP}
          loading={loading}
          disabled={loading || otp.length !== 6}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

        <Button
          mode="outlined"
          style={styles.resendButton}
          labelStyle={styles.resendButtonText}
          onPress={handleResendOTP}
          loading={resendLoading}
          disabled={resendLoading || timer > 0}
        >
          {timer > 0 ? `Resend in ${formatTime(timer)}` : "Resend OTP"}
        </Button>

        <Button
          mode="text"
          style={styles.backButton}
          labelStyle={styles.backButtonText}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          Back to Login
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    width: "100%",
  },
  title: {
    fontFamily: "Poppins-Bold",
    color: "#2563eb",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  email: {
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },
  provider: {
    fontFamily: "Poppins-Regular",
    color: "#2563eb",
    textAlign: "center",
    marginBottom: 32,
    fontSize: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 24,
    letterSpacing: 8,
    textAlign: "center",
  },
  timer: {
    fontFamily: "Poppins-Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    fontSize: 14,
  },
  timerExpired: {
    color: "#dc2626",
    fontFamily: "Poppins-SemiBold",
  },
  verifyButton: {
    backgroundColor: "#2563eb",
    marginBottom: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  resendButton: {
    marginBottom: 8,
    borderColor: "#2563eb",
    borderRadius: 8,
  },
  resendButtonText: {
    fontFamily: "Poppins-Regular",
    color: "#2563eb",
  },
  backButton: {
    marginTop: 16,
  },
  backButtonText: {
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
});

export default OTPVerification;
