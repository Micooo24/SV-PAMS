import { StyleSheet } from 'react-native';
import { DefaultTheme } from 'react-native-paper';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 24,
    color: '#1e293b',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionContainer: {
    gap: 16,
  },
  instructionText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#f8fafc',
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
  },
  inputContent: {
    fontSize: 24,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendLink: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  timerText: {
    color: '#64748b',
    fontSize: 14,
  },
  backContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  backLink: {
    color: '#64748b',
    fontSize: 14,
  },
});

export const customInputTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563eb',
    text: '#000000',
    placeholder: '#94a3b8',
  },
};