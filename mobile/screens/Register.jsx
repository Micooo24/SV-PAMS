import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { Text, TextInput, Button, RadioButton, Card, Menu } from 'react-native-paper';
import { useGlobalFonts } from '../hooks/font';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import BASE_URL from '../common/baseurl.js'
import * as ImagePicker from 'expo-image-picker';
import {styles }  from '../styles/register';
import { auth } from '../firebase/firebaseConfig'; // ← Import Firebase auth
import { createUserWithEmailAndPassword } from 'firebase/auth'; // ← Import create user function

// Barangay data with zip codes
const BARANGAYS = [
  { name: "Bagong Ilog", zipCode: "1600" },
  { name: "Bagong Katipunan", zipCode: "1600" },
  { name: "Bambang", zipCode: "1600" },
  { name: "Buting", zipCode: "1600" },
  { name: "Caniogan", zipCode: "1606" },
  { name: "Dela Paz", zipCode: "1600" },
  { name: "Kalawaan", zipCode: "1600" },
  { name: "Kapasigan", zipCode: "1600" },
  { name: "Kapitolyo", zipCode: "1603" },
  { name: "Malinao", zipCode: "1600" },
  { name: "Manggahan", zipCode: "1611" },
  { name: "Maybunga", zipCode: "1607" },
  { name: "Oranbo", zipCode: "1600" },
  { name: "Palatiw", zipCode: "1600" },
  { name: "Pinagbuhatan", zipCode: "1602" },
  { name: "Pineda", zipCode: "1600" },
  { name: "Rosario", zipCode: "1609" },
  { name: "Sagad", zipCode: "1600" },
  { name: "San Antonio", zipCode: "1600" },
  { name: "San Joaquin", zipCode: "1601" },
  { name: "San Jose", zipCode: "1600" },
  { name: "San Miguel", zipCode: "1600" },
  { name: "San Nicolas", zipCode: "1600" },
  { name: "Santa Cruz", zipCode: "1600" },
  { name: "Santa Lucia", zipCode: "1608" },
  { name: "Santa Rosa", zipCode: "1600" },
  { name: "Santo Tomas", zipCode: "1600" },
  { name: "Santolan", zipCode: "1610" },
  { name: "Ugong", zipCode: "1604" },
  { name: "Green Park", zipCode: "1612" }
];

