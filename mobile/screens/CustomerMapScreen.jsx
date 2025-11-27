import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { db } from "../secrets_mobile/firebase_config"; 
import { ref, set, onValue } from "firebase/database";

export default function CustomerMapScreen() {
  const [vendorLoc, setVendorLoc] = useState(null);
  const [customerLoc, setCustomerLoc] = useState(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [locationWatcher, setLocationWatcher] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const vendorRef = ref(db, "vendors/vendor_001");
    const customerRef = ref(db, "customers/customer_001");

    // Listen to vendor coordinate updates
    const unsubscribeVendor = onValue(vendorRef, (snapshot) => {
      const data = snapshot.val();
      setVendorLoc(data);
    });

    // Listen to customer coordinate updates
    const unsubscribeCustomer = onValue(customerRef, (snapshot) => {
      const data = snapshot.val();
      setCustomerLoc(data);
    });

    return () => {
      unsubscribeVendor();
      unsubscribeCustomer();
    };
  }, []);

  useEffect(() => {
    if (vendorLoc && customerLoc && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: vendorLoc.latitude, longitude: vendorLoc.longitude },
          { latitude: customerLoc.latitude, longitude: customerLoc.longitude },
        ],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  }, [vendorLoc, customerLoc]);

  const toggleTracking = async () => {
    if (trackingActive) {
      setTrackingActive(false);
      if (locationWatcher) {
        locationWatcher.remove();
        setLocationWatcher(null);
      }
      alert("Location tracking deactivated.");
    } else {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      setTrackingActive(true);
      alert("Location tracking activated.");

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

          // Save customer location to Firebase
          set(ref(db, "customers/customer_001"), coords);
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
        onRegionChangeComplete={(region) => {}}
      >
        {vendorLoc && (
          <Marker
            coordinate={{
              latitude: vendorLoc.latitude,
              longitude: vendorLoc.longitude,
            }}
            title="Vendor"
            description="Live vendor location"
            pinColor="blue" 
          />
        )}

        {customerLoc && (
          <Marker
            coordinate={{
              latitude: customerLoc.latitude,
              longitude: customerLoc.longitude,
            }}
            title="Customer"
            description="Live customer location"
            pinColor="green"
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
});