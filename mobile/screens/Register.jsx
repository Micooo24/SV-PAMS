import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { Text, TextInput, Button, RadioButton, Card } from 'react-native-paper';
import { useGlobalFonts } from '../hooks/font';
import axios from 'axios';
import { styles } from '../styles/register.js';
import DateTimePicker from '@react-native-community/datetimepicker';
import BASE_URL from '../common/baseurl.js'
import * as ImagePicker from 'expo-image-picker';

const Register = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const [currentSection, setCurrentSection] = useState(0);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

 

  const [formData, setFormData] = useState({
    // Personal Information
    firstname: '',
    middlename: '',
    lastname: '',
    birthday: '',
    age: '',
    gender: '',
    img: null,
    
    // Contact Information
    mobile_no: '',
    landline_no: '',
    email: '',
    
    // Address Information
    address: '',
    barangay: '',
    zip_code: '',
    
    // Account Security
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!fontsLoaded) {
    return null;
  }
    const pickImage = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      handleInputChange('img', selectedImageUri);
    }
  };

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

  const sections = [
    'Personal Information',
    'Contact Information', 
    'Address Information',
    'Account Security'
  ];


const handleRegister = async () => {
  try {
    // Validation first
    if (!formData.firstname || !formData.lastname || !formData.birthday || 
        !formData.gender || !formData.mobile_no || !formData.email || 
        !formData.address || !formData.barangay || !formData.zip_code || 
        !formData.password) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Create single FormData instance
    const formDataToSend = new FormData();

    // Append all text fields (exclude confirmPassword and img)
    const fieldsToSend = {
      firstname: formData.firstname,
      lastname: formData.lastname,
      middlename: formData.middlename || '',
      address: formData.address,
      barangay: formData.barangay,
      email: formData.email,
      password: formData.password,
      birthday: formData.birthday,
      age: parseInt(formData.age) || 0,
      mobile_no: formData.mobile_no, // Keep as string to avoid conversion issues
      landline_no: formData.landline_no || '',
      zip_code: parseInt(formData.zip_code) || 0,
      gender: formData.gender,
      role: 'customer'
    };

    // Append all fields to FormData
    Object.entries(fieldsToSend).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    // Handle image separately if exists
    if (formData.img) {
      const uriParts = formData.img.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formDataToSend.append('img', {
        uri: formData.img,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    console.log('Sending registration data...');

    const response = await axios.post(`${BASE_URL}/api/users/register`, formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Registration successful:', response.data);
    alert('Registration successful!');
    
    if (navigation) {
      navigation.navigate('Login');
    }

  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    
    // Better error handling
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        'Registration failed. Please try again.';
    alert(`Registration failed: ${errorMessage}`);
  }
};
  const renderPersonalInfo = () => (
    <View style={styles.sectionContainer}>
      <Text variant="titleLarge" style={styles.sectionTitle}>Personal Information</Text>
      <Text style={styles.sectionSubtitle}>Identity & demographic info</Text>

      {/* Profile Image */}
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
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
        value={formData.firstname}
        onChangeText={(value) => handleInputChange('firstname', value)}
        mode="outlined"
        style={styles.input}
        contentStyle={styles.inputContent}
      />

      <TextInput
        label="Middle Name"
        value={formData.middlename}
        onChangeText={(value) => handleInputChange('middlename', value)}
        mode="outlined"
        style={styles.input}
        contentStyle={styles.inputContent}
      />

      <TextInput
        label="Last Name *"
        value={formData.lastname}
        onChangeText={(value) => handleInputChange('lastname', value)}
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
        editable={false}
        contentStyle={styles.inputContent}
        placeholder='Auto-calculated from birthday'
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
        value={formData.mobile_no}
        onChangeText={(value) => handleInputChange('mobile_no', value)}
        mode="outlined"
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="+63 9XX XXX XXXX"
        contentStyle={styles.inputContent}
      />

      <TextInput
        label="Landline Number"
        value={formData.landline_no}
        onChangeText={(value) => handleInputChange('landline_no', value)}
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
        value={formData.zip_code}
        onChangeText={(value) => handleInputChange('zip_code', value)}
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
          {currentSection === 3 && (
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Text
                style={styles.loginLink}
                onPress={() => navigation && navigation.navigate('Login')}
              >
                Sign in here
              </Text>
            </View>
          )}
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
        
        // Auto-calculate age
        const today = new Date();
        const birthDate = new Date(selectedDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        handleInputChange('age', age.toString());
      }
    }}
  />
)}
    </KeyboardAvoidingView>
  );
};


export default Register;