const Register = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const [currentSection, setCurrentSection] = useState(0);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [barangayMenuVisible, setBarangayMenuVisible] = useState(false); // Menu state
  const [loading, setLoading] = useState(false);

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

  // Define the Custom Blue & Black Theme for Input
  const customInputTheme = {
    colors: {
      primary: '#2563eb', // BLUE: Label color when focused & outline color when focused
      onSurfaceVariant: 'black', // BLACK: Label color when unfocused
      text: 'black', // BLACK: Input text color
      placeholder: 'black', // BLACK: Placeholder text color
      background: 'white', // WHITE: Background color
      outline: 'black', // BLACK: Outline border color (unfocused)
    },
    roundness: 8, // Rounded corners
  };

  if (!fontsLoaded) {
    return null;
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

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

  // Handle barangay selection
  const handleBarangaySelect = (barangay) => {
    const selectedBarangay = BARANGAYS.find(b => b.name === barangay);
    if (selectedBarangay) {
      handleInputChange('barangay', selectedBarangay.name);
      handleInputChange('zip_code', selectedBarangay.zipCode);
    }
    setBarangayMenuVisible(false);
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
      setLoading(true); // ← Start loading

      // Validation
      if (!formData.firstname || !formData.lastname || !formData.birthday || 
          !formData.gender || !formData.mobile_no || !formData.email || 
          !formData.address || !formData.barangay || !formData.zip_code || 
          !formData.password) {
        alert('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        setLoading(false);
        return;
      }

      // Password strength validation (optional but recommended)
      if (formData.password.length < 8) {
        alert('Password must be at least 8 characters long');
        setLoading(false);
        return;
      }

      console.log('Step 1: Creating Firebase Auth user...');

      // ✅ STEP 1: Create Firebase Auth User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.toLowerCase().trim(),
        formData.password
      );

      console.log('✅ Firebase Auth user created:', userCredential.user.uid);

      // ✅ STEP 2: Register user in your backend
      console.log('Step 2: Registering user in backend...');

      const formDataToSend = new FormData();

      const fieldsToSend = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        middlename: formData.middlename || '',
        address: formData.address,
        barangay: formData.barangay,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        birthday: formData.birthday,
        age: formData.age,
        mobile_no: formData.mobile_no,
        landline_no: formData.landline_no || '',
        zip_code: formData.zip_code,
        gender: formData.gender,
        role: 'user',
        firebase_uid: userCredential.user.uid // ← Send Firebase UID to backend
      };

      Object.entries(fieldsToSend).forEach(([key, value]) => {
        formDataToSend.append(key, value);
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

      const response = await axios.post(`${BASE_URL}/api/users/register`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Backend registration successful:', response.data);

      alert('Registration successful! You can now login.');
      
      if (navigation) {
        navigation.navigate('Login');
      }

    } catch (error) {
      console.error('❌ Registration error:', error);

      // Handle Firebase Auth errors
      if (error.code) {
        let firebaseErrorMessage = '';
        
        switch (error.code) {
          case 'auth/email-already-in-use':
            firebaseErrorMessage = 'This email is already registered. Please login instead.';
            break;
          case 'auth/invalid-email':
            firebaseErrorMessage = 'Invalid email address format.';
            break;
          case 'auth/weak-password':
            firebaseErrorMessage = 'Password is too weak. Please use a stronger password.';
            break;
          case 'auth/network-request-failed':
            firebaseErrorMessage = 'Network error. Please check your internet connection.';
            break;
          default:
            firebaseErrorMessage = `Firebase error: ${error.message}`;
        }
        
        alert(`Registration failed: ${firebaseErrorMessage}`);
      } 
      // Handle backend errors
      else if (error.response?.data) {
        const errorMessage = error.response?.data?.detail || 
                            error.response?.data?.message || 
                            'Registration failed. Please try again.';
        alert(`Registration failed: ${errorMessage}`);
      } 
      // Handle other errors
      else {
        alert('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false); // ← Stop loading
    }
  };


  const renderPersonalInfo = () => (
    <View style={styles.sectionContainer}>
      <Text variant="titleLarge" style={styles.sectionTitle}>Personal Information</Text>
      <Text style={styles.sectionSubtitle}>Identity & demographic info</Text>

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
        theme={customInputTheme}
        textColor="black"
      />

      <TextInput
        label="Middle Name"
        value={formData.middlename}
        onChangeText={(value) => handleInputChange('middlename', value)}
        mode="outlined"
        style={styles.input}
        contentStyle={styles.inputContent}
        theme={customInputTheme}
        textColor="black"
      />

      <TextInput
        label="Last Name *"
        value={formData.lastname}
        onChangeText={(value) => handleInputChange('lastname', value)}
        mode="outlined"
        style={styles.input}
        contentStyle={styles.inputContent}
        theme={customInputTheme}
        textColor="black"
      />

      <TextInput
        label="Birthday *"
        value={formData.birthday}
        right={<TextInput.Icon icon="calendar" onPress={() => setOpen(true)} iconColor="black" />}
        mode="outlined"
        style={styles.input}
        contentStyle={styles.inputContent}
        showSoftInputOnFocus={false}
        editable={false}
        placeholder='Select your birthday'
        theme={customInputTheme}
        textColor="black"
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
        theme={customInputTheme}
        textColor="black"
      />

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
        theme={customInputTheme}
        textColor="black"
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
        theme={customInputTheme}
        textColor="black"
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
        theme={customInputTheme}
        textColor="black"
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
        theme={customInputTheme}
        textColor="black"
      />

      {/* Barangay Dropdown Menu */}
      <Menu
        visible={barangayMenuVisible}
        onDismiss={() => setBarangayMenuVisible(false)}
        anchor={
          <TextInput
            label="Barangay *"
            value={formData.barangay}
            mode="outlined"
            style={styles.input}
            contentStyle={styles.inputContent}
            editable={false}
            right={<TextInput.Icon icon="menu-down" onPress={() => setBarangayMenuVisible(true)} iconColor="black" />}
            onPressIn={() => setBarangayMenuVisible(true)}
            placeholder="Select Barangay"
            theme={customInputTheme}
            textColor="black"
          />
        }
        contentStyle={{ maxHeight: 400, backgroundColor: '#fff' }}
      >
        <ScrollView style={{ maxHeight: 300 }}>
          {BARANGAYS.map((brgy) => (
            <Menu.Item
              key={brgy.name}
              onPress={() => handleBarangaySelect(brgy.name)}
              title={`${brgy.name} (${brgy.zipCode})`}
            />
          ))}
        </ScrollView>
      </Menu>

      {/* Auto-filled Zip Code */}
      <TextInput
        label="Zip Code *"
        value={formData.zip_code}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
        contentStyle={styles.inputContent}
        editable={false}
        placeholder="Auto-filled from Barangay"
        theme={customInputTheme}
        textColor="black"
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
        theme={customInputTheme}
        textColor="black"
        right={
          <TextInput.Icon 
            icon={showPassword ? "eye-off" : "eye"} 
            iconColor="black"
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
        theme={customInputTheme}
        textColor="black"
        right={
          <TextInput.Icon 
            icon={showConfirmPassword ? "eye-off" : "eye"} 
            iconColor="black"
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
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.logoText}>SV: PAMS</Text>
          <Text variant="headlineSmall" style={styles.welcomeText}>Create Account</Text>
        </View>

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

        <Card style={styles.formCard}>
          {renderCurrentSection()}
        </Card>

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

// Local StyleSheet to override imported styles or add new ones
const localStyles = StyleSheet.create({
  logoText: {
    color: '#2563eb', // Blue
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  welcomeText: {
    color: 'black', // Black
    textAlign: 'center',
    marginBottom: 20
  },
  // Add other overrides if needed, though most are handled inline or via customInputTheme
});

export default Register;