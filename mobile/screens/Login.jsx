import React, { useEffect } from "react";
import { Alert } from "react-native";
import LoginComponent from "../components/Login";
import { useGlobalFonts } from "../hooks/font";
import useAuth from "../hooks/useAuth";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const Login = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const { login, googleLogin, facebookLogin, loading, error } = useAuth();

  // Configure Google Auth Request using expo-auth-session
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "657897595229-tf6au9pbiob6k48tulhv54mft4on8n4g.apps.googleusercontent.com",
    webClientId:
      "657897595229-tf6au9pbiob6k48tulhv54mft4on8n4g.apps.googleusercontent.com",
  });

  // Configure Facebook Auth Request using expo-auth-session
  const [facebookRequest, facebookResponse, facebookPromptAsync] =
    Facebook.useAuthRequest({
      clientId: "1153890940205781", // Replace with your Facebook App ID
    });

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleLoginWithToken(id_token);
    } else if (response?.type === "error") {
      Alert.alert("Login Failed", "Google sign-in failed. Please try again.");
    }
  }, [response]);

  // Handle Facebook Sign-In response
  useEffect(() => {
    if (facebookResponse?.type === "success") {
      const { access_token } = facebookResponse.params;
      handleFacebookLoginWithToken(access_token);
    } else if (facebookResponse?.type === "error") {
      Alert.alert("Login Failed", "Facebook sign-in failed. Please try again.");
    }
  }, [facebookResponse]);

  if (!fontsLoaded) {
    return null;
  }

  // HANDLE LOGIN LOGIC
  const handleLogin = async (email, password) => {
    console.log("Starting login process...", { email });

    if (!email || !password) {
      Alert.alert("Validation Error", "Please enter both email and password");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return;
    }

    const result = await login(email, password);
    console.log("Login result:", result);

    if (result.success) {
      const userData = result.user;
      console.log("Login successful, user role:", userData.role);

      // Navigate immediately without alert for better UX
      if (userData.role === "user" || userData.role === "customer") {
        navigation.navigate("MainApp");
      } else if (userData.role === "vendor") {
        navigation.navigate("Home");
      } else if (userData.role === "admin") {
        navigation.navigate("AdminDashboard");
      } else {
        navigation.navigate("Home");
      }

      // Show success message after navigation
      setTimeout(() => {
        Alert.alert("Login Successful", `Welcome back, ${userData.firstname}!`);
      }, 500);
    } else {
      console.error("Login failed:", result.error);
      Alert.alert("Login Failed", result.error);
    }
  };

  // HANDLE GOOGLE LOGIN LOGIC (called after Google auth response)
  const handleGoogleLoginWithToken = async (idToken) => {
    console.log("Processing Google login with token...");

    const result = await googleLogin(idToken);
    console.log("Google login result:", result);

    if (result.success) {
      const userData = result.user;
      console.log("Google login successful, user role:", userData.role);

      // Navigate immediately without alert for better UX
      if (userData.role === "user" || userData.role === "customer") {
        navigation.navigate("MainApp");
      } else if (userData.role === "vendor") {
        navigation.navigate("Home");
      } else if (userData.role === "admin") {
        navigation.navigate("AdminDashboard");
      } else {
        navigation.navigate("Home");
      }

      // Show success message after navigation
      setTimeout(() => {
        Alert.alert("Login Successful", `Welcome, ${userData.firstname}!`);
      }, 500);
    } else {
      console.error("Google login failed:", result.error);
      Alert.alert("Login Failed", result.error);
    }
  };

  // HANDLE GOOGLE LOGIN BUTTON PRESS
  const handleGoogleLogin = async () => {
    console.log("Starting Google login...");
    await promptAsync();
  };

  // HANDLE FACEBOOK LOGIN LOGIC (called after Facebook auth response)
  const handleFacebookLoginWithToken = async (accessToken) => {
    console.log("Processing Facebook login with token...");

    const result = await facebookLogin(accessToken);
    console.log("Facebook login result:", result);

    if (result.success) {
      const userData = result.user;
      console.log("Facebook login successful, user role:", userData.role);

      // Navigate immediately without alert for better UX
      if (userData.role === "user" || userData.role === "customer") {
        navigation.navigate("MainApp");
      } else if (userData.role === "vendor") {
        navigation.navigate("Home");
      } else if (userData.role === "admin") {
        navigation.navigate("AdminDashboard");
      } else {
        navigation.navigate("Home");
      }

      // Show success message after navigation
      setTimeout(() => {
        Alert.alert("Login Successful", `Welcome, ${userData.firstname}!`);
      }, 500);
    } else {
      console.error("Facebook login failed:", result.error);
      Alert.alert("Login Failed", result.error);
    }
  };

  // HANDLE FACEBOOK LOGIN BUTTON PRESS
  const handleFacebookLogin = async () => {
    console.log("Starting Facebook login...");
    await facebookPromptAsync();
  };

  // NAVIGATION HANDLERS
  const handleNavigateToRegister = () => {
    navigation.navigate("Register");
  };

  const handleNavigateToForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  return (
    <LoginComponent
      onLogin={handleLogin}
      onGoogleLogin={handleGoogleLogin}
      onFacebookLogin={handleFacebookLogin}
      onNavigateToRegister={handleNavigateToRegister}
      onNavigateToForgotPassword={handleNavigateToForgotPassword}
      loading={loading}
      error={error}
    />
  );
};

export default Login;
