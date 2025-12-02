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

    const result = await register(formData);

    if (result.success) {
      Alert.alert(
        'Registration Successful', 
        'Your account has been created! You can now login.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
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