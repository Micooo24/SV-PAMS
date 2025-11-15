import React, { useState } from "react";
import { View, Button, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import BASE_URL from "../common/baseurl.js";

const backendURL = `${BASE_URL}/api/vendor/carts/predict`;

export default function ImageUploader({ onResult }) {
  const [imageUri, setImageUri] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) return;
    const uri = result.assets[0].uri;
    setImageUri(uri);
    sendToBackend(uri);
  };

  const sendToBackend = async (uri) => {
    const formData = new FormData();
    formData.append("file", { uri, name: "photo.jpg", type: "image/jpeg" });

    try {
      const response = await axios.post(backendURL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 600000, // Increased timeout to 10 minutes
      });

      const data = response.data;
      onResult && onResult(uri, data.predictions);
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        Alert.alert("Error", "Request timed out");
      } else {
        console.error(error);
        Alert.alert("Error", "Failed to connect to backend");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick Image" onPress={pickImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
