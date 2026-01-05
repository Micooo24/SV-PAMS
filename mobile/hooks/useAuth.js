import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, GoogleAuthProvider, signInWithCredential } from '../secrets_mobile/firebase_config';
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
      // Request permission
      const authStatus = await messaging().requestPermission();
      const enabled = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        
        // Get FCM token
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
      // Firebase Auth
      const firebaseCredential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      
      console.log('Step 2: Backend Authentication via service...');
      // Backend Auth via service
      const formData = new FormData();
      formData.append('email', email.toLowerCase().trim());
      formData.append('password', password);
      if (fcmToken) {
        formData.append('fcm_token', fcmToken);
      }
      
      const response = await authService.login(formData);
      
      console.log('Step 3: Storing Firebase UID...');
      // Store Firebase UID
      await AsyncStorage.setItem('firebase_uid', firebaseCredential.user.uid);
      
      // Update state
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      console.log('Login successful via useAuth hook');
      return { success: true, user: response.data.user };
      
    } catch (err) {
      console.error('Login error in useAuth:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle Firebase Auth errors
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
        
      } 
      // Handle Backend errors
      else if (err.response?.status === 403){
        errorMessage = 'Account not verified. Please verify your account.';
      }
      else if (err.response?.status === 400) {
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

      // Force account selection
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.log('Sign out check (safe to ignore):', error);
      }

      // Get Google response
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken || response.idToken;
      const userInfo = response.data?.user || response.user;

      if (!idToken) {
        throw new Error('No ID Token found in Google response');
      }

      console.log('Step 2: Firebase Auth with Google...');
      // Firebase Auth with Google
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const firebaseUserCredential = await signInWithCredential(auth, googleCredential);

      console.log('Step 3: Backend auth via service...');
      // Backend auth via service
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
      
      // Update state
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

  const register = async (formData) =>{
    try{
      setLoading(true);
      setError(null);

      console.log("Step 1: Backend Registration via service")

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

      console.log('Registration successful via useAuth hook - OTP send to email');
      return { 
        success: true, 
        email: response.data.email,
        message: response.data.message 
      };
      
    } catch (err) {
      console.error('Registration error in useAuth:', err);

      let errorMessage = 'Registration failed. Please try again.';

       // Handle Firebase Auth errors
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
      } 

      // Handle backend errors
      else if (err.response?.data) {
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

  const logout = async () => {
    try {
      setLoading(true);
      
      // Firebase sign out
      await signOut(auth);
      
      // Clear AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(key =>
        key.startsWith('user_') || 
        ['access_token', 'token_type', 'expires_in', 'user_data', 'firebase_uid'].includes(key)
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
      
    }  finally {
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
  

  return {
    // State
    user,
    loading,
    isAuthenticated,
    error,
    
    // Actions
    login,
    googleLogin,
    register,
    logout,
    verify_otp,
    resend_otp
  };
}
