/** FULL CART DETECTION SCREEN WITH GCASH SCANNER **/
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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import axios from "axios";
import BASE_URL from "../common/baseurl.js";
import BoxOverlay from "../components/BoxOverlay";
import AsyncStorage from "@react-native-async-storage/async-storage";

const backendURL = `${BASE_URL}/api/vendor/carts/predict`;

export default function CartDetectionScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(true);
  const [userRole, setUserRole] = useState("user"); 

  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    // Fetch user role from AsyncStorage or backend
    const fetchUserRole = async () => {
      const role = await AsyncStorage.getItem("user_role"); 
      setUserRole(role || "user"); 
    };
    fetchUserRole();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setShowScanner(false);
      sendToBackend(uri);
    }
  };

  const takePhotoInsideFrame = async () => {
    if (!permission?.granted) {
      await requestPermission();
      return;
    }
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      setImageUri(photo.uri);
      setShowScanner(false);
      sendToBackend(photo.uri);
    }
  };

  const sendToBackend = async (uri) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", { uri, name: "photo.jpg", type: "image/jpeg" });

    try {
      const accessToken = await AsyncStorage.getItem("access_token"); // Retrieve token from storage
      const userEmail = await AsyncStorage.getItem("user_email"); // Retrieve email from storage
      formData.append("email", userEmail); // Add the email field

      const response = await axios.post(backendURL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`, // Add Authorization header
        },
        timeout: 0,
      });

      // Validate and handle predictions
      const data = response.data;
      if (data && Array.isArray(data.predictions)) {
        setPredictions(data.predictions);
      } else {
        console.warn("Invalid predictions format:", data);
        setPredictions([]); // Default to an empty array
      }
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image. Please try again.");
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setPredictions([]);
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
