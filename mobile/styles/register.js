import { StyleSheet, Dimensions } from 'react-native';

export const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40, // Add this for top spacing
  },
  logoText: {
    fontFamily: 'Poppins-Bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    fontFamily: 'Poppins-Bold',
    color: '#333',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: '#2563eb',
  },
  progressNumber: {
    fontFamily: 'Poppins-Bold',
    color: '#666',
    fontSize: 14,
  },
  progressNumberActive: {
    color: '#fff',
  },
  progressLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  progressLabelActive: {
    color: '#2563eb',
    fontFamily: 'Poppins-Bold',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  sectionContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: 'Poppins-Regular',
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  imageText: {
    fontFamily: 'Poppins-Regular',
    color: '#666',
    fontSize: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputContent: {
    fontFamily: 'Poppins-Regular',
  },
  fieldLabel: {
    fontFamily: 'Poppins-Regular',
    color: '#333',
    fontSize: 16,
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    fontFamily: 'Poppins-Regular',
    color: '#333',
    marginLeft: 4,
  },
  passwordHint: {
    fontFamily: 'Poppins-Regular',
    color: '#666',
    fontSize: 12,
    marginTop: 8,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  prevButton: {
    flex: 1,
    marginRight: 10,
    borderColor: '#2563eb',
  },
  prevButtonText: {
    fontFamily: 'Poppins-Regular',
    color: '#2563eb',
  },
  nextButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#2563eb',
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#2563eb',
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
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    fontFamily: 'Poppins-Bold',
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
});