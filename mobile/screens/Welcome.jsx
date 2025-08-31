import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useGlobalFonts } from '../hooks/font';

const Welcome = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();


  if (!fontsLoaded) {
    return null; // or a loading spinner
  }

  return (
    <View style={styles.container}>
      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Logo Placeholder */}
        <View style={styles.logoContainer}>
          <Text variant="headlineLarge" style={styles.logoText}>SV: PAMS</Text>
        </View>

        {/* Illustration Placeholder */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationPlaceholder} />
        </View>

        {/* Description */}
        <Text variant="bodyMedium" style={styles.description}>
          The system uses AI tools to analyze vendor activities and detect potential violations, such as unregistered vendors or those operating outside designated areas. This helps authorities ensure fair enforcement and maintain order in urban spaces.
        </Text>

        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>
      </View>

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
        {/* Sign Up Button */}
        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonText}
          onPress={() => navigation && navigation.navigate('Register')}
        >
          Sign up
        </Button>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already a Member? </Text>
          <Text
            style={styles.loginLink}
            onPress={() => navigation && navigation.navigate('Login')}
          >
            Login here.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logoContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  logoText: {
    fontFamily: 'Poppins-Bold',
    color: '#2563eb',
    textAlign: 'center',
  },
  illustrationContainer: {
    marginBottom: 32,
  },
  illustrationPlaceholder: {
    width: 200,
    height: 180,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
  },
  description: {
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
    color: '#444',
    fontFamily: 'Poppins-Regular',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#2563eb',
  },
  bottomContainer: {
    padding: 24,
    paddingBottom: 70,
  },
  button: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#2563eb',
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'Poppins-Regular',
  },
  loginLink: {
    color: '#2563eb',
    fontFamily: 'Poppins-Bold',
  },
});

export default Welcome;