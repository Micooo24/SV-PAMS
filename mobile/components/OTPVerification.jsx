import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { styles, customInputTheme } from '../styles/otpVerification';

const OTPVerificationComponent = ({
  email,
  onVerifyOTP,
  onResendOTP,
  onNavigateBack,
  loading,
  error
}) => {
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = () => {
    if (otpCode.length !== 6) {
      return;
    }
    onVerifyOTP(otpCode);
  };

  const handleResend = async () => {
    if (canResend) {
      await onResendOTP();
      setTimer(60);
      setCanResend(false);
      setOtpCode('');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.logoText}>SV: PAMS</Text>
          <Text variant="headlineSmall" style={styles.welcomeText}>Verify Your Email</Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.sectionContainer}>
            <Text style={styles.instructionText}>
              We've sent a 6-digit verification code to:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.subText}>
              Please enter the code below to verify your account.
            </Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TextInput
              label="Verification Code"
              value={otpCode}
              onChangeText={setOtpCode}
              mode="outlined"
              style={styles.input}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="Enter 6-digit code"
              contentStyle={styles.inputContent}
              theme={customInputTheme}
              textColor="black"
              disabled={loading}
            />

            <Button
              mode="contained"
              style={styles.verifyButton}
              labelStyle={styles.buttonText}
              onPress={handleVerify}
              loading={loading}
              disabled={loading || otpCode.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify Account'}
            </Button>

            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendLink}>Resend Code</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  Resend code in {timer}s
                </Text>
              )}
            </View>

            <View style={styles.backContainer}>
              <TouchableOpacity onPress={onNavigateBack}>
                <Text style={styles.backLink}>← Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OTPVerificationComponent;