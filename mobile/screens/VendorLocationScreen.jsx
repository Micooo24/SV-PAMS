import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { db } from "../firebase/firebaseConfig.js";
import { ref, set } from "firebase/database";

export default function VendorLocationScreen({ navigation }) {
  const [location, setLocationState] = useState(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 14.5650, // Default to Pasig
    longitude: 121.0850,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const toggleTracking = async () => {
    if (trackingActive) {
      setTrackingActive(false);
      alert("Location tracking deactivated.");
    } else {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      setTrackingActive(true);
      alert("Location tracking activated.");

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 1,
        },
        (loc) => {
          const coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };

          setLocationState(coords);
          setMapRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });

          // Update location
          set(ref(db, "vendors/vendor_001"), coords);
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
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Location"
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


