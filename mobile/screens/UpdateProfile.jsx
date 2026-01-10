import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useAuth from '../hooks/useAuth';

export default function UpdateProfile({ navigation }) {
  const { getAuthUserProfile, updateAuthUserProfile, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    mobile_no: '',
    address: '',
    barangay: '',
    img: null,
  });

  const [imageUri, setImageUri] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const result = await getAuthUserProfile();
      
      if (result.success && result.user) {
        const user = result.user;
        setFormData({
          firstname: user.firstname || '',
          lastname: user.lastname || '',
          mobile_no: user.mobile_no?.toString() || '',
          address: user.address || '',
          barangay: user.barangay || '',
          img: null,
        });
        setImageUri(user.img || null);
      }
    } catch (err) {
      console.error('Error loading user:', err);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const pickImage = async () => {
    try {
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Sorry, we need camera roll permissions to make this work!',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        const selectedImageUri = selectedImage.uri;
        
        console.log('Selected image URI:', selectedImageUri);
        setImageUri(selectedImageUri);
        
        // Prepare image object for upload
        const imageObj = {
          uri: selectedImageUri,
          type: 'image/jpeg',
          fileName: `profile_${Date.now()}.jpg`,
        };
        
        setFormData(prev => ({
          ...prev,
          img: imageObj
        }));
        
        console.log('Image set successfully');
      } else {
        console.log('Image selection cancelled or failed');
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    }

    if (formData.mobile_no && !/^09\d{9}$/.test(formData.mobile_no)) {
      newErrors.mobile_no = 'Mobile number must be in format: 09XXXXXXXXX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare update data (only send fields that have values)
      const updateData = {};
      
      if (formData.firstname.trim()) updateData.firstname = formData.firstname.trim();
      if (formData.lastname.trim()) updateData.lastname = formData.lastname.trim();
      if (formData.mobile_no.trim()) updateData.mobile_no = parseInt(formData.mobile_no);
      if (formData.address.trim()) updateData.address = formData.address.trim();
      if (formData.barangay.trim()) updateData.barangay = formData.barangay.trim();
      if (formData.img) updateData.img = formData.img;

      console.log('Submitting update data:', updateData);

      const result = await updateAuthUserProfile(updateData);

      if (result.success) {
        Alert.alert(
          'Success', 
          'Profile updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Update Profile</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Profile Picture */}
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="account" size={60} color="#64748b" />
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <MaterialCommunityIcons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.imageHint}>Tap to change profile picture</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name *</Text>
            <View style={[styles.inputContainer, errors.firstname && styles.inputError]}>
              <MaterialCommunityIcons name="account" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter first name"
                value={formData.firstname}
                onChangeText={(value) => handleInputChange('firstname', value)}
              />
            </View>
            {errors.firstname && <Text style={styles.errorText}>{errors.firstname}</Text>}
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <View style={[styles.inputContainer, errors.lastname && styles.inputError]}>
              <MaterialCommunityIcons name="account" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter last name"
                value={formData.lastname}
                onChangeText={(value) => handleInputChange('lastname', value)}
              />
            </View>
            {errors.lastname && <Text style={styles.errorText}>{errors.lastname}</Text>}
          </View>

          {/* Mobile Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={[styles.inputContainer, errors.mobile_no && styles.inputError]}>
              <MaterialCommunityIcons name="phone" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="09XXXXXXXXX"
                value={formData.mobile_no}
                onChangeText={(value) => handleInputChange('mobile_no', value)}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
            {errors.mobile_no && <Text style={styles.errorText}>{errors.mobile_no}</Text>}
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="home" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter address"
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
              />
            </View>
          </View>

          {/* Barangay */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Barangay</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter barangay"
                value={formData.barangay}
                onChangeText={(value) => handleInputChange('barangay', value)}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="check" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },

  imageSection: {
    alignItems: 'center',
    marginVertical: 30,
  },

  imageContainer: {
    position: 'relative',
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#2563eb',
  },

  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#cbd5e1',
  },

  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563eb',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },

  imageHint: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },

  form: {
    paddingHorizontal: 20,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    height: 50,
  },

  inputError: {
    borderColor: '#ef4444',
  },

  inputIcon: {
    marginRight: 12,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },

  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 4,
  },

  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    elevation: 2,
  },

  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },

  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});