import React from 'react';
import { Alert } from 'react-native';
import OTPVerificationComponent from '../components/OTPVerification';
import { useGlobalFonts } from '../hooks/font';
import useAuth from '../hooks/useAuth';

const OTPVerification = ({ navigation, route }) => {
  const fontsLoaded = useGlobalFonts();
  const { verify_otp, resend_otp, loading, error } = useAuth();
  
  // Get email and password from navigation params
  const { email, password } = route.params;

  if (!fontsLoaded) {
    return null;
  }

  const handleVerifyOTP = async (otp_code) => {
    if (otp_code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-digit verification code');
      return;
    }

    console.log('Verifying OTP:', { email, otp_code });
    
    const result = await verify_otp(email, otp_code, password);

    if (result.success) {
      Alert.alert(
        'Success!', 
        'Your account has been verified successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }], // Or your main screen
            })
          }
        ]
      );
    } else {
      Alert.alert('Verification Failed', result.error);
    }
  };

  const handleResendOTP = async () => {
    console.log('Resending OTP to:', email);
    
    const result = await resend_otp(email);

    if (result.success) {
      Alert.alert('Success', 'A new verification code has been sent to your email');
    } else {
      Alert.alert('Failed', result.error);
    }
  };

  const handleNavigateBack = () => {
    navigation.navigate('Login');
  };

  return (
    <OTPVerificationComponent
      email={email}
      onVerifyOTP={handleVerifyOTP}
      onResendOTP={handleResendOTP}
      onNavigateBack={handleNavigateBack}
      loading={loading}
      error={error}
    />
  );
};

export default OTPVerification;