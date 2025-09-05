import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { Text, TextInput, Button, RadioButton, Card } from 'react-native-paper';
import { useGlobalFonts } from '../hooks/font';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

const Register = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const [currentSection, setCurrentSection] = useState(0);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
 

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    birthday: '',
    age: '',
    gender: '',
    img: null,
    
    // Contact Information
    mobileNumber: '',
    landlineNumber: '',
    email: '',
    
    // Address Information
    address: '',
    barangay: '',
    zipCode: '',
    
    // Account Security
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!fontsLoaded) {
    return null;
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentSection < 3) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const selectImage = () => {
      console.log('Select profile image');
    }

  const sections = [
    'Personal Information',
    'Contact Information', 
    'Address Information',
    'Account Security'
  ];

  
  const handleRegister = () => {
    const formDataToSend  = new FormData();

    // Append all fields from formData to FormData
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

     if (formData.img) {
      const uriParts = formData.img.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formDataToSend.append('img', {
        uri: formData.img,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    console.log('Register with:', formDataToSend);
  };





  const renderPersonalInfo = () => (
    <View style={styles.sectionContainer}>
      <Text variant="titleLarge" style={styles.sectionTitle}>Personal Information</Text>
      <Text style={styles.sectionSubtitle}>Identity & demographic info</Text>

      {/* Profile Image */}
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={selectImage} style={styles.imagePicker}>
          {formData.img ? (
            <Image source={{ uri: formData.img }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TextInput
        label="First Name *"
        value={formData.firstName}
        onChangeText={(value) => handleInputChange('firstName', value)}
        mode="outlined"
        style={styles.input}
        contentStyle={styles.inputContent}
      />

      <TextInput
        label="Middle Name"
        value={formData.middleName}
        onChangeText={(value) => handleInputChange('middleName', value)}
        mode="outlined"
        style={styles.input}
        contentStyle={styles.inputContent}
      />

      <TextInput
        label="Last Name *"
        value={formData.lastName}
        onChangeText={(value) => handleInputChange('lastName', value)}
        mode="outlined"
        style={styles.input}
        contentStyle={styles.inputContent}
      />

      <TextInput
        label="Birthday *"
        value={formData.birthday}
        right={<TextInput.Icon icon="calendar" onPress={() => setOpen(true)} />}
        mode="outlined"
        style={styles.input}
        contentStyle={styles.inputContent}
        showSoftInputOnFocus={false}
        editable={false}
        placeholder='Select your birthday'
      />

      <TextInput
        label="Age"
        value={formData.age}
        onChangeText={(value) => handleInputChange('age', value)}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
        contentStyle={styles.inputContent}
      />

      {/* Gender Selection */}
      <Text style={styles.fieldLabel}>Gender *</Text>
      <View style={styles.radioContainer}>
        <View style={styles.radioOption}>
          <RadioButton
            value="male"
            status={formData.gender === 'male' ? 'checked' : 'unchecked'}
            onPress={() => handleInputChange('gender', 'male')}
            color="#2563eb"
          />
          <Text style={styles.radioText}>Male</Text>
        </View>
        <View style={styles.radioOption}>
          <RadioButton
            value="female"
            status={formData.gender === 'female' ? 'checked' : 'unchecked'}
            onPress={() => handleInputChange('gender', 'female')}
            color="#2563eb"
          />
          <Text style={styles.radioText}>Female</Text>
        </View>
        <View style={styles.radioOption}>
          <RadioButton
            value="other"
            status={formData.gender === 'other' ? 'checked' : 'unchecked'}
            onPress={() => handleInputChange('gender', 'other')}
            color="#2563eb"
          />
          <Text style={styles.radioText}>Other</Text>
        </View>
      </View>
    </View>
  );

  const renderContactInfo = () => (
    <View style={styles.sectionContainer}>
      <Text variant="titleLarge" style={styles.sectionTitle}>Contact Information</Text>
      <Text style={styles.sectionSubtitle}>How to reach you</Text>

      <TextInput
        label="Mobile Number *"
        value={formData.mobileNumber}
        onChangeText={(value) => handleInputChange('mobileNumber', value)}
        mode="outlined"
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="+63 9XX XXX XXXX"
        contentStyle={styles.inputContent}
      />

      <TextInput
        label="Landline Number"
        value={formData.landlineNumber}
        onChangeText={(value) => handleInputChange('landlineNumber', value)}
        mode="outlined"
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="(02) XXX XXXX"
        contentStyle={styles.inputContent}
      />

      <TextInput
        label="Email Address *"
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        contentStyle={styles.inputContent}
      />
    </View>
  );

  const renderAddressInfo = () => (
    <View style={styles.sectionContainer}>
      <Text variant="titleLarge" style={styles.sectionTitle}>Address Information</Text>
      <Text style={styles.sectionSubtitle}>Location & residency info</Text>

      <TextInput
        label="Address *"
        value={formData.address}
        onChangeText={(value) => handleInputChange('address', value)}
        mode="outlined"
        style={styles.input}
        placeholder="Street, House Number, etc."
        multiline
        numberOfLines={3}
        contentStyle={styles.inputContent}
      />

      <TextInput
        label="Barangay *"
        value={formData.barangay}
        onChangeText={(value) => handleInputChange('barangay', value)}
        mode="outlined"
        style={styles.input}
        contentStyle={styles.inputContent}
      />

      <TextInput
        label="Zip Code *"
        value={formData.zipCode}
        onChangeText={(value) => handleInputChange('zipCode', value)}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
        contentStyle={styles.inputContent}
      />
    </View>
  );

  const renderAccountSecurity = () => (
    <View style={styles.sectionContainer}>
      <Text variant="titleLarge" style={styles.sectionTitle}>Account Security</Text>
      <Text style={styles.sectionSubtitle}>Login credentials & authentication</Text>

      <TextInput
        label="Password *"
        value={formData.password}
        onChangeText={(value) => handleInputChange('password', value)}
        mode="outlined"
        style={styles.input}
        secureTextEntry={!showPassword}
        contentStyle={styles.inputContent}
        right={
          <TextInput.Icon 
            icon={showPassword ? "eye-off" : "eye"} 
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      <TextInput
        label="Confirm Password *"
        value={formData.confirmPassword}
        onChangeText={(value) => handleInputChange('confirmPassword', value)}
        mode="outlined"
        style={styles.input}
        secureTextEntry={!showConfirmPassword}
        contentStyle={styles.inputContent}
        right={
          <TextInput.Icon 
            icon={showConfirmPassword ? "eye-off" : "eye"} 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        }
      />

      <Text style={styles.passwordHint}>
        Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.
      </Text>
    </View>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0: return renderPersonalInfo();
      case 1: return renderContactInfo();
      case 2: return renderAddressInfo();
      case 3: return renderAccountSecurity();
      default: return renderPersonalInfo();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.logoText}>SV: PAMS</Text>
          <Text variant="headlineSmall" style={styles.welcomeText}>Create Account</Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {sections.map((section, index) => (
            <View key={index} style={styles.progressItem}>
              <View style={[
                styles.progressDot,
                index <= currentSection && styles.progressDotActive
              ]}>
                <Text style={[
                  styles.progressNumber,
                  index <= currentSection && styles.progressNumberActive
                ]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[
                styles.progressLabel,
                index === currentSection && styles.progressLabelActive
              ]}>
                {section}
              </Text>
            </View>
          ))}
        </View>

        {/* Form Content */}
        <Card style={styles.formCard}>
          {renderCurrentSection()}
        </Card>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentSection > 0 && (
            <Button
              mode="outlined"
              style={styles.prevButton}
              labelStyle={styles.prevButtonText}
              onPress={handlePrevious}
            >
              Previous
            </Button>
          )}
          
          {currentSection < 3 ? (
            <Button
              mode="contained"
              style={styles.nextButton}
              labelStyle={styles.buttonText}
              onPress={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              mode="contained"
              style={styles.registerButton}
              labelStyle={styles.buttonText}
              onPress={handleRegister}
            >
              Create Account
            </Button>
          )}
        </View>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Text
            style={styles.loginLink}
            onPress={() => navigation && navigation.navigate('Login')}
          >
            Sign in here
          </Text>
        </View>
      </ScrollView>
     {open && (
  <DateTimePicker
    value={date}
    mode="date"
    display="default"
    onChange={(event, selectedDate) => {
      setOpen(false);
      if (selectedDate) {
        setDate(selectedDate);
        const formattedDate = selectedDate.toISOString().split('T')[0];
        handleInputChange('birthday', formattedDate);
      }
    }}
  />
)}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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

export default Register;