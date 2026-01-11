import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MailComposer from 'expo-mail-composer';
import axios from "axios";
import BASE_URL from "../common/baseurl.js";
import BoxOverlay from "../components/BoxOverlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveImageToGallery, getGallery, isValidImage, isWithinPasig } from '../utils/inAppGallery';
import { getAddressFromCoords } from '../utils/reverseGeocode';
import * as Location from 'expo-location';


const backendURL = `${BASE_URL}/api/vendor/carts/predict`;

export default function CartDetectionScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryAddresses, setGalleryAddresses] = useState({});
  const [galleryStatuses, setGalleryStatuses] = useState({});
  const [userId, setUserId] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [textDetection, setTextDetection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(true);
  const [userRole, setUserRole] = useState("user"); 

  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    // Fetch user role and userId from AsyncStorage or backend
    const fetchUserInfo = async () => {
      const role = await AsyncStorage.getItem("user_role"); 
      setUserRole(role || "user"); 
      const uid = await AsyncStorage.getItem("user_id");
      setUserId(uid);
    };
    fetchUserInfo();
  }, []);

  // Open email client with pre-filled draft using expo-mail-composer
  const openEmailClient = async (email) => {
    if (!email) {
      alert('No email address available');
      return;
    }
    
    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      alert('Email service is not available on this device. Please install Gmail or another email app.');
      return;
    }

    try {
      await MailComposer.composeAsync({
        recipients: [email],
        subject: 'Cart Registry Inquiry',
        body: 'Hello,\n\nI would like to inquire about the cart registry.\n\nThank you.',
      });
    } catch (error) {
      console.error('Error composing email:', error);
      alert('Failed to open email composer');
    }
  };

  // Open in-app gallery modal
  const pickImage = async () => {
    if (!userId) {
      alert('User not loaded.');
      return;
    }
    const imgs = await getGallery(userId);
    setGalleryImages(imgs);
    // For each image with location, fetch address if not already fetched
    const addressMap = {};
    await Promise.all(imgs.map(async (img) => {
      if (img.location && img.location.latitude && img.location.longitude) {
        const key = `${img.location.latitude},${img.location.longitude}`;
        if (!addressMap[key]) {
          addressMap[key] = await getAddressFromCoords(img.location.latitude, img.location.longitude);
        }
      }
    }));
    setGalleryAddresses(addressMap);

    // Fetch all reports for this user from backend and map status to gallery images
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/vendor-carts/get-all`);
      const userReports = Array.isArray(res.data) ? res.data.filter(r => r.user_id === userId) : [];
      const statusMap = {};
      imgs.forEach(img => {
        const match = userReports.find(r => 
          (img.cloudUrl && r.original_image_url === img.cloudUrl) || 
          (r.created_at && Math.abs(new Date(r.created_at) - new Date(img.capturedAt)) < 60000)
        );
        statusMap[img.id] = match && match.status ? match.status : 'Not Reported';
      });
      setGalleryStatuses(statusMap);
    } catch (err) {
      setGalleryStatuses({});
    }

    setGalleryModalVisible(true);
  };

  // When user selects an image from in-app gallery
  const handleGalleryImageSelect = (img) => {
    setGalleryModalVisible(false);
    if (!isValidImage(img)) {
      alert('Image is outdated (over 36 hours old). Please capture a new one.');
      return;
    }
    setImageUri(img.uri);
    setShowScanner(false);
    setTimeout(() => sendToBackend(img.uri), 350); 
  };

  const takePhotoInsideFrame = async () => {
    if (!permission?.granted) {
      await requestPermission();
      return;
    }
    if (cameraRef.current && userId) {
      // Fetch geofencing state from backend
      let geofencingEnabled = true;
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/vendor-carts/geofencing-state`);
        geofencingEnabled = !!res.data.enabled;
      } catch (err) {
        // fallback: true
      }
      // Get current location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission is required to save image.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = loc?.coords ? { latitude: loc.coords.latitude, longitude: loc.coords.longitude } : null;
      // Only enforce Pasig geofence if enabled
      if (geofencingEnabled && !isWithinPasig(coords)) {
        alert('You must be within Pasig City to save or scan cart images.');
        return;
      }
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      // Save to in-app gallery with location
      const savedImg = await saveImageToGallery(userId, photo.uri, coords);
      // Prompt: Scan now or Save for later
      if (window.confirm('Scan cart now? (Cancel = Save for later)')) {
        setImageUri(photo.uri);
        setShowScanner(false);
        sendToBackend(photo.uri);
      } else {
        alert('Image saved to in-app gallery.');
      }
    }
  };

  const sendToBackend = async (uri) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", { uri, name: "photo.jpg", type: "image/jpeg" });

    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const userEmail = await AsyncStorage.getItem("user_email");
      formData.append("email", userEmail);

      const response = await axios.post(backendURL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 0,
      });

      const data = response.data;
      if (data && Array.isArray(data.predictions)) {
        setPredictions(data.predictions);
      } else {
        console.warn("Invalid predictions format:", data);
        setPredictions([]);
      }

      // Set text detection data
      if (data && data.text_detection) {
        setTextDetection(data.text_detection);
      } else {
        setTextDetection(null);
      }

      // Save Cloudinary URL to gallery entry for status sync
      if (data && data.original_image_url) {
        const key = `gallery_${userId}`;
        const gallery = await getGallery(userId);
        const updatedGallery = gallery.map(img =>
          img.uri === uri ? { ...img, cloudUrl: data.original_image_url } : img
        );
        await AsyncStorage.setItem(key, JSON.stringify(updatedGallery));
      }
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image. Please try again.");
      setPredictions([]);
      setTextDetection(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setPredictions([]);
    setTextDetection(null);
    setShowScanner(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="cart-outline" size={32} color="#2563eb" />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Cart Detection System</Text>
          <Text style={styles.headerSubtitle}>AI-Powered Recognition</Text>
        </View>
      </View>

      {/* In-App Gallery Modal */}
      <Modal visible={galleryModalVisible} animationType="slide" onRequestClose={() => setGalleryModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a' }}>My Reports</Text>
            <TouchableOpacity onPress={() => setGalleryModalVisible(false)}>
              <Ionicons name="close" size={28} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {galleryImages.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="images-outline" size={64} color="#cbd5e1" />
                <Text style={{ marginTop: 12, fontSize: 16, color: '#94a3b8' }}>No images found</Text>
              </View>
            )}
            {galleryImages.map(img => (
              <TouchableOpacity 
                key={img.id} 
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  marginBottom: 16,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }} 
                onPress={() => handleGalleryImageSelect(img)}
              >
                {/* Image */}
                <View style={{ position: 'relative' }}>
                  <Image source={{ uri: img.uri }} style={{ width: '100%', height: 200 }} />
                  {/* Status Badge */}
                  <View style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: galleryStatuses[img.id] === 'Resolved' ? '#10b981' : 
                                     galleryStatuses[img.id] === 'Pending' ? '#eab308' : 
                                     galleryStatuses[img.id] === 'Investigating' ? '#3b82f6' :
                                     galleryStatuses[img.id] === 'Located' ? '#8b5cf6' :
                                     '#94a3b8',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 4
                  }}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                      {galleryStatuses[img.id] || 'Not Reported'}
                    </Text>
                  </View>
                </View>

                {/* Details */}
                <View style={{ padding: 12 }}>
                  {/* Date */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="time-outline" size={16} color="#64748b" />
                    <Text style={{ marginLeft: 6, fontSize: 13, color: '#475569' }}>
                      {new Date(img.capturedAt).toLocaleString()}
                    </Text>
                  </View>
                  
                  {/* Location */}
                  {img.location && (
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <Ionicons name="location-outline" size={16} color="#64748b" style={{ marginTop: 2 }} />
                      <Text style={{ marginLeft: 6, fontSize: 13, color: '#475569', flex: 1 }}>
                        {galleryAddresses[`${img.location.latitude},${img.location.longitude}`] || 'Loading address...'}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ---------------- GCash Scanner Section ---------------- */}
        {showScanner && !isLoading && !imageUri && (
          <View style={styles.scannerWrapper}>

            {/* Scanner Box */}
            <View style={styles.scannerBox}>
              <CameraView
                ref={cameraRef}
                facing="back"
                style={styles.cameraPreview}
              />

              {/* White frame */}
              <View style={styles.frame} />

              {/* Four corner decorations */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>

            {/* Instruction */}
            <Text style={styles.scanText}>Align the cart inside the frame</Text>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
                <Ionicons name="images-outline" size={22} color="#fff" />
                <Text style={styles.buttonText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={takePhotoInsideFrame}
              >
                <Ionicons name="camera-outline" size={22} color="#2563eb" />
                <Text style={styles.secondaryButtonText}>Capture</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ---------------- Loading ---------------- */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Processing image...</Text>
          </View>
        )}

        {/* ---------------- Results Section ---------------- */}
        {imageUri && !isLoading && (
          <View style={styles.resultsSection}>
            {/* Text Detection Card - Show First */}
            {textDetection && (
              <View style={styles.textDetectionCard}>
                <View style={styles.textDetectionHeader}>
                  <Ionicons name="document-text-outline" size={24} color="#2563eb" />
                  <Text style={styles.textDetectionTitle}>Cart Information</Text>
                </View>

                {/* Cart Registry Number */}
                {textDetection.cart_registry_no ? (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabel}>
                      <Ionicons name="card-outline" size={20} color="#64748b" />
                      <Text style={styles.infoLabelText}>Registry No.</Text>
                    </View>
                    <View style={styles.registryBadge}>
                      <Text style={styles.registryText}>{textDetection.cart_registry_no}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabel}>
                      <Ionicons name="card-outline" size={20} color="#cbd5e1" />
                      <Text style={styles.infoLabelTextMissing}>Registry No.</Text>
                    </View>
                    <Text style={styles.notDetectedText}>Not detected</Text>
                  </View>
                )}

                {/* Sanitary Email */}
                {textDetection.sanitary_email ? (
                  <View style={styles.infoRowVertical}>
                    <View style={styles.infoLabel}>
                      <Ionicons name="mail-outline" size={20} color="#64748b" />
                      <Text style={styles.infoLabelText}>Contact Email</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.emailButton}
                      onPress={() => openEmailClient(textDetection.sanitary_email)}
                    >
                      <Text style={styles.emailText} numberOfLines={1} ellipsizeMode="middle">
                        {textDetection.sanitary_email}
                      </Text>
                      <Ionicons name="send-outline" size={16} color="#2563eb" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabel}>
                      <Ionicons name="mail-outline" size={20} color="#cbd5e1" />
                      <Text style={styles.infoLabelTextMissing}>Contact Email</Text>
                    </View>
                    <Text style={styles.notDetectedText}>Not detected</Text>
                  </View>
                )}

                {/* Pasig Cart Badge */}
                {textDetection.is_pasig_cart && (
                  <View style={styles.pasigBadgeContainer}>
                    <View style={styles.pasigBadge}>
                      <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                      <Text style={styles.pasigText}>Verified Pasig Cart</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Stats */}
            {predictions.length > 0 && (
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{predictions.length}</Text>
                  <Text style={styles.statLabel}>Detected</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {(
                      (predictions.reduce((sum, p) => sum + p.confidence, 0) /
                        predictions.length) *
                      100
                    ).toFixed(0)}
                    %
                  </Text>
                  <Text style={styles.statLabel}>Confidence</Text>
                </View>
              </View>
            )}

            {/* Image Preview */}
            <View style={styles.imageCard}>
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="contain"
              />
              {userRole === "admin" && (
                <BoxOverlay predictions={predictions} imageWidth={350} imageHeight={350} />
              )}
            </View>

            {/* Detection List */}
            {predictions.length > 0 && (
              <View style={styles.detailsCard}>
                <Text style={styles.sectionTitle}>Detections</Text>
                {predictions.map((pred, idx) => (
                  <View key={idx} style={styles.detailItem}>
                    <View style={styles.detailLeft}>
                      <MaterialCommunityIcons name="cart" size={24} color="#2563eb" />
                      <View>
                        <Text style={styles.cartNumber}>Cart #{idx + 1}</Text>
                        <View style={styles.classificationRow}>
                          <Text style={styles.classificationLabel}>Classification:</Text>

                          <View
                            style={[
                              styles.classificationBadge,
                              pred.class_id === 0
                                ? styles.nonStandardBadge
                                : styles.standardBadge,
                            ]}
                          >
                            <Text
                              style={[
                                styles.classificationText,
                                pred.class_id === 0
                                  ? styles.nonStandardText
                                  : styles.standardText,
                              ]}
                            >
                              {pred.class_id === 0 ? "Non-Standard" : "Standard"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.confidenceText}>
                      {(pred.confidence * 100).toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Reset */}
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.buttonText}>New Analysis</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  headerTextContainer: { marginLeft: 14 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  headerSubtitle: { fontSize: 13, color: "#64748b" },

  scrollContent: { padding: 20 },

  /* ---------------- Scanner ---------------- */
  scannerWrapper: {
    alignItems: "center",
    marginBottom: 30,
  },

  scannerBox: {
    width: 300,
    height: 400,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 16,
  },

  cameraPreview: { width: "100%", height: "100%" },

  frame: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 12,
  },

  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#fff",
    borderWidth: 3,
  },

  topLeft: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0 },

  scanText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 14,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    justifyContent: "center",
  },

  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },

  secondaryButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2563eb",
    gap: 8,
  },

  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondaryButtonText: { color: "#2563eb", fontSize: 16, fontWeight: "600" },

  /* ---------------- Loading ---------------- */
  loadingContainer: { alignItems: "center", paddingVertical: 100 },
  loadingText: { marginTop: 12, color: "#64748b" },

  /* ---------------- Text Detection Card ---------------- */
  textDetectionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  textDetectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  textDetectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginLeft: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingVertical: 8,
  },

  infoRowVertical: {
    marginBottom: 14,
    paddingVertical: 8,
  },

  infoLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  infoLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },

  infoLabelTextMissing: {
    fontSize: 14,
    fontWeight: "600",
    color: "#cbd5e1",
  },

  registryBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },

  registryText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e40af",
    letterSpacing: 1,
  },

  emailButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  emailText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
    flex: 1,
  },

  notDetectedText: {
    fontSize: 13,
    color: "#94a3b8",
    fontStyle: "italic",
  },

  pasigBadgeContainer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },

  pasigBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },

  pasigText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#047857",
  },

  /* ---------------- Results ---------------- */
  resultsSection: { gap: 20 },

  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  statValue: { fontSize: 32, fontWeight: "700", color: "#2563eb" },
  statLabel: { color: "#64748b" },

  imageCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderColor: "#e2e8f0",
    borderWidth: 1,
  },

  image: { width: "100%", height: 350, borderRadius: 10 },

  detailsCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 14 },

  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    padding: 16,
    marginBottom: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },

  detailLeft: { flexDirection: "row", gap: 12 },

  cartNumber: { fontSize: 16, fontWeight: "700" },

  classificationRow: { flexDirection: "row", gap: 8 },

  classificationLabel: { color: "#64748b" },

  classificationBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },

  standardBadge: { backgroundColor: "#dcfce7" },
  nonStandardBadge: { backgroundColor: "#fef3c7" },

  classificationText: { fontSize: 13, fontWeight: "700" },

  standardText: { color: "#15803d" },
  nonStandardText: { color: "#a16207" },

  confidenceText: { fontWeight: "700", color: "#10b981" },

  resetButton: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    gap: 8,
  },
});