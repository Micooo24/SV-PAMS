import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BASE_URL from "../common/baseurl.js";

export const authService = {
  // Google Authentication using Expo AuthSession
  async googleAuth(idToken) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/users/auth/google`,
        { id_token: idToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data; // { message, email, requires_otp: true }
    } catch (error) {
      console.error(
        "Google auth error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Facebook Authentication using Expo AuthSession
  async facebookAuth(accessToken) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/users/auth/facebook`,
        { access_token: accessToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data; // { message, email, requires_otp: true }
    } catch (error) {
      console.error(
        "Facebook auth error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Verify OTP - Step 2: Complete login after OTP verification (works for both Google and Facebook)
  async verifyOTP(email, otpCode) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/users/auth/verify-otp`,
        {
          email: email,
          otp_code: otpCode,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Store user data after successful verification
      await this.storeUserData(response.data);
      return response.data; // { message, user, access_token, token_type, expires_in }
    } catch (error) {
      console.error(
        "OTP verification error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Resend OTP
  async resendOTP(email) {
    try {
      const formData = new FormData();
      formData.append("email", email);

      const response = await axios.post(
        `${BASE_URL}/api/users/auth/resend-otp`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Resend OTP error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Store user data in AsyncStorage
  async storeUserData(data) {
    try {
      await AsyncStorage.multiSet([
        ["access_token", data.access_token],
        ["token_type", data.token_type],
        ["expires_in", data.expires_in.toString()],
        ["user_data", JSON.stringify(data.user)],
        ["user_id", data.user._id],
        ["user_email", data.user.email],
        ["user_firstname", data.user.firstname],
        ["user_lastname", data.user.lastname],
        ["user_role", data.user.role],
        ["user_mobile", data.user.mobile_no?.toString() || ""],
        ["user_address", data.user.address || ""],
        ["user_barangay", data.user.barangay || ""],
        ["user_img", data.user.img || ""],
      ]);
      console.log("User data stored successfully");
    } catch (error) {
      console.error("Error storing user data:", error);
      throw error;
    }
  },
};
