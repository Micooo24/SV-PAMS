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
    console.log('Submitting registration:', formData.email);

    // Call register (sends OTP to email)
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
              password: formData.password
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