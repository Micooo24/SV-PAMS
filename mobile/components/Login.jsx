import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { styles, customInputTheme } from '../styles/login';

// Validation Schema - Only required fields
const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const LoginComponent = ({ 
  onLogin,
  onGoogleLogin,
  onFacebookLogin,
  onNavigateToRegister,
  onNavigateToForgotPassword,
  loading,
  error 
}) => {
  const [showPassword, setShowPassword] = useState(false);

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

        {/* Formik Form */}
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginValidationSchema}
          onSubmit={(values) => {
            onLogin(values.email, values.password);
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View>
                <TextInput
                  label="Email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  contentStyle={styles.inputContent}
                  disabled={loading}
                  theme={customInputTheme}
                  textColor="black"
                  error={touched.email && errors.email}
                />
                {touched.email && errors.email && (
                  <Text style={styles.fieldErrorText}>{errors.email}</Text>
                )}
              </View>

              {/* Password Input */}
              <View>
                <TextInput
                  label="Password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  contentStyle={styles.inputContent}
                  disabled={loading}
                  theme={customInputTheme}
                  textColor="black"
                  error={touched.password && errors.password}
                  right={
                    <TextInput.Icon 
                      icon={showPassword ? "eye-off" : "eye"} 
                      iconColor="black"
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
                {touched.password && errors.password && (
                  <Text style={styles.fieldErrorText}>{errors.password}</Text>
                )}
              </View>

              {/* Login Button */}
              <Button
                mode="contained"
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                labelStyle={styles.buttonText}
                onPress={handleSubmit}
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
                Google
              </Button>

              <Button
                mode="outlined"
                style={styles.socialButton}
                labelStyle={styles.socialButtonText}
                icon="facebook"
                onPress={onFacebookLogin}
                disabled={loading}
                textColor="black"
              >
                Facebook
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
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginComponent;