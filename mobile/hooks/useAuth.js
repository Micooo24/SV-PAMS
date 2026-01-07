import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  auth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential,
} from "../secrets_mobile/firebase_config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import authService from "../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Step 1: Firebase Authentication...");
      // Firebase Auth
      const firebaseCredential = await signInWithEmailAndPassword(
        auth,
        email.toLowerCase().trim(),
        password
      );

      console.log("Step 2: Backend Authentication via service...");
      // Backend Auth via service
      const formData = new FormData();
      formData.append("email", email.toLowerCase().trim());
      formData.append("password", password);

      const response = await authService.login(formData);

      console.log("Step 3: Storing Firebase UID...");
      // Store Firebase UID
      await AsyncStorage.setItem("firebase_uid", firebaseCredential.user.uid);

      // Update state
      setUser(response.data.user);
      setIsAuthenticated(true);

      console.log("Login successful via useAuth hook");
      return { success: true, user: response.data.user };
    } catch (err) {
      console.error("Login error in useAuth:", err);

      let errorMessage = "Login failed. Please try again.";

      // Handle Firebase Auth errors
      if (err.code) {
        switch (err.code) {
          case "auth/user-not-found":
            errorMessage = "No account found with this email";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect password";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address";
            break;
          case "auth/user-disabled":
            errorMessage = "This account has been disabled";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many failed attempts. Please try again later";
            break;
          case "auth/invalid-credential":
            errorMessage = "Invalid email or password";
            break;
          default:
            errorMessage = err.message || "Authentication failed";
        }
      }
      // Handle Backend errors
      else if (err.response?.status === 400) {
        errorMessage = err.response.data?.detail || "Invalid email or password";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.message === "Network Error") {
        errorMessage = "Network error. Please check your connection.";
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken) => {
    try {
      setLoading(true);
      setError(null);

      if (!idToken) {
        throw new Error("No ID Token provided for Google login");
      }

      console.log("Step 1: Firebase Auth with Google...");
      // Firebase Auth with Google
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const firebaseUserCredential = await signInWithCredential(
        auth,
        googleCredential
      );

      // Get user info from Firebase
      const firebaseUser = firebaseUserCredential.user;
      const userInfo = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || "",
        givenName: firebaseUser.displayName?.split(" ")[0] || "",
        familyName:
          firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
        photo: firebaseUser.photoURL || "",
      };

      console.log("Step 2: Backend auth via service...");
      // Backend auth via service
      const formData = new FormData();
      formData.append("email", userInfo.email);
      formData.append("name", userInfo.name || "");
      formData.append("givenName", userInfo.givenName || "");
      formData.append("familyName", userInfo.familyName || "");
      formData.append("photo", userInfo.photo || "");
      formData.append("provider", "google");

      const backendResponse = await authService.googleLogin(
        formData,
        firebaseUserCredential,
        userInfo
      );

      // Update state
      setUser(backendResponse.data.user);
      setIsAuthenticated(true);

      console.log("Google login successful via useAuth hook");
      return { success: true, user: backendResponse.data.user };
    } catch (err) {
      console.error("Google login error in useAuth:", err);

      let errorMessage = "Google login failed";

      if (err.message?.includes("cancelled")) {
        errorMessage = "Login cancelled by user";
      } else if (err.response?.data) {
        errorMessage =
          err.response.data.detail ||
          err.response.data.message ||
          "Backend authentication failed";
      } else {
        errorMessage = err.message || "An error occurred";
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const facebookLogin = async (accessToken) => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error("No access token provided for Facebook login");
      }

      console.log("Step 1: Firebase Auth with Facebook...");
      // Firebase Auth with Facebook
      const facebookCredential = FacebookAuthProvider.credential(accessToken);
      const firebaseUserCredential = await signInWithCredential(
        auth,
        facebookCredential
      );

      // Get user info from Firebase
      const firebaseUser = firebaseUserCredential.user;
      const userInfo = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || "",
        firstName: firebaseUser.displayName?.split(" ")[0] || "",
        lastName: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
        photo: firebaseUser.photoURL || "",
        facebookId: firebaseUser.providerData[0]?.uid || "",
      };

      console.log("Step 2: Backend auth via service...");
      // Backend auth via service
      const formData = new FormData();
      formData.append("email", userInfo.email);
      formData.append("name", userInfo.name || "");
      formData.append("firstName", userInfo.firstName || "");
      formData.append("lastName", userInfo.lastName || "");
      formData.append("photo", userInfo.photo || "");
      formData.append("facebookId", userInfo.facebookId || "");
      formData.append("provider", "facebook");

      const backendResponse = await authService.facebookLogin(
        formData,
        firebaseUserCredential,
        userInfo
      );

      // Update state
      setUser(backendResponse.data.user);
      setIsAuthenticated(true);

      console.log("Facebook login successful via useAuth hook");
      return { success: true, user: backendResponse.data.user };
    } catch (err) {
      console.error("Facebook login error in useAuth:", err);

      let errorMessage = "Facebook login failed";

      if (err.message?.includes("cancelled")) {
        errorMessage = "Login cancelled by user";
      } else if (err.code === "auth/account-exists-with-different-credential") {
        errorMessage =
          "An account already exists with this email using a different sign-in method.";
      } else if (err.response?.data) {
        errorMessage =
          err.response.data.detail ||
          err.response.data.message ||
          "Backend authentication failed";
      } else {
        errorMessage = err.message || "An error occurred";
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Step 1: Create Firebase Auth User");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.toLowerCase().trim(),
        formData.password
      );

      console.log("Firebase user created with Auth");

      console.log("Step 2: Backend Registration via service");

      const formDataToSend = new FormData();

      const fieldsToSend = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        middlename: formData.middlename || "",
        address: formData.address,
        barangay: formData.barangay,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        birthday: formData.birthday,
        age: formData.age,
        mobile_no: formData.mobile_no,
        landline_no: formData.landline_no || "",
        zip_code: formData.zip_code,
        gender: formData.gender,
        role: "user",
        firebase_uid: userCredential.user.uid,
      };

      Object.entries(fieldsToSend).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      if (formData.img) {
        const uriParts = formData.img.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formDataToSend.append("img", {
          uri: formData.img,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }
      const response = await authService.register(
        formDataToSend,
        userCredential
      );

      console.log("Registration successful via useAuth hook");
      return { success: true, user: response.data.user || {} };
    } catch (err) {
      console.error("Registration error in useAuth:", err);

      let errorMessage = "Registration failed. Please try again.";

      // Handle Firebase Auth errors
      if (err.code) {
        switch (err.code) {
          case "auth/email-already-in-use":
            errorMessage =
              "This email is already registered. Please login instead.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address format.";
            break;
          case "auth/weak-password":
            errorMessage =
              "Password is too weak. Please use a stronger password.";
            break;
          case "auth/network-request-failed":
            errorMessage =
              "Network error. Please check your internet connection.";
            break;
          default:
            errorMessage = `Firebase error: ${err.message}`;
        }
      }

      // Handle backend errors
      else if (err.response?.data) {
        errorMessage =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Registration failed. Please try again.";
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      // Firebase sign out
      await signOut(auth);

      // Clear AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(
        (key) =>
          key.startsWith("user_") ||
          [
            "access_token",
            "token_type",
            "expires_in",
            "user_data",
            "firebase_uid",
          ].includes(key)
      );

      if (userKeys.length > 0) {
        await AsyncStorage.multiRemove(userKeys);
      }

      // Update state
      setUser(null);
      setIsAuthenticated(false);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    user,
    loading,
    isAuthenticated,
    error,

    // Actions
    login,
    googleLogin,
    facebookLogin,
    register,
    logout,
  };
}
