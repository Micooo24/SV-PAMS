import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { IconButton, Button } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; // ⭐ Add this import
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; 
import { useGlobalFonts } from '../hooks/font';
import BASE_URL from '../common/baseurl.js';

const { width } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  
  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  if (!fontsLoaded) {
    return null;
  }

  // Pick document or image
  const pickDocument = async () => {
    try {
      Alert.alert(
        'Select File Type',
        'Choose how you want to upload your document',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
              
              if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Camera permission is required');
                return;
              }

              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setSelectedFile({
                  uri: asset.uri,
                  name: `photo_${Date.now()}.jpg`,
                  type: 'image/jpeg',
                });
                setSubmissionResult(null);
                console.log('Photo captured:', asset.uri);
              }
            },
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
              
              if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Gallery permission is required');
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                
                let mimeType = 'image/jpeg';
                if (asset.uri.toLowerCase().endsWith('.png')) {
                  mimeType = 'image/png';
                } else if (asset.uri.toLowerCase().endsWith('.jpg') || asset.uri.toLowerCase().endsWith('.jpeg')) {
                  mimeType = 'image/jpeg';
                }

                setSelectedFile({
                  uri: asset.uri,
                  name: asset.fileName || `image_${Date.now()}.jpg`,
                  type: mimeType,
                });
                setSubmissionResult(null);
                console.log('Image selected:', {
                  uri: asset.uri,
                  name: asset.fileName,
                  type: mimeType,
                });
              }
            },
          },
          {
            text: 'Pick Document',
            onPress: async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
              });

              if (!result.canceled && result.assets && result.assets[0]) {
                const doc = result.assets[0];
                setSelectedFile({
                  uri: doc.uri,
                  name: doc.name,
                  type: doc.mimeType || 'application/pdf',
                });
                setSubmissionResult(null);
                console.log('Document selected:', {
                  uri: doc.uri,
                  name: doc.name,
                  type: doc.mimeType,
                });
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document: ' + error.message);
    }
  };

  // ⭐ NEW: Submit document using FileSystem
  const submitDocument = async () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select a document first');
      return;
    }

    try {
      setUploading(true);

      // Get token from storage
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        Alert.alert('Authentication Required', 'Please login first');
        navigation.navigate('Login');
        return;
      }

      const baseDocumentId = '6912137e097441c95d48e7b8';

      console.log('Starting file upload...');
      console.log('File info:', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.type,
      });

      //  Use FileSystem to upload the file
      const uploadResult = await FileSystem.uploadAsync(
        `${BASE_URL}/api/users/document-submissions/upload`,
        selectedFile.uri,
        {
          fieldName: 'file',
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          parameters: {
            base_document_id: baseDocumentId,
            notes: 'Submitted via mobile app',
          },
        }
      );

      console.log('Upload result:', uploadResult);

      if (uploadResult.status === 200) {
        const responseData = JSON.parse(uploadResult.body);
        console.log('Response data:', responseData);

        if (responseData.success) {
          setSubmissionResult(responseData.submission);
          Alert.alert(
            'Success',
            `Document submitted successfully!\nStatus: ${responseData.submission.status}`
          );
        } else {
          Alert.alert('Error', responseData.error || 'Failed to submit document');
        }
      } else {
        const errorData = JSON.parse(uploadResult.body);
        Alert.alert('Server Error', errorData.detail || errorData.error || 'Upload failed');
      }

    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Upload Failed',
        `Could not upload file.\n\nError: ${error.message}\n\nPlease check:\n1. Server is running\n2. Network connection\n3. File permissions`
      );
    } finally {
      setUploading(false);
    }
  };

  // Get status color and icon
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'approved':
        return { color: '#10b981', icon: 'check-circle', text: 'Approved' };
      case 'needs_review':
        return { color: '#f59e0b', icon: 'alert-circle', text: 'Needs Review' };
      case 'rejected':
        return { color: '#ef4444', icon: 'close-circle', text: 'Rejected' };
      default:
        return { color: '#6b7280', icon: 'help-circle', text: 'Unknown' };
    }
  };

  const features = [
    {
      icon: 'file-document-edit',
      title: 'Vendor Permit Application',
      description: 'Streamlined permit application and management system for vendors',
      color: '#3b82f6',
    },
    {
      icon: 'robot',
      title: 'AI-Powered Monitoring',
      description: 'Intelligent monitoring system for vendor compliance and violations',
      color: '#2563eb',
    },
    {
      icon: 'monitor-dashboard',
      title: 'Web Dashboard',
      description: 'Comprehensive admin dashboard for complete system oversight',
      color: '#1d4ed8',
    },
    {
      icon: 'cellphone',
      title: 'Mobile Monitoring',
      description: 'Real-time on-the-ground monitoring via mobile application',
      color: '#1e40af',
    },
    {
      icon: 'shield-lock',
      title: 'Secure Access Control',
      description: 'Role-based authentication with advanced security protocols',
      color: '#1e3a8a',
    },
    {
      icon: 'sync',
      title: 'Real-Time Sync',
      description: 'Seamless synchronization across web, mobile, and backend',
      color: '#172554',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>SV</Text>
            </View>
          </View>
          <Text style={styles.title}>SV: PAMS</Text>
          <Text style={styles.subtitle}>
            Street Vendor: Permit and Monitoring System
          </Text>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to the Future</Text>
          <Text style={styles.welcomeSubtitle}>
            Revolutionizing street vendor management through technology
          </Text>
        </View>

        {/* Document Submission Section */}
        <View style={styles.submissionSection}>
          <Text style={styles.sectionTitle}>Document Submission</Text>
          
          {/* Upload Button */}
          <Button
            mode="outlined"
            style={styles.uploadButton}
            labelStyle={styles.uploadButtonText}
            icon="cloud-upload"
            onPress={pickDocument}
            disabled={uploading}
          >
            {selectedFile ? 'Change Document' : 'Upload Document'}
          </Button>

          {/* Selected File Display */}
          {selectedFile && (
            <View style={styles.fileCard}>
              <IconButton
                icon="file-document"
                iconColor="#2563eb"
                size={24}
              />
              <View style={styles.fileInfo}>
                <Text style={styles.fileLabel}>Selected File:</Text>
                <Text style={styles.fileName} numberOfLines={1}>
                  {selectedFile.name}
                </Text>
              </View>
              <IconButton
                icon="close"
                iconColor="#ef4444"
                size={20}
                onPress={() => {
                  setSelectedFile(null);
                  setSubmissionResult(null);
                }}
              />
            </View>
          )}

          {/* Submit Button */}
          {selectedFile && !submissionResult && (
            <Button
              mode="contained"
              style={styles.submitButton}
              labelStyle={styles.submitButtonText}
              icon={uploading ? undefined : 'send'}
              onPress={submitDocument}
              disabled={uploading}
            >
              {uploading ? 'Submitting...' : 'Submit Document'}
            </Button>
          )}

          {/* Loading Indicator */}
          {uploading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>
                Analyzing document with AI...
              </Text>
            </View>
          )}

          {/* Submission Result */}
          {submissionResult && !uploading && (
            <View style={styles.resultCard}>
              {/* Status Badge */}
              <View style={styles.resultHeader}>
                <IconButton
                  icon={getStatusDisplay(submissionResult.status).icon}
                  iconColor={getStatusDisplay(submissionResult.status).color}
                  size={32}
                />
                <Text style={[
                  styles.statusText,
                  { color: getStatusDisplay(submissionResult.status).color }
                ]}>
                  {getStatusDisplay(submissionResult.status).text}
                </Text>
              </View>

              {/* Similarity Score */}
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Overall Similarity</Text>
                <Text style={[
                  styles.scoreValue,
                  { color: getStatusDisplay(submissionResult.status).color }
                ]}>
                  {submissionResult.similarity_percentage}%
                </Text>
              </View>

              {/* Comparison Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Comparison Details</Text>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <IconButton icon="text" size={20} iconColor="#64748b" />
                    <Text style={styles.detailText}>Text Similarity</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {submissionResult.comparison_details.text_similarity}%
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <IconButton icon="label" size={20} iconColor="#64748b" />
                    <Text style={styles.detailText}>Label Similarity</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {submissionResult.comparison_details.label_similarity}%
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <IconButton icon="shape" size={20} iconColor="#64748b" />
                    <Text style={styles.detailText}>Object Similarity</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {submissionResult.comparison_details.object_similarity}%
                  </Text>
                </View>
              </View>

              {/* Submission Info */}
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Submitted: {new Date(submissionResult.submitted_at).toLocaleString()}
                </Text>
              </View>

              {/* Reset Button */}
              <Button
                mode="text"
                style={styles.resetButton}
                labelStyle={styles.resetButtonText}
                onPress={() => {
                  setSelectedFile(null);
                  setSubmissionResult(null);
                }}
              >
                Submit Another Document
              </Button>
            </View>
          )}
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          
          {features.map((feature, index) => (
            <View 
              key={index} 
              style={[
                styles.featureCard,
                index === features.length - 1 && styles.lastFeatureCard
              ]}
            >
              <View style={styles.featureContent}>
                <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
                  <IconButton
                    icon={feature.icon}
                    iconColor="#fff"
                    size={28}
                  />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Empowering communities through smart governance
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ...existing styles...
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // Header Styles
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  title: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 280,
  },

  // Welcome Section
  welcomeSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#f8fafc',
    marginTop: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Document Submission Section
  submissionSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  uploadButton: {
    borderColor: '#2563eb',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#2563eb',
  },

  // File Card
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 8,
  },
  fileLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
  },
  fileName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1e293b',
    marginTop: 2,
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 8,
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
  },

  // Result Card
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    marginLeft: 8,
  },

  // Score Container
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontFamily: 'Poppins-Bold',
  },

  // Details Container
  detailsContainer: {
    paddingTop: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
  },

  // Info Container
  infoContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#94a3b8',
    textAlign: 'center',
  },

  // Reset Button
  resetButton: {
    marginTop: 16,
  },
  resetButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#2563eb',
  },

  // Features Section
  featuresSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lastFeatureCard: {
    marginBottom: 0,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
    paddingTop: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    lineHeight: 20,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#94a3b8',
  },
});

export default Home;