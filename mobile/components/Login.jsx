import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { styles, customInputTheme } from '../styles/login';

const LoginComponent = ({ 
  onLogin,
  onGoogleLogin,
  onNavigateToRegister,
  onNavigateToForgotPassword,
  loading,
  error 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (onLogin) {
      onLogin(email, password);
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
            theme={customInputTheme}
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
            theme={customInputTheme}
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
              onPress={onNavigateToForgotPassword}
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
            onPress={onGoogleLogin}
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
              onPress={onNavigateToRegister}
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