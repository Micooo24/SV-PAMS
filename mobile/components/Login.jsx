import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useGlobalFonts } from '../hooks/font';
import useAuth from '../hooks/useAuth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { styles, customInputTheme } from '../styles/login'; // ← Import theme from styles

const LoginComponent = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // USE AUTH HOOK
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

  // HANDLE LOGIN USING HOOK
  const handleLogin = async () => {
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

    if (result.success) {
      const userData = result.user;

      Alert.alert(
        'Login Successful',
        `Welcome back, ${userData.firstname}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate based on role
              if (userData.role === 'user' || userData.role === 'customer') {
                navigation.navigate('MainApp');
              } else if (userData.role === 'vendor') {
                navigation?.navigate('Home');
              } else if (userData.role === 'admin') {
                navigation?.navigate('AdminDashboard');
              } else {
                navigation?.navigate('Home');
              }
            }
          }
        ]
      );
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  // HANDLE GOOGLE LOGIN USING HOOK
  const handleGoogleLogin = async () => {
    const result = await googleLogin();

    if (result.success) {
      const userData = result.user;

      Alert.alert(
        'Login Successful',
        `Welcome, ${userData.firstname}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate based on role
              if (userData.role === 'customer') {
                navigation.navigate('MainApp');
              } else if (userData.role === 'vendor') {
                navigation?.navigate('Home');
              } else if (userData.role === 'admin') {
                navigation?.navigate('AdminDashboard');
              } else {
                navigation?.navigate('Home');
              }
            }
          }
        ]
      );
    } else {
      Alert.alert('Login Failed', result.error);
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

        {/* Show Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
            theme={customInputTheme} // ← Using theme from styles
            textColor="black"
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
            theme={customInputTheme} // ← Using theme from styles
            textColor="black"
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                iconColor="black"
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
            textColor="black"
          >
            Continue with Google
          </Button>

          <Button
            mode="outlined"
            style={styles.socialButton}
            labelStyle={styles.socialButtonText}
            icon="facebook"
            onPress={() => Alert.alert('Coming Soon', 'Facebook login will be available soon')}
            disabled={loading}
            textColor="black"
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

export default LoginComponent;