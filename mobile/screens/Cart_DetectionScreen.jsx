import React, { useState } from "react";
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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import BASE_URL from "../common/baseurl.js";
import BoxOverlay from "../components/BoxOverlay";

const backendURL = `${BASE_URL}/api/vendor/carts/predict`;

export default function CartDetectionScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      sendToBackend(uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("Camera permission is required!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      sendToBackend(uri);
    }
  };

  const sendToBackend = async (uri) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", { uri, name: "photo.jpg", type: "image/jpeg" });

    try {
      const response = await axios.post(backendURL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 0
      });
      setPredictions(response.data.predictions || []);
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
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="cart-outline" size={32} color="#2563eb" />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Cart Detection System</Text>
          <Text style={styles.headerSubtitle}>AI-Powered Recognition</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!imageUri && !isLoading && (
          <View style={styles.uploadSection}>
            <MaterialCommunityIcons name="cloud-upload" size={80} color="#cbd5e1" />
            <Text style={styles.uploadTitle}>Upload Image</Text>
            <Text style={styles.uploadSubtitle}>
              Choose from gallery or capture a new photo
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
                <Ionicons name="images-outline" size={22} color="#fff" />
                <Text style={styles.buttonText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={22} color="#2563eb" />
                <Text style={styles.secondaryButtonText}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Processing image...</Text>
          </View>
        )}

        {imageUri && !isLoading && (
          <View style={styles.resultsSection}>
            {/* Summary Stats */}
            {predictions.length > 0 && (
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{predictions.length}</Text>
                  <Text style={styles.statLabel}>Detected</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {((predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length) * 100).toFixed(0)}%
                  </Text>
                  <Text style={styles.statLabel}>Confidence</Text>
                </View>
              </View>
            )}

            {/* Image Preview */}
            <View style={styles.imageCard}>
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
              <BoxOverlay predictions={predictions} imageWidth={350} imageHeight={350} />
            </View>

            {/* Detection List */}
            {predictions.length > 0 && (
              <View style={styles.detailsCard}>
                <Text style={styles.sectionTitle}>Detections ({predictions.length})</Text>
                {predictions.map((pred, idx) => (
                  <View key={idx} style={styles.detailItem}>
                    <View style={styles.detailLeft}>
                      <MaterialCommunityIcons name="cart" size={20} color="#2563eb" />
                      <Text style={styles.detailText}>Cart #{idx + 1}</Text>
                    </View>
                    <Text style={styles.confidenceText}>
                      {(pred.confidence * 100).toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTextContainer: {
    marginLeft: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  uploadSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  uploadTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 24,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    minWidth: 140,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2563eb",
    gap: 8,
    minWidth: 140,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  resultsSection: {
    gap: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  imageCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 350,
    borderRadius: 10,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 14,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  confidenceText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#10b981",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
});
