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

  register: async (formData) => {
    const response = await axios.post(`${BASE_URL}/api/users/auth/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success && response.data.user) {
      console.log('Registration successful:', response.data.user);
    }
    
    return response;
  },

  verify_otp: async (email, otp_code) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('otp_code', otp_code);

    const response = await axios.post(`${BASE_URL}/api/users/auth/verify-otp`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.access_token){
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
    console.log('OTP Verification', response.data);
    return response;
  },

  resend_otp: async (email) => {
    const formData = new FormData();
    formData.append('email', email);

    const response = await axios.post(`${BASE_URL}/api/users/auth/resend-otp`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Resend OTP response', response.data.email);
    return response;
  },
  
  facebookLogin: async (formData, firebaseUserCredential, userInfo) => {
    const response = await axios.post(
      `${BASE_URL}/api/users/auth/facebook-login`, 
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
        ['facebook_id', serverUser.facebook_id || ''],
      ]);
    }
    
    return response;
  },

  // Get authenticated user profile
  getAuthUserProfile: async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.get(
        `${BASE_URL}/api/users/auth/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      // Update AsyncStorage with fresh user data
      if (response.data.user) {
        const user = response.data.user;
        await AsyncStorage.multiSet([
          ['user_data', JSON.stringify(user)],
          ['user_id', user._id || user.id],
          ['user_email', user.email],
          ['user_firstname', user.firstname],
          ['user_lastname', user.lastname],
          ['user_role', user.role],
          ['user_mobile', user.mobile_no?.toString() || ''],
          ['user_address', user.address || ''],
          ['user_barangay', user.barangay || ''],
          ['user_img', user.img || ''],
          ['user_is_active', JSON.stringify(user.is_active)],
        ]);
      }

      console.log('Auth user profile fetched:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching auth user profile:', error);
      throw error;
    }
  },

  // Update authenticated user profile
  updateAuthUserProfile: async (updateData) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No access token found');
      }

      // Create FormData for file upload support
      const formData = new FormData();
      
      // Add only provided fields
      if (updateData.firstname) formData.append('firstname', updateData.firstname);
      if (updateData.lastname) formData.append('lastname', updateData.lastname);
      if (updateData.mobile_no) formData.append('mobile_no', updateData.mobile_no.toString());
      if (updateData.address) formData.append('address', updateData.address);
      if (updateData.barangay) formData.append('barangay', updateData.barangay);
      
      // Handle image upload
      if (updateData.img) {
        formData.append('img', {
          uri: updateData.img.uri,
          type: updateData.img.type || 'image/jpeg',
          name: updateData.img.fileName || 'profile.jpg',
        });
      }

      const response = await axios.put(
        `${BASE_URL}/api/users/auth/me/update`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update AsyncStorage with updated user data
      if (response.data.user) {
        const user = response.data.user;
        await AsyncStorage.multiSet([
          ['user_data', JSON.stringify(user)],
          ['user_firstname', user.firstname],
          ['user_lastname', user.lastname],
          ['user_mobile', user.mobile_no?.toString() || ''],
          ['user_address', user.address || ''],
          ['user_barangay', user.barangay || ''],
          ['user_img', user.img || ''],
        ]);
      }

      console.log('Profile updated successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
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
  },

  // Logout helper
  logout: async () => {
    try {
      await AsyncStorage.multiRemove([
        'access_token',
        'token_type',
        'expires_in',
        'user_data',
        'user_id',
        'user_email',
        'user_firstname',
        'user_lastname',
        'user_role',
        'user_mobile',
        'user_address',
        'user_barangay',
        'user_img',
        'user_is_active',
        'firebase_uid',
        'facebook_id',
      ]);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }
};

export default authService;