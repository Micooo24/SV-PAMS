import React from 'react';
import { Alert } from 'react-native';
import RegisterComponent from '../components/Register';
import { useGlobalFonts } from '../hooks/font';
import useAuth from '../hooks/useAuth';

const Register = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const { register, loading, error } = useAuth();

  if (!fontsLoaded) {
    return null;
  }

  const handleRegister = async (formData) => {
    // Validation
    if (!formData.firstname || !formData.lastname || !formData.birthday || 
        !formData.gender || !formData.mobile_no || !formData.email || 
        !formData.address || !formData.barangay || !formData.zip_code || 
        !formData.password) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return; 
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert('Validation Error', 'Password must be at least 8 characters long');
      return;
    }

    // Email validation (Gmail only)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Validation Error', 'Please use a valid Gmail address');
      return;
    }

    console.log('Submitting registration:', formData.email);

    //  Call register (sends OTP to email)
    const result = await register(formData);

    if (result.success) {
      Alert.alert(
        'Registration Successful!', 
        'A verification code has been sent to your email. Please check your inbox.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('OTPVerification', {
              email: formData.email,
              password: formData.password  // Pass password to OTP screen
            })
          }
        ]
      );
    } else {
      Alert.alert('Registration Failed', result.error);
    }
  };

  const handleNavigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <RegisterComponent
      onRegister={handleRegister}
      onNavigateToLogin={handleNavigateToLogin}
      loading={loading}
      error={error}
    />
  );
};

export default Register;