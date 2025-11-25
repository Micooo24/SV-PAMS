import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useGlobalFonts } from '../hooks/font';
import axios from 'axios';
import BASE_URL from '../common/baseurl.js';

// 1. IMPORT GOOGLE SIGN IN LIBRARY
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const Login = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2. CONFIGURE GOOGLE SIGN IN ON LOAD
  useEffect(() => {
    GoogleSignin.configure({
      // PASTE YOUR WEB CLIENT ID HERE (From google-services.json)
      webClientId: '657897595229-tf6au9pbiob6k48tulhv54mft4on8n4g.apps.googleusercontent.com', 
      offlineAccess: true,
    });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  // 3. HANDLE GOOGLE LOGIN FUNCTION
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();

      // Force account selection
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.log('Sign out check (safe to ignore):', error);
      }

      const response = await GoogleSignin.signIn();
      const userInfo = response.data?.user || response.user; // Handle version differences
      
      console.log('Google User Info:', userInfo);

      // MOCK DATA for role (Replace with backend call in real app)
      const mockUserRole = 'customer'; 

      await AsyncStorage.setItem('user_data', JSON.stringify(userInfo));
      await AsyncStorage.setItem('user_email', userInfo.email);
      await AsyncStorage.setItem('user_firstname', userInfo.givenName);
      await AsyncStorage.setItem('user_role', mockUserRole); 
      
      Alert.alert(
        'Login Successful',
        `Welcome ${userInfo.name}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (mockUserRole === 'customer') {
                navigation.navigate('MainApp');
              } else if (mockUserRole === 'vendor') {
                navigation?.navigate('VendorDashboard');
              } else if (mockUserRole === 'admin') {
                navigation?.navigate('AdminDashboard');
              } else {
                navigation?.navigate('Home'); 
              }
            }
          }
        ]
      );

    } catch (error) {
      console.log('Google Login Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled login');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Login in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available');
      } else {
        Alert.alert('Login Failed', error.toString());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Validation Error', 'Please enter both email and password');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Validation Error', 'Please enter a valid email address');
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append('email', email.toLowerCase().trim());
      formData.append('password', password);

      console.log('Attempting login for:', email);

      const response = await axios.post(`${BASE_URL}/api/users/login`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Login successful:', response.data);

      try {
        await AsyncStorage.multiSet([
          ['access_token', response.data.access_token],
          ['token_type', response.data.token_type],
          ['expires_in', response.data.expires_in.toString()],
          ['user_data', JSON.stringify(response.data.user)],
          ['user_id', response.data.user._id],
          ['user_email', response.data.user.email],
          ['user_firstname', response.data.user.firstname],
          ['user_lastname', response.data.user.lastname],
          ['user_role', response.data.user.role],
          ['user_mobile', response.data.user.mobile_no.toString()],
          ['user_address', response.data.user.address],
          ['user_barangay', response.data.user.barangay],
          ['user_img', response.data.user.img],
        ]);

        console.log('User data stored in AsyncStorage');
      } catch (storageError) {
        console.error('AsyncStorage error:', storageError);
      }

      const userData = response.data.user;
      
      Alert.alert(
        'Login Successful',
        `Welcome back, ${userData.firstname}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (userData.role === 'customer') {
                navigation.navigate('MainApp');
              } else if (userData.role === 'vendor') {
                navigation?.navigate('VendorDashboard');
              } else if (userData.role === 'admin') {
                navigation?.navigate('AdminDashboard');
              } else {
                navigation?.navigate('Home'); 
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.detail || 'Invalid email or password';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      }
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Define the Black & Blue Theme for Input
  const customInputTheme = {
    colors: {
      primary: '#2563eb', // BLUE: Label color when focused & outline color when focused
      onSurfaceVariant: 'black', // BLACK: Label color when unfocused
      text: 'black', // BLACK: Input text color
      placeholder: 'black', // BLACK: Placeholder text color
      background: 'white', // WHITE: Background color
      outline: 'black', // BLACK: Outline border color (unfocused)
    },
    roundness: 8, // Rounded corners
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.logoText}>SV: PAMS</Text>
          <Text variant="headlineSmall" style={styles.welcomeText}>Welcome Back</Text>
          <Text variant="bodyMedium" style={styles.subtitleText}>
            Sign in to your account to continue
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Email Input - Custom Theme */}
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            contentStyle={styles.inputContent}
            disabled={loading}
            theme={customInputTheme} // <--- APPLY THEME HERE
            textColor="black" // Ensures text typed is black
          />

          {/* Password Input - Custom Theme */}
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            autoComplete="password"
            contentStyle={styles.inputContent}
            disabled={loading}
            theme={customInputTheme} // <--- APPLY THEME HERE
            textColor="black" // Ensures text typed is black
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                iconColor="black" // Make eye icon black
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          {/* Forgot Password */}
          <View style={styles.forgotContainer}>
            <Text 
              style={styles.forgotText}
              onPress={() => navigation && navigation.navigate('ForgotPassword')}
            >
              Forgot Password?
            </Text>
          </View>

          {/* Login Button */}
          <Button
            mode="contained"
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            labelStyle={styles.buttonText}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          {/* Social Login Buttons */}
          <Button
            mode="outlined"
            style={styles.socialButton}
            labelStyle={styles.socialButtonText}
            icon="google"
            onPress={handleGoogleLogin} 
            disabled={loading}
            textColor="black" // Text is black
          >
            Continue with Google
          </Button>

          <Button
            mode="outlined"
            style={styles.socialButton}
            labelStyle={styles.socialButtonText}
            icon="facebook"
            onPress={() => console.log('Facebook login')}
            disabled={loading}
            textColor="black" // Text is black
          >
            Continue with Facebook
          </Button>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Text
              style={styles.signupLink}
              onPress={() => navigation && navigation.navigate('Register')}
            >
              Sign up here
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontFamily: 'Poppins-Bold',
    color: '#2563eb', // BLUE: Logo
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontFamily: 'Poppins-Bold',
    color: 'black', // BLACK: Welcome text
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontFamily: 'Poppins-Regular',
    color: 'black', // BLACK: Subtitle
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputContent: {
    fontFamily: 'Poppins-Regular',
    color: 'black', // Input text
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontFamily: 'Poppins-Regular',
    color: '#2563eb', // BLUE: Forgot Password Link
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#2563eb', // BLUE: Login Button Background
    borderRadius: 8,
    paddingVertical: 4,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    fontWeight: '600',
    color: 'white', // WHITE: Login Button Text
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0', // Grey divider (better for blue theme)
  },
  dividerText: {
    fontFamily: 'Poppins-Regular',
    color: 'black', // BLACK: "or" text
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    borderColor: 'black', // BLACK: Border for social buttons
    borderRadius: 8,
    marginBottom: 12,
    paddingVertical: 2,
  },
  socialButtonText: {
    fontFamily: 'Poppins-Regular',
    color: 'black', // BLACK: Text for social buttons
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupText: {
    fontFamily: 'Poppins-Regular',
    color: 'black', // BLACK: "Don't have an account?"
    fontSize: 14,
  },
  signupLink: {
    fontFamily: 'Poppins-Bold',
    color: '#2563eb', // BLUE: "Sign up here" link
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default Login;