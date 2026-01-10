
import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import VendorMap from '../components/VendorMap';
import MapDistanceInfo from '../components/MapDistanceInfo';
import * as Location from "expo-location";
import firestore from '@react-native-firebase/firestore';
import authService from '../services/authService';

export default function VendorLocationScreen({ navigation }) {
  const [location, setLocationState] = useState(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 14.5650,
    longitude: 121.0850,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const watcherRef = useRef(null);
  const [vendor, setVendor] = useState(null);
  const [vendorId, setVendorId] = useState(null);

  // Fetch logged-in vendor info from authService
  useEffect(() => {
    const fetchVendor = async () => {
      const userObj = await authService.getCurrentUser();
      if (userObj && userObj._id && userObj.role === 'vendor') {
        setVendor(userObj);
        setVendorId(userObj._id);
      }
    };
    fetchVendor();
  }, []);

  // Helper to calculate distance and ETA (Haversine formula for demo)
  function calculateDistanceAndEta(loc1, loc2) {
    if (!loc1 || !loc2) return { distance: null, eta: null };
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(loc2.latitude - loc1.latitude);
    const dLon = toRad(loc2.longitude - loc1.longitude);
    const lat1 = toRad(loc1.latitude);
    const lat2 = toRad(loc2.latitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    // Assume walking speed 5km/h for ETA
    const eta = distance ? `${Math.round((distance / 5) * 60)} min` : null;
    return { distance: `${distance.toFixed(2)} km`, eta };
  }

  // Toggle vendor live location sharing (aligned with CustomerMapScreen logic)
  const toggleTracking = async () => {
    if (!vendorId || !vendor) {
      Alert.alert('Vendor not loaded', 'Please log in again.');
      return;
    }
    if (trackingActive) {
      setTrackingActive(false);
      if (watcherRef.current) {
        watcherRef.current.remove();
        watcherRef.current = null;
      }
      // Set status to deactivated in Firestore and update local marker
      firestore()
        .collection('users')
        .doc(vendorId)
        .set({ active: false, updated_at: new Date().toISOString(), status: 'deactivated' }, { merge: true })
        .then(() => {
          setLocationState(prev => prev ? { ...prev, active: false, status: 'deactivated' } : null);
        })
        .catch((error) => {
          console.error('Error writing vendor active:false to Firestore:', error);
        });
      Alert.alert("Location sharing deactivated.");
    } else {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }
      setTrackingActive(true);
      Alert.alert("Location sharing activated.");
      let isActive = true;
      // Set status to active in Firestore
      firestore()
        .collection('users')
        .doc(vendorId)
        .set({ active: true, updated_at: new Date().toISOString(), status: 'active', ...vendor }, { merge: true })
        .then(() => {
          // Initial activation written
        })
        .catch((error) => {
          console.error('Error writing vendor active:true to Firestore:', error);
        });
      watcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 1,
        },
        async (loc) => {
          if (!isActive) return;
          const coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            updated_at: new Date().toISOString(),
            active: true,
            status: 'active',
            ...vendor,
          };
          setLocationState(coords);
          setMapRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          firestore()
            .collection('users')
            .doc(vendorId)
            .set(coords, { merge: true })
            .then(() => {
              // Vendor location written
            })
            .catch((error) => {
              console.error('Error writing vendor location to Firestore:', error);
            });
        }
      );
      watcherRef.current.remove = () => {
        isActive = false;
        firestore()
          .collection('users')
          .doc(vendorId)
          .set({ active: false, updated_at: new Date().toISOString(), status: 'deactivated' }, { merge: true })
          .then(() => {
            // Vendor deactivated
          })
          .catch((error) => {
            console.error('Error writing vendor active:false to Firestore:', error);
          });
      };
    }
  };

  // Merge vendor info into location for marker/photo display
  const mergedVendorLoc = location && vendor ? { ...vendor, ...location } : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Vendor Live Location</Text>
          <Text style={styles.subtitle}>Share your location with customers</Text>
        </View>
        <TouchableOpacity
          style={[styles.locationToggle, trackingActive && styles.locationToggleActive]}
          onPress={toggleTracking}
        >
          <Text style={styles.locationToggleIcon}>📍</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mapWrapper}>
        <VendorMap location={mergedVendorLoc} mapRegion={mapRegion} onRegionChange={setMapRegion} />
      </View>
      {trackingActive && (
        <View style={styles.statusBar}>
          <View style={styles.statusIndicator} />
          <Text style={styles.statusText}>Location sharing active</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e3e8ef',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  locationToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3e8ef',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  locationToggleActive: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
  },
  locationToggleIcon: {
    fontSize: 24,
  },
  mapWrapper: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  statusBar: {
    width: '100%',
    backgroundColor: '#d1fae5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#10b981',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '600',
  },
});

