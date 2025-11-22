import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Load user data from AsyncStorage on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user_data");
      const accessToken = await AsyncStorage.getItem("access_token");

      if (userData && accessToken) {
        setUser(JSON.parse(userData));
        setToken(accessToken);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData, accessToken, tokenType, expiresIn) => {
    try {
      // Store user data in AsyncStorage
      await AsyncStorage.multiSet([
        ["access_token", accessToken],
        ["token_type", tokenType],
        ["expires_in", expiresIn.toString()],
        ["user_data", JSON.stringify(userData)],
        ["user_id", userData._id],
        ["user_email", userData.email],
        ["user_firstname", userData.firstname],
        ["user_lastname", userData.lastname],
        ["user_role", userData.role],
        ["user_mobile", userData.mobile_no || ""],
        ["user_address", userData.address || ""],
        ["user_barangay", userData.barangay || ""],
        ["user_img", userData.img || ""],
      ]);

      setUser(userData);
      setToken(accessToken);
      return true;
    } catch (error) {
      console.error("Error saving user data:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Clear all user-related data from AsyncStorage
      await AsyncStorage.multiRemove([
        "access_token",
        "token_type",
        "expires_in",
        "user_data",
        "user_id",
        "user_email",
        "user_firstname",
        "user_lastname",
        "user_role",
        "user_mobile",
        "user_address",
        "user_barangay",
        "user_img",
      ]);

      setUser(null);
      setToken(null);
      return true;
    } catch (error) {
      console.error("Error clearing user data:", error);
      return false;
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      await AsyncStorage.setItem("user_data", JSON.stringify(updatedUserData));
      setUser(updatedUserData);
      return true;
    } catch (error) {
      console.error("Error updating user data:", error);
      return false;
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
