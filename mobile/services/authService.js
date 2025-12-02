import axios from "axios";
import BASE_URL from "../common/baseurl";
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const authService = {

  login: async (formData) => {
    const response = await axios.post(
      `${BASE_URL}/api/users/auth/login`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    
    // Store the token after successful login
    if (response.data.access_token) {
      await AsyncStorage.multiSet([
        ['access_token', response.data.access_token],
        ['token_type', response.data.token_type || 'Bearer'],
        ['expires_in', response.data.expires_in?.toString() || ''],
        ['user_data', JSON.stringify(response.data.user)],
        ['user_id', response.data.user._id],
        ['user_email', response.data.user.email],
        ['user_firstname', response.data.user.firstname],
        ['user_lastname', response.data.user.lastname],
        ['user_role', response.data.user.role],
        ['user_mobile', response.data.user.mobile_no?.toString() || ''],
        ['user_address', response.data.user.address || ''],
        ['user_barangay', response.data.user.barangay || ''],
        ['user_img', response.data.user.img || ''],
        ['user_is_active', JSON.stringify(response.data.user.is_active)],
      ]);
    }
    
    return response;
  },

  googleLogin: async (formData, firebaseUserCredential, userInfo) => {
    const response = await axios.post(
      `${BASE_URL}/api/users/auth/google-login`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    // Store the token after successful login
    if (response.data.access_token) {
      const serverUser = response.data.user;
      await AsyncStorage.multiSet([
        ['access_token', response.data.access_token],
        ['token_type', response.data.token_type || 'Bearer'],
        ['expires_in', response.data.expires_in?.toString() || ''],
        ['user_data', JSON.stringify(serverUser)],
        ['user_id', serverUser._id],
        ['user_email', serverUser.email],
        ['user_firstname', serverUser.firstname],
        ['user_lastname', serverUser.lastname],
        ['user_role', serverUser.role],
        ['user_mobile', serverUser.mobile_no?.toString() || ''],
        ['user_address', serverUser.address || ''],
        ['user_barangay', serverUser.barangay || ''],
        ['user_img', serverUser.img || userInfo?.photo || ''],
        ['user_is_active', JSON.stringify(serverUser.is_active)],
        ['firebase_uid', firebaseUserCredential.user.uid],
      ]);
    }
    
    return response;
  },

  // Helper functions
  getCurrentUser: async () => {
    try {
      const userStr = await AsyncStorage.getItem('user_data');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

};

export default authService;