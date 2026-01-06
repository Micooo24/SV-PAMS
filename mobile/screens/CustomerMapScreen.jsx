
// This screen shows only ACTIVE vendors from Firestore in real-time, and displays route, distance, and ETA using Google APIs.

import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import CustomerMap from '../components/CustomerMap';
import MapDistanceInfo from '../components/MapDistanceInfo';
import VendorBottomSheet from '../components/VendorBottomSheet';
import * as Location from "expo-location";
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';
import authService from '../services/authService';

const CustomerMapScreen = () => {
  const [vendors, setVendors] = useState([]);
  const [customerLoc, setCustomerLoc] = useState(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [locationWatcher, setLocationWatcher] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [heading, setHeading] = useState(0);
  const [mapRegion, setMapRegion] = useState({
    latitude: 14.5650,
    longitude: 121.0850,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [user, setUser] = useState(null);
  const [customerId, setCustomerId] = useState(null);

  // Fetch logged-in user info from AsyncStorage
  useEffect(() => {
    const fetchUser = async () => {
      const userObj = await authService.getCurrentUser();
      if (userObj && userObj._id) {
        setUser(userObj);
        setCustomerId(userObj._id);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    // Listen for active vendors (unified user model: role === 'vendor')
    const unsubscribe = firestore()
      .collection('users')
      .where('role', '==', 'vendor')
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

  // Removed automatic map centering on vendor selection

  useEffect(() => {
    // Only calculate route/ETA/distance when both customerLoc and selectedVendor are available
    if (!selectedVendor || !customerLoc) {
      setRouteCoords([]);
      setDistance(null);
      setEta(null);
      return;
    }
    const fetchRoute = async () => {
      try {
        // Securely get the API key from Expo config (set via .env)
        const apiKey = ''; //lagay mo rito yung exact apikey sa .env file
        const vendorLat = selectedVendor.lat ?? selectedVendor.latitude;
        const vendorLng = selectedVendor.lng ?? selectedVendor.longitude;
        console.log('Selected vendor coords:', vendorLat, vendorLng);
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${customerLoc.latitude},${customerLoc.longitude}&destination=${vendorLat},${vendorLng}&key=${apiKey}`;
        const res = await axios.get(url);
        console.log('Directions API response:', res.data);
        if (res.data.routes.length > 0 && res.data.routes[0].overview_polyline && res.data.routes[0].overview_polyline.points) {
          const points = decodePolyline(res.data.routes[0].overview_polyline.points);
          console.log('Decoded polyline points:', points);
          setRouteCoords(points);
          setDistance(res.data.routes[0].legs[0].distance.text);
          setEta(res.data.routes[0].legs[0].duration.text);
        } else {
          console.log('No routes or polyline found in API response');
          setRouteCoords([]);
          setDistance(null);
          setEta(null);
        }
      } catch (err) {
        console.error('Directions API error:', err);
        setRouteCoords([]);
        setDistance(null);
        setEta(null);
      }
    };
    fetchRoute();
  }, [selectedVendor, customerLoc]);

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

  const toggleTracking = async () => {
    if (!customerId || !user) {
      Alert.alert('User not loaded', 'Please log in again.');
      return;
    }
    if (trackingActive) {
      setTrackingActive(false);
      if (locationWatcher) {
        locationWatcher.remove();
        setLocationWatcher(null);
      }
      // Set status to deactivated in Firestore and update local marker
      firestore()
        .collection('users')
        .doc(customerId)
        .set({ active: false, updated_at: new Date().toISOString(), status: 'deactivated' }, { merge: true })
        .then(() => {
          console.log('Customer active:false written to Firestore');
          setCustomerLoc(prev => prev ? { ...prev, active: false, status: 'deactivated' } : null);
        })
        .catch((error) => {
          console.error('Error writing customer active:false to Firestore:', error);
        });
      Alert.alert("Location tracking deactivated.");
    } else {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }
      setTrackingActive(true);
      Alert.alert("Location tracking activated.");
      let isActive = true;
      // Set status to active in Firestore
      firestore()
        .collection('users')
        .doc(customerId)
        .set({ active: true, updated_at: new Date().toISOString(), status: 'active', ...user }, { merge: true })
        .then(() => {
          console.log('Customer active:true written to Firestore');
        })
        .catch((error) => {
          console.error('Error writing customer active:true to Firestore:', error);
        });
      const watcher = await Location.watchPositionAsync(
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
            ...user,
          };
          setCustomerLoc(coords);
          // Update heading if available
          if (loc.coords.heading !== null && loc.coords.heading !== undefined) {
            setHeading(loc.coords.heading);
          }
          console.log('Attempting to write customer location to Firestore:', coords);
          firestore()
            .collection('users')
            .doc(customerId)
            .set(coords, { merge: true })
            .then(() => {
              console.log('Customer location written to Firestore');
            })
            .catch((error) => {
              console.error('Error writing customer location to Firestore:', error);
              Alert.alert('Firestore Error', error.message);
            });
        }
      );
      setLocationWatcher({
        remove: () => {
          isActive = false;
          firestore()
            .collection('users')
            .doc(customerId)
            .set({ active: false, updated_at: new Date().toISOString(), status: 'deactivated' }, { merge: true })
            .then(() => {
              console.log('Customer active:false written to Firestore');
            })
            .catch((error) => {
              console.error('Error writing customer active:false to Firestore:', error);
            });
          watcher.remove();
        }
      });
    }
  };

  // Merge user info into customerLoc for marker/photo display
  const mergedCustomerLoc = customerLoc && user ? { ...user, ...customerLoc } : null;

  // Handler for 'Go to this' on customer marker (can be extended for custom logic)
  const handleCustomerSelect = (customer) => {
    Alert.alert('This is your location', 'You are here!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Customer Map</Text>
            <Text style={styles.subtitle}>Find nearby vendors</Text>
          </View>
          <TouchableOpacity
            style={[styles.locationToggle, trackingActive && styles.locationToggleActive]}
            onPress={toggleTracking}
          >
            <Text style={styles.locationToggleIcon}>
              {trackingActive ? "📍" : "📍"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.mapWrapper}>
        <CustomerMap
          customerLoc={mergedCustomerLoc}
          vendors={vendors}
          selectedVendor={selectedVendor}
          routeCoords={routeCoords}
          mapRegion={mapRegion}
          heading={heading}
          onRegionChange={setMapRegion}
          onVendorSelect={(vendor) => {
            setSelectedVendor(vendor);
          }}
          onCustomerSelect={handleCustomerSelect}
        />
        <MapDistanceInfo 
          distance={distance} 
          eta={eta}
          onClearRoute={selectedVendor && routeCoords.length > 0 ? () => {
            Alert.alert(
              'Clear Route',
              'Do you want to clear the current route?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: () => setSelectedVendor(null) },
              ]
            );
          } : null}
        />
        <VendorBottomSheet
          vendors={vendors}
          selectedVendor={selectedVendor}
          onVendorSelect={(vendor) => {
            setSelectedVendor(vendor);
          }}
          customerLoc={mergedCustomerLoc}
          distance={distance}
          eta={eta}
        />
      </View>
      {trackingActive && (
        <View style={styles.statusBar}>
          <View style={styles.statusIndicator} />
          <Text style={styles.statusText}>Location sharing active</Text>
        </View>
      )}
    </View>
  );
};

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
  },
  headerContent: {
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

export default CustomerMapScreen;