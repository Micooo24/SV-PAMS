import { StyleSheet, Dimensions } from 'react-native';

export const { width } = Dimensions.get('window');

//  CUSTOM THEME FOR BLACK & BLUE INPUTS
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
    color: 'black',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
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
    color: 'black',
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
    color: 'white',
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
    color: 'black',
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    borderColor: 'black',
    borderRadius: 8,
    marginBottom: 12,
    paddingVertical: 2,
  },
  socialButtonText: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
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
    color: 'black',
    fontSize: 14,
  },
  signupLink: {
    fontFamily: 'Poppins-Bold',
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  }
});