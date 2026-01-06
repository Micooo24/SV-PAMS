import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';
// This screen shows only ACTIVE vendors from Firestore in real-time, and displays route, distance, and ETA using Google APIs.

export default function CustomerMapScreen() {
  // List of active vendors from Firestore
  const [vendors, setVendors] = useState([]);
  // Customer's current location
  const [customerLoc, setCustomerLoc] = useState(null);
  // For toggling customer location sharing
  const [trackingActive, setTrackingActive] = useState(false);
  const [locationWatcher, setLocationWatcher] = useState(null);
  // For route, distance, and ETA
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Listen to Firestore for all active vendors in real-time
    // Only vendors with active === true are shown
    const unsubscribe = firestore()
      .collection('vendors')
      .where('active', '==', true)
      .onSnapshot(snapshot => {
        const vendorList = [];
        snapshot.forEach(doc => {
          vendorList.push({ id: doc.id, ...doc.data() });
        });
        setVendors(vendorList);
      });
    return () => unsubscribe();
  }, []);

  // Fit map to selected vendor and customer
  useEffect(() => {
    if (selectedVendor && customerLoc && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: selectedVendor.lat, longitude: selectedVendor.lng },
          { latitude: customerLoc.latitude, longitude: customerLoc.longitude },
        ],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  }, [selectedVendor, customerLoc]);

  // Fetch route, distance, and ETA when vendor or customer changes
  useEffect(() => {
    const fetchRoute = async () => {
      if (!selectedVendor || !customerLoc) {
        setRouteCoords([]);
        setDistance(null);
        setEta(null);
        return;
      }
      try {
        // Use Google Directions API for route polyline
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${customerLoc.latitude},${customerLoc.longitude}&destination=${selectedVendor.lat},${selectedVendor.lng}&key=${apiKey}`;
        const res = await axios.get(url);
        if (res.data.routes.length > 0) {
          const points = decodePolyline(res.data.routes[0].overview_polyline.points);
          setRouteCoords(points);
          setDistance(res.data.routes[0].legs[0].distance.text);
          setEta(res.data.routes[0].legs[0].duration.text);
        } else {
          setRouteCoords([]);
          setDistance(null);
          setEta(null);
        }
      } catch (err) {
        setRouteCoords([]);
        setDistance(null);
        setEta(null);
      }
    };
    fetchRoute();
  }, [selectedVendor, customerLoc]);

  // Polyline decoder for Google Directions API
  function decodePolyline(encoded) {
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  }
  // Toggle customer location sharing (permission handling included)
  const toggleTracking = async () => {
    if (trackingActive) {
      setTrackingActive(false);
      if (locationWatcher) {
        locationWatcher.remove();
        setLocationWatcher(null);
      }
      Alert.alert("Location tracking deactivated.");
    } else {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }
      setTrackingActive(true);
      Alert.alert("Location tracking activated.");
      const watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 1,
        },
        (loc) => {
          if (!trackingActive) return;
          const coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          setCustomerLoc(coords);
          // Optionally: update customer location in Firestore if needed (not required by requirements)
        }
      );
      setLocationWatcher(watcher);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        ref={mapRef}
        style={styles.map}
        showsUserLocation={!!customerLoc}
        onPress={() => {}}
      >
        {/* Show all active vendors as blue markers */}
        {vendors.map(vendor => (
          <Marker
            key={vendor.id}
            coordinate={{ latitude: vendor.lat, longitude: vendor.lng }}
            title={`Vendor: ${vendor.id}`}
            description={vendor.active ? "Active" : "Inactive"}
            pinColor={selectedVendor && selectedVendor.id === vendor.id ? "orange" : "blue"}
            onPress={() => setSelectedVendor(vendor)}
          />
        ))}
        {/* Show customer location as green marker */}
        {customerLoc && (
          <Marker
            coordinate={customerLoc}
            title="You"
            description="Your current location"
            pinColor="green"
          />
        )}
        {/* Draw route polyline if available */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#2563eb"
            strokeWidth={4}
          />
        )}
      </MapView>
      {/* Show distance and ETA if available */}
      {distance && eta && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Distance: {distance} | ETA: {eta}</Text>
        </View>
      )}
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
    backgroundColor: '#fff',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  button: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: "#2563eb",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    zIndex: 1,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoBox: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    zIndex: 2,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});