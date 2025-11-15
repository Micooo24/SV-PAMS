import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image
} from 'react-native';
import { IconButton, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useGlobalFonts } from '../hooks/font';
import BASE_URL from '../common/baseurl.js';

const DocSubmission = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  if (!fontsLoaded) return null;

  // Pick image from gallery
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need gallery permissions to select images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const fileType = uri.split('.').pop();
        const mimeType = fileType === 'png' ? 'image/png' : 'image/jpeg';
        
        setSelectedFile({
          uri,
          name: `image_${Date.now()}.${fileType}`,
          type: mimeType,
        });
        setSubmissionResult(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  // Submit with AXIOS
  const submitDocument = async () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select an image first');
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

      // Create FormData
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      });
      formData.append('base_document_id', '6912137e097441c95d48e7b8');
      formData.append('notes', 'Submitted via mobile app');

      console.log('📤 Uploading with axios...');
      console.log('File:', selectedFile.name);
      console.log('URI:', selectedFile.uri);

      // AXIOS POST REQUEST
      const response = await axios.post(
        `${BASE_URL}/api/users/document-submissions/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Response:', response.data);

      // Check for 'submission' in response
      if (response.data.submission) {
        setSubmissionResult(response.data.submission);
        Alert.alert(
          'Success',
          `Document submitted successfully!\nStatus: ${response.data.submission.status}`
        );
      } else {
        Alert.alert('Error', response.data.error || 'Failed to submit document');
      }

    } catch (error) {
      console.error('❌ Submission error:', error);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        Alert.alert(
          'Server Error',
          error.response.data.detail || error.response.data.error || 'Upload failed'
        );
      } else if (error.request) {
        console.error('No response received:', error.request);
        Alert.alert(
          'Network Error',
          'Could not reach the server. Please check your connection.'
        );
      } else {
        console.error('Error:', error.message);
        Alert.alert('Error', error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      approved: { color: '#10b981', icon: 'check-circle', text: 'Approved' },
      needs_review: { color: '#f59e0b', icon: 'alert-circle', text: 'Needs Review' },
      rejected: { color: '#ef4444', icon: 'close-circle', text: 'Rejected' },
    };
    return statusMap[status] || { color: '#6b7280', icon: 'help-circle', text: 'Unknown' };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>SV</Text>
          </View>
          <Text style={styles.title}>Document Comparison</Text>
          <Text style={styles.subtitle}>Upload and compare documents with AI</Text>
        </View>

        {/* Document Submission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Document</Text>
          
          <TouchableOpacity onPress={pickImage} style={styles.uploadButton} disabled={uploading}>
            <IconButton icon="image" iconColor="#2563eb" size={32} />
            <Text style={styles.uploadButtonText}>
              {selectedFile ? 'Change Image' : 'Select Image'}
            </Text>
          </TouchableOpacity>

          {selectedFile && (
            <View style={styles.fileCard}>
              <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
              <View style={styles.fileInfo}>
                <Text style={styles.fileLabel}>Selected Image:</Text>
                <Text style={styles.fileName}>{selectedFile.name}</Text>
              </View>
              <IconButton icon="close" iconColor="#ef4444" size={20} onPress={() => {
                setSelectedFile(null);
                setSubmissionResult(null);
              }} />
            </View>
          )}

          {selectedFile && !submissionResult && (
            <Button mode="contained" style={styles.submitButton} onPress={submitDocument} disabled={uploading}>
              {uploading ? 'Submitting...' : 'Submit Document'}
            </Button>
          )}

          {uploading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Analyzing document with AI...</Text>
            </View>
          )}

          {submissionResult && !uploading && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <IconButton 
                  icon={getStatusDisplay(submissionResult.status).icon}
                  iconColor={getStatusDisplay(submissionResult.status).color}
                  size={32}
                />
                <Text style={[styles.statusText, { color: getStatusDisplay(submissionResult.status).color }]}>
                  {getStatusDisplay(submissionResult.status).text}
                </Text>
              </View>

              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Overall Similarity</Text>
                <Text style={[styles.scoreValue, { color: getStatusDisplay(submissionResult.status).color }]}>
                  {submissionResult.similarity_percentage}%
                </Text>
              </View>

              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Comparison Details</Text>
                
                {['text_similarity', 'label_similarity', 'object_similarity'].map((key) => (
                  <View key={key} style={styles.detailRow}>
                    <Text style={styles.detailText}>
                      {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                    <Text style={styles.detailValue}>
                      {submissionResult.comparison_details[key]}%
                    </Text>
                  </View>
                ))}
              </View>

              <Button mode="text" style={styles.resetButton} onPress={() => {
                setSelectedFile(null);
                setSubmissionResult(null);
              }}>
                Submit Another Document
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoText: { fontSize: 32, fontFamily: 'Poppins-Bold', color: '#fff' },
  title: { fontSize: 36, fontFamily: 'Poppins-Bold', color: '#1e293b', marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#64748b', textAlign: 'center' },
  section: { paddingHorizontal: 24, paddingTop: 32 },
  sectionTitle: { fontSize: 22, fontFamily: 'Poppins-Bold', color: '#1e293b', marginBottom: 16 },
  uploadButton: { borderWidth: 2, borderColor: '#2563eb', borderRadius: 12, borderStyle: 'dashed', paddingVertical: 32, alignItems: 'center', backgroundColor: '#f8fafc' },
  uploadButtonText: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#2563eb', marginTop: 8 },
  fileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 12, marginTop: 16 },
  previewImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  fileInfo: { flex: 1 },
  fileLabel: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#64748b' },
  fileName: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#1e293b' },
  submitButton: { backgroundColor: '#2563eb', borderRadius: 12, marginTop: 16 },
  loadingContainer: { alignItems: 'center', paddingVertical: 32 },
  loadingText: { marginTop: 16, fontSize: 14, fontFamily: 'Poppins-Regular', color: '#64748b' },
  resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  statusText: { fontSize: 20, fontFamily: 'Poppins-Bold', marginLeft: 8 },
  scoreContainer: { alignItems: 'center', paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e2e8f0' },
  scoreLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#64748b', marginBottom: 8 },
  scoreValue: { fontSize: 48, fontFamily: 'Poppins-Bold' },
  detailsContainer: { paddingTop: 20 },
  detailsTitle: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#1e293b', marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  detailText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#64748b' },
  detailValue: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#1e293b' },
  resetButton: { marginTop: 16 },
});

export default DocSubmission;