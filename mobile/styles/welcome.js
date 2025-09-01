import { StyleSheet, Dimensions } from 'react-native';

export const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: width,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logoContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  logoText: {
    fontFamily: 'Poppins-Bold',
    color: '#2563eb',
    textAlign: 'center',
  },
  pageTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  illustrationContainer: {
    marginBottom: 24,
  },
  illustration: {
    width: 300,
    height: 250,
  },
  description: {
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
    color: '#444',
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#2563eb',
    width: 24,
    borderRadius: 4,
  },
  bottomContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  button: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 4,
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    color: '#2563eb',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    fontWeight: '600',
  },
});