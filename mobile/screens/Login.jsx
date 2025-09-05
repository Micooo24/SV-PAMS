import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { useGlobalFonts } from '../hooks/font';

const Login = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!fontsLoaded) {
    return null;
  }

  const handleLogin = () => {
    // Handle login logic here
    console.log('Login with:', email, password);
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
            style={styles.loginButton}
            labelStyle={styles.buttonText}
            onPress={handleLogin}
          >
            Sign In
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
          >
            Continue with Google
          </Button>

          <Button
            mode="outlined"
            style={styles.socialButton}
            labelStyle={styles.socialButtonText}
            icon="facebook"
            onPress={() => console.log('Facebook login')}
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