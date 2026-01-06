import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import firestore from '@react-native-firebase/firestore';
// This screen allows the vendor to share their live location to Firestore (not Realtime DB),
// and manages the 'active' status for real-time tracking by customers.

export default function VendorLocationScreen({ navigation }) {
  // Vendor's current location
  const [location, setLocationState] = useState(null);
  // Is live location sharing active?
  const [trackingActive, setTrackingActive] = useState(false);
  // Map region state
  const [mapRegion, setMapRegion] = useState({
    latitude: 14.5650, // Default to Pasig
    longitude: 121.0850,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  // Reference to watcher for cleanup
  const watcherRef = useRef(null);
  // TODO: Replace with real vendorId from auth/session
  const vendorId = 'vendor_001';

  // Toggle vendor live location sharing
  const toggleTracking = async () => {
    if (trackingActive) {
      setTrackingActive(false);
      // Set vendor as inactive in Firestore
      await firestore().collection('vendors').doc(vendorId).update({
        active: false,
        updated_at: new Date().toISOString(),
      });
      if (watcherRef.current) {
        watcherRef.current.remove();
        watcherRef.current = null;
      }
      Alert.alert("Location sharing deactivated.");
    } else {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }
      setTrackingActive(true);
      Alert.alert("Location sharing activated.");
      // Start watching position and update Firestore
      watcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 1,
        },
        async (loc) => {
          const coords = {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            active: true,
            updated_at: new Date().toISOString(),
          };
          setLocationState({ latitude: coords.lat, longitude: coords.lng });
          setMapRegion({
            latitude: coords.lat,
            longitude: coords.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          // Update vendor document in Firestore
          await firestore().collection('vendors').doc(vendorId).set(coords, { merge: true });
        }
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Vendor Live Location</Text>
      <MapView
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={(region) => setMapRegion(region)}
      >
        {location && (
          <Marker
            coordinate={location}
            title="Your Location"
            description={trackingActive ? "Sharing live location" : "Location sharing off"}
            pinColor={trackingActive ? "blue" : "gray"}
          />
        )}
      </MapView>
      <TouchableOpacity
        style={styles.button}
        onPress={toggleTracking}
      >
        <Text style={styles.buttonText}>
          {trackingActive ? "Deactivate Location" : "Activate Location"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 1,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 80, // Adjusted to avoid overlap with back button
  },
  map: {
    width: "90%",
    height: "50%",
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});


