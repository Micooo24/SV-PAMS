import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, GoogleAuthProvider,  FacebookAuthProvider, signInWithCredential } from '../secrets_mobile/firebase_config';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import authService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  const getFCMToken = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        return token;
      }
      
      console.log('User notification permission denied');
      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const fcmToken = await getFCMToken();
      console.log('FCM Token retrieved:', fcmToken);

      console.log('Step 1: Firebase Authentication...');
      const firebaseCredential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      
      console.log('Step 2: Backend Authentication via service...');
      const formData = new FormData();
      formData.append('email', email.toLowerCase().trim());
      formData.append('password', password);
      if (fcmToken) {
        formData.append('fcm_token', fcmToken);
      }
      
      const response = await authService.login(formData);
      
      console.log('Step 3: Storing Firebase UID...');
      await AsyncStorage.setItem('firebase_uid', firebaseCredential.user.uid);
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      console.log('Login successful via useAuth hook');
      return { success: true, user: response.data.user };
      
    } catch (err) {
      console.error('Login error in useAuth:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.code) {
        switch (err.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password';
            break;
          default:
            errorMessage = err.message || 'Authentication failed';
        }
      } else if (err.response?.status === 403){
        errorMessage = 'Account not verified. Please verify your account.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.detail || 'Invalid email or password';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const fcmToken = await getFCMToken();
      console.log('FCM Token retrieved:', fcmToken);

      console.log('Step 1: Google Sign-In...');
      await GoogleSignin.hasPlayServices();

      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.log('Sign out check (safe to ignore):', error);
      }

      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken || response.idToken;
      const userInfo = response.data?.user || response.user;

      if (!idToken) {
        throw new Error('No ID Token found in Google response');
      }

      console.log('Step 2: Firebase Auth with Google...');
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const firebaseUserCredential = await signInWithCredential(auth, googleCredential);

      console.log('Step 3: Backend auth via service...');
      const formData = new FormData();
      formData.append('email', userInfo.email);
      formData.append('name', userInfo.name || '');
      formData.append('givenName', userInfo.givenName || '');
      formData.append('familyName', userInfo.familyName || '');
      formData.append('photo', userInfo.photo || '');
      formData.append('provider', 'google');
      if (fcmToken) {
        formData.append('fcm_token', fcmToken);
      }

      const backendResponse = await authService.googleLogin(formData, firebaseUserCredential, userInfo);
      
      setUser(backendResponse.data.user);
      setIsAuthenticated(true);
      
      console.log('Google login successful via useAuth hook');
      return { success: true, user: backendResponse.data.user };
      
    } catch (err) {
      console.error('Google login error in useAuth:', err);
      
      let errorMessage = 'Google login failed';
      
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Login cancelled by user';
      } else if (err.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Login already in progress';
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play Services not available';
      } else if (err.response?.data) {
        errorMessage = err.response.data.detail || err.response.data.message || 'Backend authentication failed';
      } else {
        errorMessage = err.message || 'An error occurred';
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

      const fcmToken = await getFCMToken();
      console.log('FCM Token retrieved:', fcmToken);

      console.log('Step 1: Firebase Auth with Facebook...');
      const facebookCredential = FacebookAuthProvider.credential(accessToken);
      const firebaseUserCredential = await signInWithCredential(auth, facebookCredential);

      const firebaseUser = firebaseUserCredential.user;
      
      const facebookId = firebaseUser.providerData.find(
        provider => provider.providerId === 'facebook.com'
      )?.uid;

      console.log('Step 2: Fetching high-quality Facebook photo...');
      let highQualityPhoto = firebaseUser.photoURL || "";
      
      if (facebookId && accessToken) {
        try {
          const graphResponse = await fetch(
            `https://graph.facebook.com/${facebookId}/picture?type=large&width=500&height=500&redirect=false&access_token=${accessToken}`
          );
          const photoData = await graphResponse.json();
          
          if (photoData.data && !photoData.data.is_silhouette) {
            highQualityPhoto = photoData.data.url;
            console.log('✅ High-quality photo URL:', highQualityPhoto);
          }
        } catch (err) {
          console.warn('Failed to fetch high-quality photo, using default:', err);
        }
      }

      const userEmail = firebaseUser.email || `${firebaseUser.uid}@facebook.user`;
      
      const userInfo = {
        email: userEmail,
        name: firebaseUser.displayName || "",
        firstName: firebaseUser.displayName?.split(" ")[0] || "",
        lastName: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
        photo: highQualityPhoto,
        facebookId: facebookId,
      };

      console.log('Step 3: Backend auth via service...');
      
      const formData = new FormData();
      formData.append("email", userInfo.email);
      formData.append("name", userInfo.name);
      formData.append("firstName", userInfo.firstName);
      formData.append("lastName", userInfo.lastName);
      formData.append("photo", userInfo.photo);
      formData.append("facebookId", userInfo.facebookId);
      formData.append("provider", "facebook");
      formData.append("access_token", accessToken);
      if (fcmToken) {
        formData.append('fcm_token', fcmToken);
      }

      const backendResponse = await authService.facebookLogin(
        formData,
        firebaseUserCredential,
        userInfo
      );

      setUser(backendResponse.data.user);
      setIsAuthenticated(true);

      console.log('Facebook login successful via useAuth hook');
      return { success: true, user: backendResponse.data.user };
    } catch (err) {
      console.error("Facebook login error in useAuth:", err);

      let errorMessage = "Facebook login failed";

      if (err.message?.includes("cancelled")) {
        errorMessage = "Login cancelled by user";
      } else if (err.code === "auth/account-exists-with-different-credential") {
        errorMessage = "An account already exists with this email using a different sign-in method.";
      } else if (err.response?.data) {
        errorMessage = err.response.data.detail || err.response.data.message || "Backend authentication failed";
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

      const formDataToSend = new FormData();

      const fieldsToSend = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        middlename: formData.middlename || '',
        address: formData.address,
        barangay: formData.barangay,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        birthday: formData.birthday,
        age: formData.age,
        mobile_no: formData.mobile_no,
        landline_no: formData.landline_no || '',
        zip_code: formData.zip_code,
        gender: formData.gender,
        role: 'user',
      };

      Object.entries(fieldsToSend).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      if (formData.img) {
        const uriParts = formData.img.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formDataToSend.append('img', {
          uri: formData.img,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const response = await authService.register(formDataToSend);

      return { 
        success: true, 
        email: response.data.email,
        message: response.data.message 
      };
      
    } catch (err) {
      console.error('Registration error:', err);

      let errorMessage = 'Registration failed. Please try again.';

      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Please login instead.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address format.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please use a stronger password.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          default:
            errorMessage = `Firebase error: ${err.message}`;
        }
      } else if (err.response?.data) {
        errorMessage = err.response?.data?.detail || 
                      err.response?.data?.message || 
                      'Registration failed. Please try again.';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verify_otp = async (email, otp_code, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Step 1: Verifying OTP...")

      const response = await authService.verify_otp(email, otp_code);
      
      console.log("Step 2: Create Firebase Auth User")

      const firebaseUserCredential = await createUserWithEmailAndPassword(
        auth,
        email.toLowerCase().trim(),
        password
      );

      await AsyncStorage.setItem('firebase_uid', firebaseUserCredential.user.uid);
      
      setUser(response.data.user);
      setIsAuthenticated(true);

      console.log('OTP verified successfully - User Logged In');
      return { 
        success: true, 
        user: response.data.user,
        message: response.data.message 
      };
      
    } catch (err) {
      console.error('OTP Verification error in useAuth:', err);
      let errorMessage = 'OTP Verification failed.';

      if (err.response?.status === 400) {
        errorMessage = err.response.data?.detail || 'Invalid or expired OTP';
      } else if (err.response?.status === 404) {
        errorMessage = 'User not found';
      } else {
        errorMessage = err.response?.data?.detail || 'Verification failed';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
      
    } finally {
      setLoading(false);
    }
  };

  const resend_otp = async (email) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Step 1: Resending OTP...")

      const response = await authService.resend_otp(email);

      console.log('OTP resent successfully');
      return { 
        success: true, 
        message: response.data.message 
      };
      
    } catch (err) {
      console.error('Resend OTP error:', err);

      let errorMessage = 'Failed to resend OTP';

      if (err.response?.status === 400) {
        errorMessage = err.response.data?.detail || 'Account already verified';
      } else if (err.response?.status === 404) {
        errorMessage = 'User not found';
      } else {
        errorMessage = err.response?.data?.detail || 'Failed to send OTP';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get authenticated user profile
  const getAuthUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching authenticated user profile...');
      const response = await authService.getAuthUserProfile();

      setUser(response.data.user);

      console.log('Auth user profile fetched successfully');
      return { 
        success: true, 
        user: response.data.user 
      };

    } catch (err) {
      console.error('Get profile error:', err);

      let errorMessage = 'Failed to fetch profile';

      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        // Auto logout on 401
        await logout();
      } else if (err.response?.status === 404) {
        errorMessage = 'User not found';
      } else {
        errorMessage = err.response?.data?.detail || 'Failed to fetch profile';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };

    } finally {
      setLoading(false);
    }
  };

  //  Update authenticated user profile
  const updateAuthUserProfile = async (updateData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Updating authenticated user profile...');
      const response = await authService.updateAuthUserProfile(updateData);

      setUser(response.data.user);

      console.log('Profile updated successfully');
      return { 
        success: true, 
        user: response.data.user,
        message: response.data.message 
      };

    } catch (err) {
      console.error('Update profile error:', err);

      let errorMessage = 'Failed to update profile';

      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        await logout();
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.detail || 'Invalid data provided';
      } else {
        errorMessage = err.response?.data?.detail || 'Failed to update profile';
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
      
      await signOut(auth);
      
      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('Logout successful');
      return { success: true };
      
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
      return { success: false, error: err.message };
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
    verify_otp,
    resend_otp,
    getAuthUserProfile,     
    updateAuthUserProfile,  
  };
}