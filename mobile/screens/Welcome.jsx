import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';

const Welcome = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Logo Placeholder */}
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder} />
        {/* <Image source={require('../assets/logo.png')} style={styles.logo} /> */}
      </View>

      {/* Illustration Placeholder */}
      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationPlaceholder} />
        {/* <Image source={require('../assets/illustration.png')} style={styles.illustration} /> */}
      </View>

      {/* Title */}
      <Text variant="headlineMedium" style={styles.title}>
        SV: PAMS
      </Text>

      {/* Description */}
      <Text variant="bodyMedium" style={styles.description}>
        The SV: PAMS App is powered by strong and secured Electronic Know Your Customer (eKYC) for identity verification and seamless transactions.
      </Text>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
      </View>

      {/* Sign Up Button */}
      <Button
        mode="contained"
        style={styles.button}
        onPress={() => navigation && navigation.navigate('SignUp')}
      >
        Sign up
      </Button>

      {/* Login Link */}
      <View style={styles.loginContainer}>
        <Text>Already a Member? </Text>
        <Text
          style={styles.loginLink}
          onPress={() => navigation && navigation.navigate('Login')}
        >
          Login here.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logoContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 120,
    height: 32,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
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
  title: {
    marginTop: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
    color: '#444',
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
  button: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#2563eb',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLink: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
});

export default Welcome;

