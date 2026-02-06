import React, { useState, useEffect } from 'react';
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
  Image,
  RefreshControl,
  FlatList
} from 'react-native';
import { IconButton, Button, Card, Menu, Divider, Chip } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useGlobalFonts } from '../hooks/font';
import BASE_URL from '../common/baseurl.js';
import {styles} from '../styles/docSubmission';

// Utility Functions
import { formatDate, formatFileSize } from '../utils/formatters';

// Helper Functions
import { getStatusDisplay } from '../utils/submissionHelpers';
import { getFileIcon } from '../utils/fileHelpers';

const DocSubmission = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [baseDocuments, setBaseDocuments] = useState([]);
  const [selectedBaseDocument, setSelectedBaseDocument] = useState(null);
  const [loadingBaseDocuments, setLoadingBaseDocuments] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    fetchSubmissions();
    fetchBaseDocuments();
  }, []);

  const fetchBaseDocuments = async () => {
    try {
      setLoadingBaseDocuments(true);
      const response = await axios.get(`${BASE_URL}/api/admin/base-documents/active`);
      
      if (response.data.active_documents) {
        const activePermitDocuments = response.data.active_documents.filter(
          doc => doc.category === 'permits'
        );
        setBaseDocuments(activePermitDocuments);
        
        if (activePermitDocuments.length > 0) {
          setSelectedBaseDocument(activePermitDocuments[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching base documents:', error);
      Alert.alert('Error', 'Failed to load permit templates');
    } finally {
      setLoadingBaseDocuments(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        console.log('No token found');  
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/api/users/document-submissions/my-uploads`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoadingSubmissions(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubmissions();
  };

  if (!fontsLoaded) return null;

  const pickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'image/*',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled) {
        console.log('User cancelled document picker');
        return;
      }

      const validFiles = [];
      const invalidFiles = [];

      for (const file of result.assets) {
        if (file.size > 10 * 1024 * 1024) {
          invalidFiles.push(file.name);
        } else {
          validFiles.push({
            uri: file.uri,
            name: file.name,
            type: file.mimeType,
            size: file.size,
          });
        }
      }

      if (invalidFiles.length > 0) {
        Alert.alert(
          'Files Too Large', 
          `The following files exceed 10MB:\n${invalidFiles.join('\n')}`
        );
      }

      if (validFiles.length > 0) {
        setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
        setSubmissionResult(null);
      }

    } catch (error) {
      console.error('DocumentPicker Error:', error);
      Alert.alert('Error', 'Failed to pick documents: ' + error.message);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const submitDocuments = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files Selected', 'Please select at least one document');
      return;
    }

    if (!selectedBaseDocument) {
      Alert.alert('No Template Selected', 'Please select a document template first');
      return;
    }

    try {
      setUploading(true);

      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Authentication Required', 'Please login first');
        navigation.navigate('Login');
        return;
      }

      const formData = new FormData();
      
      selectedFiles.forEach((file) => {
        formData.append('files', {
          uri: file.uri,
          type: file.type,
          name: file.name,
        });
      });

      formData.append('base_document_id', selectedBaseDocument._id);
      formData.append('notes', 'Submitted via mobile app');

      console.log('Uploading documents...', {
        fileCount: selectedFiles.length,
        files: selectedFiles.map(f => ({ name: f.name, size: f.size })),
        baseDocumentId: selectedBaseDocument._id,
        baseDocumentTitle: selectedBaseDocument.title
      });

      const response = await axios.post(
        `${BASE_URL}/api/users/document-submissions/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000,
        }
      );

      console.log('Response:', response.data);

      if (response.data.submission) {
        setSubmissionResult(response.data.submission);
        fetchSubmissions();
        
        // Updated success message to show AI prediction
        const confidenceScore = (response.data.submission.ai_confidence_score * 100).toFixed(1);
        const predictionLabel = response.data.submission.ai_prediction_label === 1 ? 'Valid' : 'Invalid';
        
        Alert.alert(
          'Success',
          `${selectedFiles.length} document(s) submitted successfully!\nStatus: ${response.data.submission.status}\nAI Prediction: ${predictionLabel} (${confidenceScore}%)`
        );
        setSelectedFiles([]);
      } else {
        Alert.alert('Error', response.data.error || 'Failed to submit documents');
      }

    } catch (error) {
      console.error('Submission error:', error);
      
      if (error.response) {
        Alert.alert(
          'Server Error',
          error.response.data.detail || error.response.data.error || 'Upload failed'
        );
      } else if (error.request) {
        Alert.alert(
          'Network Error',
          'Could not reach the server. Please check your connection.'
        );
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setUploading(false);
    }
  };



  const renderFileItem = ({ item, index }) => {
    const isImage = item.type?.includes('image');

    return (
      <View style={styles.fileCard}>
        {isImage ? (
          <Image source={{ uri: item.uri }} style={styles.previewImage} />
        ) : (
          <View style={styles.fileIconContainer}>
            <IconButton 
              icon={getFileIcon(item.type)} 
              iconColor="#2563eb" 
              size={32} 
            />
          </View>
        )}
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
        </View>
        <IconButton 
          icon="close" 
          iconColor="#ef4444" 
          size={20} 
          onPress={() => removeFile(index)} 
        />
      </View>
    );
  };

  const renderFilesPreview = () => {
    if (selectedFiles.length === 0) return null;

    return (
      <View style={styles.filesContainer}>
        <View style={styles.filesHeader}>
          <Text style={styles.filesHeaderText}>
            Selected Files ({selectedFiles.length})
          </Text>
          <TouchableOpacity onPress={() => setSelectedFiles([])}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={selectedFiles}
          renderItem={renderFileItem}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>SV</Text>
          </View>
          <Text style={styles.title}>Submit Documents</Text>
          <Text style={styles.subtitle}>Upload multiple documents and track your application status</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Documents</Text>
          
          <View style={styles.templateSection}>
            <Text style={styles.templateLabel}>Document Template:</Text>
            {loadingBaseDocuments ? (
              <View style={styles.loadingTemplate}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.loadingTemplateText}>Loading templates...</Text>
              </View>
            ) : (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity 
                    style={styles.templateSelector}
                    onPress={() => setMenuVisible(true)}
                    disabled={baseDocuments.length === 0}
                  >
                    <View style={styles.templateSelectorContent}>
                      <Text style={styles.templateSelectorText}>
                        {selectedBaseDocument ? selectedBaseDocument.title : 'Select Template'}
                      </Text>
                      <IconButton icon="chevron-down" iconColor="#64748b" size={20} />
                    </View>
                  </TouchableOpacity>
                }
              >
                {baseDocuments.map((doc) => (
                  <Menu.Item
                    key={doc._id}
                    onPress={() => {
                      setSelectedBaseDocument(doc);
                      setMenuVisible(false);
                    }}
                    title={doc.title}
                  />
                ))}
              </Menu>
            )}
          </View>
          
          <TouchableOpacity onPress={pickDocuments} style={styles.uploadButton} disabled={uploading}>
            <IconButton icon="file-upload" iconColor="#2563eb" size={32} />
            <Text style={styles.uploadButtonText}>
              {selectedFiles.length > 0 ? 'Add More Documents' : 'Select Documents'}
            </Text>
            <Text style={styles.uploadHelpText}>
              Supports: Images, PDF, Word documents (Max 10MB each)
            </Text>
          </TouchableOpacity>

          {renderFilesPreview()}

          {selectedFiles.length > 0 && !submissionResult && selectedBaseDocument && (
            <Button 
              mode="contained" 
              style={styles.submitButton} 
              onPress={submitDocuments} 
              disabled={uploading}
            >
              {uploading ? 'Submitting...' : `Submit ${selectedFiles.length} Document(s)`}
            </Button>
          )}

          {uploading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Uploading {selectedFiles.length} document(s)...</Text>
              <Text style={styles.loadingSubtext}>This may take a moment</Text>
            </View>
          )}

          {/* ✅ FIX: Updated result display to use AI confidence score */}
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
                <Text style={styles.scoreLabel}>AI Confidence Score</Text>
                <Text style={[styles.scoreValue, { 
                  color: submissionResult.ai_prediction_label === 1 ? '#10b981' : '#ef4444' 
                }]}>
                  {((submissionResult.ai_confidence_score || 0) * 100).toFixed(1)}%
                </Text>
                <Text style={styles.predictionLabel}>
                  Prediction: {submissionResult.ai_prediction_label === 1 ? 'Valid Document' : 'Invalid Document'}
                </Text>
              </View>

              <Button mode="text" style={styles.resetButton} onPress={() => {
                setSelectedFiles([]);
                setSubmissionResult(null);
              }}>
                Submit More Documents
              </Button>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.statusHeader}>
            <Text style={styles.sectionTitle}>My Submissions</Text>
            <TouchableOpacity onPress={fetchSubmissions}>
              <IconButton icon="refresh" iconColor="#2563eb" size={24} />
            </TouchableOpacity>
          </View>

          {loadingSubmissions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading submissions...</Text>
            </View>
          ) : submissions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <IconButton icon="file-document-outline" iconColor="#94a3b8" size={48} />
                <Text style={styles.emptyText}>No submissions yet</Text>
                <Text style={styles.emptySubtext}>Upload documents to get started</Text>
              </Card.Content>
            </Card>
          ) : (
            submissions.map((sub) => {
              const statusDisplay = getStatusDisplay(sub.status);
              const displayFilename = Array.isArray(sub.filename) 
                ? `${sub.filename.length} file(s)` 
                : sub.filename;
              
              // ✅ FIX: Use AI confidence score instead of similarity_percentage
              const confidenceScore = ((sub.ai_confidence_score || 0) * 100).toFixed(1);
              const predictionLabel = sub.ai_prediction_label === 1 ? 'Valid' : 'Invalid';
              
              return (
                <Card key={sub._id} style={styles.submissionCard}>
                  <Card.Content>
                    <View style={styles.submissionHeader}>
                      <View style={styles.submissionTitleRow}>
                        <IconButton icon={statusDisplay.icon} iconColor={statusDisplay.color} size={24} />
                        <View style={styles.submissionInfo}>
                          <Text style={styles.submissionTitle}>{displayFilename}</Text>
                          <Text style={styles.submissionDate}>{formatDate(sub.submitted_at)}</Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusDisplay.color + '20' }]}>
                        <Text style={[styles.statusBadgeText, { color: statusDisplay.color }]}>
                          {statusDisplay.text}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.submissionDetails}>
                      <View style={styles.submissionDetailRow}>
                        <Text style={styles.submissionDetailLabel}>AI Score:</Text>
                        <Text style={[styles.submissionDetailValue, { 
                          color: sub.ai_prediction_label === 1 ? '#10b981' : '#ef4444' 
                        }]}>
                          {confidenceScore}% ({predictionLabel})
                        </Text>
                      </View>
                      <View style={styles.submissionDetailRow}>
                        <Text style={styles.submissionDetailLabel}>Document:</Text>
                        <Text style={styles.submissionDetailValue}>{sub.base_document_title}</Text>
                      </View>
                      
                      {/* ✅ NEW: Show reviewed info if available */}
                      {sub.reviewed_at && (
                        <>
                          <View style={styles.submissionDetailRow}>
                            <Text style={styles.submissionDetailLabel}>Reviewed:</Text>
                            <Text style={styles.submissionDetailValue}>{formatDate(sub.reviewed_at)}</Text>
                          </View>
                          {sub.reviewed_by && (
                            <View style={styles.submissionDetailRow}>
                              <Text style={styles.submissionDetailLabel}>Reviewed By:</Text>
                              <Text style={styles.submissionDetailValue}>{sub.reviewed_by}</Text>
                            </View>
                          )}
                          {sub.admin_notes && (
                            <View style={styles.adminNotesContainer}>
                              <Text style={styles.adminNotesLabel}>Admin Notes:</Text>
                              <Text style={styles.adminNotesText}>{sub.admin_notes}</Text>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


export default DocSubmission;