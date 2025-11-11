import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useGlobalFonts } from '../hooks/font';
import axios from 'axios';
import BASE_URL from '../common/baseurl.js';

const Login = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!fontsLoaded) {
    return null;
  }

  const handleLogin = async () => {
    try {
      // Validation
      if (!email || !password) {
        Alert.alert('Validation Error', 'Please enter both email and password');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Validation Error', 'Please enter a valid email address');
        return;
      }

      setLoading(true);

      // Create FormData for login
      const formData = new FormData();
      formData.append('email', email.toLowerCase().trim());
      formData.append('password', password);

      console.log('Attempting login for:', email);

      // Make login request
      const response = await axios.post(`${BASE_URL}/api/users/login`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Login successful:', response.data);

      //  Store user data and token in AsyncStorage
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
              // Navigate based on user role
              if (userData.role === 'customer') {
                navigation?.navigate('Home');
              } else if (userData.role === 'vendor') {
                navigation?.navigate('VendorDashboard');
              } else if (userData.role === 'admin') {
                navigation?.navigate('AdminDashboard');
              } else {
                navigation?.navigate('Home'); // Default navigation
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      
      // Handle specific error messages
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
          {/* Email Input */}
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
          />

          {/* Password Input */}
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
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
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
            onPress={() => console.log('Google login')}
            disabled={loading}
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
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontFamily: 'Poppins-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontFamily: 'Poppins-Regular',
    color: '#666',
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
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontFamily: 'Poppins-Regular',
    color: '#2563eb',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#2563eb',
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
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    paddingVertical: 2,
  },
  socialButtonText: {
    fontFamily: 'Poppins-Regular',
    color: '#333',
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
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    fontFamily: 'Poppins-Bold',
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Login;