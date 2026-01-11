import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import LoginComponent from '../components/Login';
import { useGlobalFonts } from '../hooks/font';
import useAuth from '../hooks/useAuth'; 
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

const Login = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const { login, googleLogin, facebookLogin, loading, error } = useAuth();

  // Configure Google Sign In on load
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '657897595229-tf6au9pbiob6k48tulhv54mft4on8n4g.apps.googleusercontent.com', 
      offlineAccess: true,
    });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  // HANDLE LOGIN LOGIC - Validation now handled by Formik/Yup
  const handleLogin = async (email, password) => {
    console.log('Starting login process...', { email });

    const result = await login(email, password);
    console.log('Login result:', result);
    
    if (result.success) {
      const userData = result.user;
      console.log('Login successful, user role:', userData.role);
      
      // Navigate immediately without alert for better UX
      if (userData.role === 'user' || userData.role === 'customer') {
        navigation.navigate('MainApp');
      } else if (userData.role === 'vendor') {
        navigation.navigate('Home');
      } else if (userData.role === 'admin') {
        navigation.navigate('AdminDashboard');
      } else {
        navigation.navigate('Home');
      }
      
      // Show success message after navigation
      setTimeout(() => {
        Alert.alert('Login Successful', `Welcome back, ${userData.firstname}!`);
      }, 500);
      
    } else {
      console.error('Login failed:', result.error);
      Alert.alert('Login Failed', result.error);
    }
  };

  // HANDLE GOOGLE LOGIN LOGIC
  const handleGoogleLogin = async () => {
    console.log('Starting Google login...');
    
    const result = await googleLogin();
    console.log('Google login result:', result);
    
    if (result.success) {
      const userData = result.user;
      console.log('Google login successful, user role:', userData.role);
      
      // Navigate immediately without alert for better UX
      if (userData.role === 'user' || userData.role === 'customer') {
        navigation.navigate('MainApp');
      } else if (userData.role === 'vendor') {
        navigation.navigate('Home');
      } else if (userData.role === 'admin') {
        navigation.navigate('AdminDashboard');
      } else {
        navigation.navigate('Home');
      }
      
      // Show success message after navigation
      setTimeout(() => {
        Alert.alert('Login Successful', `Welcome, ${userData.firstname}!`);
      }, 500);
      
    } else {
      console.error('Google login failed:', result.error);
      Alert.alert('Login Failed', result.error);
    }
  };

  // HANDLE FACEBOOK LOGIN LOGIC
  const handleFacebookLogin = async () => {
    console.log('Starting Facebook login...');
    
    try {
      // Request Facebook login permissions
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      
      if (result.isCancelled) {
        console.log('Facebook login cancelled by user');
        Alert.alert('Login Cancelled', 'Facebook login was cancelled');
        return;
      }

      // Get Facebook access token
      const data = await AccessToken.getCurrentAccessToken();
      
      if (!data) {
        throw new Error('Failed to get Facebook access token');
      }

      console.log('Facebook access token obtained:', data.accessToken);

      //  Pass the Facebook access token to useAuth
      const loginResult = await facebookLogin(data.accessToken);
      console.log('Facebook login result:', loginResult);
      
      if (loginResult.success) {
        const userData = loginResult.user;
        console.log('Facebook login successful, user role:', userData.role);
        
        // Navigate immediately without alert for better UX
        if (userData.role === 'user' || userData.role === 'customer') {
          navigation.navigate('MainApp');
        } else if (userData.role === 'vendor') {
          navigation.navigate('Home');
        } else if (userData.role === 'admin') {
          navigation.navigate('AdminDashboard');
        } else {
          navigation.navigate('Home');
        }
        
        // Show success message after navigation
        setTimeout(() => {
          Alert.alert('Login Successful', `Welcome, ${userData.firstname}!`);
        }, 500);
        
      } else {
        console.error('Facebook login failed:', loginResult.error);
        Alert.alert('Login Failed', loginResult.error || 'Facebook login failed. Please try again.');
      }
      
    } catch (err) {
      console.error('Facebook login error:', err);
      Alert.alert('Login Error', err.message || 'An error occurred during Facebook login');
    }
  };

  // NAVIGATION HANDLERS
  const handleNavigateToRegister = () => {
    navigation.navigate('Register');
  };

  const handleNavigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
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