// ../styles/register.js

import { StyleSheet, Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const baseWidth = 375;
const scale = SCREEN_WIDTH / baseWidth;

const wp = (percentage) => (SCREEN_WIDTH * percentage) / 100;
const hp = (percentage) => (SCREEN_HEIGHT * percentage) / 100;

const normalize = (size) => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

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
    marginTop: hp(3),
    marginBottom: hp(1.5),
  },

  welcomeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: normalize(25),
    color: 'black',
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

  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: hp(1),
    paddingHorizontal: wp(1),
  },

  progressItem: {
    alignItems: 'center',
    flex: 1,
  },

  progressDot: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  progressDotActive: {
    backgroundColor: '#2563eb',
  },

  progressNumber: {
    color: '#9ca3af',
    fontSize: normalize(16),
    fontWeight: 'bold',
  },

  progressNumberActive: {
    color: '#ffffff',
  },

  progressLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalize(10),
    color: '#9ca3af',
    textAlign: 'center',
  },

  progressLabelActive: {
    fontFamily: 'Poppins-SemiBold',
    color: '#2563eb',
    fontWeight: '600',
  },

  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: wp(6),
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: hp(3),
    marginTop: hp(3),
  },

  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: normalize(20),
    color: '#1f2937',
    marginBottom: 3,
  },

  sectionSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalize(13),
    color: '#6b7280',
    marginBottom: hp(2),
  },

  input: {
    marginBottom: hp(2),
    backgroundColor: '#ffffff',
  },

  inputContent: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    paddingHorizontal: 3,
  },

  fieldLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: normalize(10),
    color: '#374151',
    marginBottom: 4,
    fontWeight: '500',
  },

  // Profile Image Section
  imageContainer: {
    alignItems: 'center',
    marginVertical: hp(3),
  },

  imagePicker: {
    width: wp(35),
    height: wp(35),
    borderRadius: wp(17.5),
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#2563eb',
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: normalize(16),
    color: '#2563eb',
  },

  // Gender Radio Buttons
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: hp(1),
  },

  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  radioText: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalize(14),
    marginLeft: 1,
    color: '#374151',
  },

  // Password Hint
  passwordHint: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalize(12),
    color: '#6b7280',
    marginTop: hp(1),
    lineHeight: 18,
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  prevButton: {
    flex: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
  },

  prevButtonText: {
    color: '#2563eb',
    fontFamily: 'Poppins-SemiBold',
    fontSize: normalize(12),
    marginTop: hp(1.2),
  },

  nextButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },

  registerButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: hp(1.2),
  },

  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: normalize(12),
    color: 'white',
  },

  // Login Link at Bottom
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(4),
    marginBottom: hp(6),
  },

  loginText: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalize(14),
    color: '#4b5563',
  },

  loginLink: {
    fontFamily: 'Poppins-Bold',
    fontSize: normalize(14),
    color: '#2563eb',
    marginLeft: 4,
  },

  
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: normalize(12),
    color: '#ef4444',
    marginTop: -hp(1.5),
    marginBottom: hp(1),
    marginLeft: wp(2),
  },

});