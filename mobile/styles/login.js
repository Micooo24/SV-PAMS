// ../styles/login.js

import { StyleSheet, Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base guidelines: using 375px as standard mobile width
const baseWidth = 375;
const scale = SCREEN_WIDTH / baseWidth;

// Percentage helpers
const wp = (percentage) => (SCREEN_WIDTH * percentage) / 100;
const hp = (percentage) => (SCREEN_HEIGHT * percentage) / 100;

// Font normalizer for consistent text scaling across devices
const normalize = (size) => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

// Custom theme (unchanged logic, just cleaned up)
export const customInputTheme = {
  colors: {
    primary: '#2563eb',
    onSurfaceVariant: 'black',
    text: 'black',
    placeholder: 'black',
    background: 'white',
    outline: 'black',
  },
  roundness: 8,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(6),
    paddingVertical: hp(4),
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: hp(5),
  },

  logoText: {
    fontFamily: 'Poppins-Bold',
    fontSize: normalize(20),
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: hp(1.5),
    marginTop: hp(3),
  },

  welcomeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: normalize(28),
    color: 'black',
    textAlign: 'center',
    marginBottom: hp(1),
  },

  subtitleText: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalize(12),
    color: '#4b5563',
    textAlign: 'center',
  },

  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: wp(4),
    marginBottom: hp(3),
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },

  errorText: {
    color: '#dc2626',
    fontFamily: 'Poppins-Regular',
    fontSize: normalize(14),
  },

  formContainer: {
    width: '100%',
  },

  input: {
    marginBottom: hp(2.5),
    backgroundColor: '#fff',
  },

  inputContent: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
  },

  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: hp(3),
  },

  forgotText: {
    fontFamily: 'Poppins-Regular',
    color: '#2563eb',
    fontSize: normalize(12),
  },

  loginButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: hp(1.2),
    marginBottom: hp(2),
  },

  loginButtonDisabled: {
    backgroundColor: '#94a3b8',
  },

  buttonText: {
    fontFamily: 'Poppins-SemiBold', 
    fontSize: normalize(16),
    color: 'white',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },

  dividerText: {
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginHorizontal: wp(4),
    fontSize: normalize(12),
  },

  socialButton: {
    borderColor: '#2563eb',
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: hp(1.5),
    paddingVertical: hp(0.8),
  },

  socialButtonText: {
    fontFamily: 'Poppins-Regular',
    color: '#2563eb',
    fontSize: normalize(15),
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(2),
    marginBottom: hp(4),
  },

  signupText: {
    fontFamily: 'Poppins-Regular',
    color: '#4b5563',
    fontSize: normalize(14),
  },

  signupLink: {
    fontFamily: 'Poppins-Bold',
    color: '#2563eb',
    fontSize: normalize(14),
    marginLeft: 4,
  },
});