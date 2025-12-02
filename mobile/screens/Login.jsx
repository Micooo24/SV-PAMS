import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import LoginComponent from '../components/Login';
import { useGlobalFonts } from '../hooks/font';
import useAuth from '../hooks/useAuth'; 
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const Login = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const { login, googleLogin, loading, error } = useAuth();

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

  // HANDLE LOGIN LOGIC
  const handleLogin = async (email, password) => {
    console.log('🔐 Starting login process...', { email });

    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    const result = await login(email, password);
    console.log('🔐 Login result:', result);
    
    if (result.success) {
      const userData = result.user;
      console.log('✅ Login successful, user role:', userData.role);
      
      // Navigate immediately without alert for better UX
      if (userData.role === 'user' || userData.role === 'customer') {
        console.log('🔄 Navigating to MainApp...');
        navigation.navigate('MainApp');
      } else if (userData.role === 'vendor') {
        console.log('🔄 Navigating to Home...');
        navigation.navigate('Home');
      } else if (userData.role === 'admin') {
        console.log('🔄 Navigating to AdminDashboard...');
        navigation.navigate('AdminDashboard');
      } else {
        console.log('🔄 Navigating to Home (default)...');
        navigation.navigate('Home');
      }
      
      // Show success message after navigation
      setTimeout(() => {
        Alert.alert('Login Successful', `Welcome back, ${userData.firstname}!`);
      }, 500);
      
    } else {
      console.error('❌ Login failed:', result.error);
      Alert.alert('Login Failed', result.error);
    }
  };

  // HANDLE GOOGLE LOGIN LOGIC
  const handleGoogleLogin = async () => {
    console.log('🔐 Starting Google login...');
    
    const result = await googleLogin();
    console.log('🔐 Google login result:', result);
    
    if (result.success) {
      const userData = result.user;
      console.log('✅ Google login successful, user role:', userData.role);
      
      // Navigate immediately without alert for better UX
      if (userData.role === 'user' || userData.role === 'customer') {
        console.log('🔄 Navigating to MainApp...');
        navigation.navigate('MainApp');
      } else if (userData.role === 'vendor') {
        console.log('🔄 Navigating to Home...');
        navigation.navigate('Home');
      } else if (userData.role === 'admin') {
        console.log('🔄 Navigating to AdminDashboard...');
        navigation.navigate('AdminDashboard');
      } else {
        console.log('🔄 Navigating to Home (default)...');
        navigation.navigate('Home');
      }
      
      // Show success message after navigation
      setTimeout(() => {
        Alert.alert('Login Successful', `Welcome, ${userData.firstname}!`);
      }, 500);
      
    } else {
      console.error('❌ Google login failed:', result.error);
      Alert.alert('Login Failed', result.error);
    }
  };

  // NAVIGATION HANDLERS
  const handleNavigateToRegister = () => {
    console.log('🔄 Navigating to Register...');
    navigation.navigate('Register');
  };

  const handleNavigateToForgotPassword = () => {
    console.log('🔄 Navigating to ForgotPassword...');
    navigation.navigate('ForgotPassword');
  };

  return (
    <LoginComponent
      onLogin={handleLogin}
      onGoogleLogin={handleGoogleLogin}
      onNavigateToRegister={handleNavigateToRegister}
      onNavigateToForgotPassword={handleNavigateToForgotPassword}
      loading={loading}
      error={error}
    />
  );
};

export default Login;