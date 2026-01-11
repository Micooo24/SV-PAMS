import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, TextInput, Button, RadioButton, Card, Menu } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { styles, customInputTheme } from '../styles/register';

// Validations
import { Formik } from 'formik';
import * as Yup from 'yup';

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

const personalInfoSchema = Yup.object().shape({
  firstname: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  middlename: Yup.string(),
  lastname: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  birthday: Yup.string()
    .required('Birthday is required'),
  age: Yup.string()
    .required('Age is required'),
  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['male', 'female', 'other'], 'Please select a valid gender'),
  img: Yup.mixed()
    .required('Profile photo is required'),
}); 


const contactInfoSchema = Yup.object().shape({
  mobile_no: Yup.string()
    .required('Mobile number is required'),
  landline_no: Yup.string(),
  email: Yup.string()
    .required('Email address is required')
    .email('Please enter a valid email address'),
});


const addressInfoSchema = Yup.object().shape({
  address: Yup.string()
    .required('Address is required'),
  barangay: Yup.string()
    .required('Barangay is required'),
  zip_code: Yup.string()
    .required('Zip code is required'),
});

const accountSecuritySchema = Yup.object().shape({
  password: Yup.string()
    .required('Password is required'),
  confirmPassword: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});



const RegisterComponent = ({
  onRegister,
  onNavigateToLogin,
  loading,
  error
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [barangayMenuVisible, setBarangayMenuVisible] = useState(false);
  
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

  const handleBarangaySelect = (barangay) => {
    const selectedBarangay = BARANGAYS.find(b => b.name === barangay);
    if (selectedBarangay) {
      handleInputChange('barangay', selectedBarangay.name);
      handleInputChange('zip_code', selectedBarangay.zipCode);
    }
    setBarangayMenuVisible(false);
  };

const handleNext = async () => {
  if (currentSection === 0) {
    // Validate Personal Information section before moving forward
    try {
      await personalInfoSchema.validate(formData, { abortEarly: false });
      setCurrentSection(currentSection + 1);
    } catch (err) {
      // Show alert with missing fields
      const missingFields = err.inner.map(error => error.path).join(', ');
      Alert.alert(
        'Incomplete Information',
        `Please fill in the following required fields: ${missingFields}`,
        [{ text: 'OK' }]
      );
      return;
    }
  } else if (currentSection === 1) {
    // Validate Contact Information section before moving forward
    try {
      await contactInfoSchema.validate(formData, { abortEarly: false });
      setCurrentSection(currentSection + 1);
    } catch (err) {
      // Show alert with missing fields
      const missingFields = err.inner.map(error => error.path).join(', ');
      Alert.alert(
        'Incomplete Information',
        `Please fill in the following required fields: ${missingFields}`,
        [{ text: 'OK' }]
      );
      return;
    }
  } else if (currentSection === 2) {
    // Validate Address Information section before moving forward
    try {
      await addressInfoSchema.validate(formData, { abortEarly: false });
      setCurrentSection(currentSection + 1);
    } catch (err) {
      // Show alert with missing fields
      const missingFields = err.inner.map(error => error.path).join(', ');
      Alert.alert(
        'Incomplete Information',
        `Please fill in the following required fields: ${missingFields}`,
        [{ text: 'OK' }]
      );
      return;
    }
  } else if (currentSection < 3) {
    setCurrentSection(currentSection + 1);
  }
};

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

const handleRegister = async () => {
  // Validate Account Security section before submitting
  try {
    await accountSecuritySchema.validate(formData, { abortEarly: false });
    if (onRegister) {
      onRegister(formData);
    }
  } catch (err) {
    // Validation errors will be shown in the form
    return;
  }
};

  const sections = [
    'Personal Information',
    'Contact Information', 
    'Address Information',
    'Account Security'
  ];

 const renderPersonalInfo = () => (
  <Formik
    initialValues={{
      firstname: formData.firstname,
      middlename: formData.middlename,
      lastname: formData.lastname,
      birthday: formData.birthday,
      age: formData.age,
      gender: formData.gender,
      img: formData.img,
    }}
    validationSchema={personalInfoSchema}
    validateOnChange={true}
    validateOnBlur={true}
    onSubmit={(values) => {
      // This won't be called directly, but keeps formik happy
    }}
  >
    {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setFieldTouched }) => (
      <View style={styles.sectionContainer}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Personal Information</Text>
        <Text style={styles.sectionSubtitle}>Identity & demographic info</Text>

        <View style={styles.imageContainer}>
          <TouchableOpacity 
            onPress={() => {
              pickImage();
              setFieldTouched('img', true);
            }} 
            style={styles.imagePicker}
          >
            {formData.img ? (
              <Image source={{ uri: formData.img }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        {touched.img && errors.img && (
          <Text style={styles.errorText}>{errors.img}</Text>
        )}

        <TextInput
          label="First Name *"
          value={formData.firstname}
          onChangeText={(value) => {
            handleInputChange('firstname', value);
            setFieldValue('firstname', value);
          }}
          onBlur={() => {
            handleBlur('firstname');
            setFieldTouched('firstname', true);
          }}
          mode="outlined"
          style={styles.input}
          contentStyle={styles.inputContent}
          theme={customInputTheme}
          textColor="black"
          disabled={loading}
          error={touched.firstname && errors.firstname}
        />
        {touched.firstname && errors.firstname && (
          <Text style={styles.errorText}>{errors.firstname}</Text>
        )}

        <TextInput
          label="Middle Name"
          value={formData.middlename}
          onChangeText={(value) => {
            handleInputChange('middlename', value);
            setFieldValue('middlename', value);
          }}
          onBlur={() => {
            handleBlur('middlename');
            setFieldTouched('middlename', true);
          }}
          mode="outlined"
          style={styles.input}
          contentStyle={styles.inputContent}
          theme={customInputTheme}
          textColor="black"
          disabled={loading}
        />

        <TextInput
          label="Last Name *"
          value={formData.lastname}
          onChangeText={(value) => {
            handleInputChange('lastname', value);
            setFieldValue('lastname', value);
          }}
          onBlur={() => {
            handleBlur('lastname');
            setFieldTouched('lastname', true);
          }}
          mode="outlined"
          style={styles.input}
          contentStyle={styles.inputContent}
          theme={customInputTheme}
          textColor="black"
          disabled={loading}
          error={touched.lastname && errors.lastname}
        />
        {touched.lastname && errors.lastname && (
          <Text style={styles.errorText}>{errors.lastname}</Text>
        )}

        <TextInput
          label="Birthday *"
          value={formData.birthday}
          right={
            <TextInput.Icon 
              icon="calendar" 
              onPress={() => {
                setOpen(true);
                setFieldTouched('birthday', true);
              }} 
              iconColor="black" 
            />
          }
          mode="outlined"
          style={styles.input}
          contentStyle={styles.inputContent}
          showSoftInputOnFocus={false}
          editable={false}
          placeholder='Select your birthday'
          theme={customInputTheme}
          textColor="black"
          error={touched.birthday && errors.birthday}
        />
        {touched.birthday && errors.birthday && (
          <Text style={styles.errorText}>{errors.birthday}</Text>
        )}

        <TextInput
          label="Age"
          value={formData.age}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          editable={false}
          contentStyle={styles.inputContent}
          placeholder='Auto-calculated from birthday'
          theme={customInputTheme}
          textColor="black"
          error={touched.age && errors.age}
        />
        {touched.age && errors.age && (
          <Text style={styles.errorText}>{errors.age}</Text>
        )}

        <Text style={styles.fieldLabel}>Gender *</Text>
        <View style={styles.radioContainer}>
          <View style={styles.radioOption}>
            <RadioButton
              value="male"
              status={formData.gender === 'male' ? 'checked' : 'unchecked'}
              onPress={() => {
                handleInputChange('gender', 'male');
                setFieldValue('gender', 'male');
                setFieldTouched('gender', true);
              }}
              color="#2563eb"
              disabled={loading}
            />
            <Text style={styles.radioText}>Male</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton
              value="female"
              status={formData.gender === 'female' ? 'checked' : 'unchecked'}
              onPress={() => {
                handleInputChange('gender', 'female');
                setFieldValue('gender', 'female');
                setFieldTouched('gender', true);
              }}
              color="#2563eb"
              disabled={loading}
            />
            <Text style={styles.radioText}>Female</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton
              value="other"
              status={formData.gender === 'other' ? 'checked' : 'unchecked'}
              onPress={() => {
                handleInputChange('gender', 'other');
                setFieldValue('gender', 'other');
                setFieldTouched('gender', true);
              }}
              color="#2563eb"
              disabled={loading}
            />
            <Text style={styles.radioText}>Other</Text>
          </View>
        </View>
        {touched.gender && errors.gender && (
          <Text style={styles.errorText}>{errors.gender}</Text>
        )}
      </View>
    )}
  </Formik>
);

const renderContactInfo = () => (
  <Formik
    initialValues={{
      mobile_no: formData.mobile_no,
      landline_no: formData.landline_no,
      email: formData.email,
    }}
    validationSchema={contactInfoSchema}
    validateOnChange={true}
    validateOnBlur={true}
    onSubmit={(values) => {
      // This won't be called directly, but keeps formik happy
    }}
  >
    {({ values, errors, touched, handleBlur, setFieldValue, setFieldTouched }) => (
      <View style={styles.sectionContainer}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Contact Information</Text>
        <Text style={styles.sectionSubtitle}>How to reach you</Text>

        <TextInput
          label="Mobile Number *"
          value={formData.mobile_no}
          onChangeText={(value) => {
            handleInputChange('mobile_no', value);
            setFieldValue('mobile_no', value);
          }}
          onBlur={() => {
            handleBlur('mobile_no');
            setFieldTouched('mobile_no', true);
          }}
          mode="outlined"
          style={styles.input}
          keyboardType="phone-pad"
          placeholder="+63 9XX XXX XXXX"
          contentStyle={styles.inputContent}
          theme={customInputTheme}
          textColor="black"
          disabled={loading}
          error={touched.mobile_no && errors.mobile_no}
        />
        {touched.mobile_no && errors.mobile_no && (
          <Text style={styles.errorText}>{errors.mobile_no}</Text>
        )}

        <TextInput
          label="Landline Number"
          value={formData.landline_no}
          onChangeText={(value) => {
            handleInputChange('landline_no', value);
            setFieldValue('landline_no', value);
          }}
          onBlur={() => {
            handleBlur('landline_no');
            setFieldTouched('landline_no', true);
          }}
          mode="outlined"
          style={styles.input}
          keyboardType="phone-pad"
          placeholder="(02) XXX XXXX"
          contentStyle={styles.inputContent}
          theme={customInputTheme}
          textColor="black"
          disabled={loading}
        />

        <TextInput
          label="Email Address *"
          value={formData.email}
          onChangeText={(value) => {
            handleInputChange('email', value);
            setFieldValue('email', value);
          }}
          onBlur={() => {
            handleBlur('email');
            setFieldTouched('email', true);
          }}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          contentStyle={styles.inputContent}
          theme={customInputTheme}
          textColor="black"
          disabled={loading}
          error={touched.email && errors.email}
        />
        {touched.email && errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}
      </View>
    )}
  </Formik>
);

const renderAddressInfo = () => (
  <Formik
    initialValues={{
      address: formData.address,
      barangay: formData.barangay,
      zip_code: formData.zip_code,
    }}
    validationSchema={addressInfoSchema}
    validateOnChange={true}
    validateOnBlur={true}
    onSubmit={(values) => {
      // This won't be called directly, but keeps formik happy
    }}
  >
    {({ values, errors, touched, handleBlur, setFieldValue, setFieldTouched }) => (
      <View style={styles.sectionContainer}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Address Information</Text>
        <Text style={styles.sectionSubtitle}>Location & residency info</Text>

        <TextInput
          label="Address *"
          value={formData.address}
          onChangeText={(value) => {
            handleInputChange('address', value);
            setFieldValue('address', value);
          }}
          onBlur={() => {
            handleBlur('address');
            setFieldTouched('address', true);
          }}
          mode="outlined"
          style={styles.input}
          placeholder="Street, House Number, etc."
          multiline
          numberOfLines={3}
          contentStyle={styles.inputContent}
           theme={customInputTheme}
          textColor="black"
          disabled={loading}
          error={touched.address && errors.address}
        />
        {touched.address && errors.address && (
          <Text style={styles.errorText}>{errors.address}</Text>
        )}

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
              onPressIn={() => {
                setBarangayMenuVisible(true);
                setFieldTouched('barangay', true);
              }}
              placeholder="Select Barangay"
              theme={customInputTheme}
              textColor="#000000"
              error={touched.barangay && errors.barangay}
            />
          }
          contentStyle={{ maxHeight: 400, backgroundColor: '#fff' }}
        >
          <ScrollView style={{ maxHeight: 300 }}>
            {BARANGAYS.map((brgy) => (
               <Menu.Item
                key={brgy.name}
                onPress={() => {
                  handleBarangaySelect(brgy.name);
                  setFieldValue('barangay', brgy.name);
                  setFieldValue('zip_code', brgy.zipCode);
                  setFieldTouched('barangay', true);
                  setFieldTouched('zip_code', true);
                }}
                title={`${brgy.name} (${brgy.zipCode})`}
              />
            ))}
          </ScrollView>
        </Menu>
        {touched.barangay && errors.barangay && (
          <Text style={styles.errorText}>{errors.barangay}</Text>
        )}

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
          error={touched.zip_code && errors.zip_code}
        />
        {touched.zip_code && errors.zip_code && (
          <Text style={styles.errorText}>{errors.zip_code}</Text>
        )}
      </View>
    )}
  </Formik>
);

 const renderAccountSecurity = () => (
  <Formik
    initialValues={{
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    }}
    validationSchema={accountSecuritySchema}
    validateOnChange={true}
    validateOnBlur={true}
    onSubmit={(values) => {
      // This won't be called directly, but keeps formik happy
    }}
  >
    {({ values, errors, touched, handleBlur, setFieldValue, setFieldTouched }) => (
      <View style={styles.sectionContainer}>
        <Text variant="titleLarge" style={styles.sectionTitle}>Account Security</Text>
        <Text style={styles.sectionSubtitle}>Login credentials & authentication</Text>

        <TextInput
          label="Password *"
          value={formData.password}
          onChangeText={(value) => {
            handleInputChange('password', value);
            setFieldValue('password', value);
          }}
          onBlur={() => {
            handleBlur('password');
            setFieldTouched('password', true);
          }}
          mode="outlined"
          style={styles.input}
          secureTextEntry={!showPassword}
          contentStyle={styles.inputContent}
          theme={customInputTheme}
          textColor="black"
          disabled={loading}
          error={touched.password && errors.password}
          right={
            <TextInput.Icon 
              icon={showPassword ? "eye-off" : "eye"} 
              iconColor="black"
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />
        {touched.password && errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        <TextInput
          label="Confirm Password *"
          value={formData.confirmPassword}
          onChangeText={(value) => {
            handleInputChange('confirmPassword', value);
            setFieldValue('confirmPassword', value);
              }}
          onBlur={() => {
            handleBlur('confirmPassword');
            setFieldTouched('confirmPassword', true);
          }}
          mode="outlined"
          style={styles.input}
          secureTextEntry={!showConfirmPassword}
          contentStyle={styles.inputContent}
          theme={customInputTheme}
          textColor="black"
          disabled={loading}
          error={touched.confirmPassword && errors.confirmPassword}
          right={
            <TextInput.Icon 
              icon={showConfirmPassword ? "eye-off" : "eye"} 
              iconColor="black"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          }
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}

        <Text style={styles.passwordHint}>
          Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.
        </Text>
      </View>
    )}
  </Formik>
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

        {/* Show Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
              disabled={loading}
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
              disabled={loading}
            >
              Next
            </Button>
          ) : (
            <Button
              mode="contained"
              style={styles.registerButton}
              labelStyle={styles.buttonText}
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          )}
        </View>

        {currentSection === 3 && (
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Text
              style={styles.loginLink}
              onPress={onNavigateToLogin}
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

export default RegisterComponent;