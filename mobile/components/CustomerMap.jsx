import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';

export default function CustomerMap({ customerLoc, vendors, selectedVendor, routeCoords, mapRegion, heading = 0, onRegionChange, onVendorSelect, onCustomerSelect }) {
      // Handler for callout press with confirmation
      const handleVendorCalloutPress = (user) => {
        Alert.alert(
          'Navigate to Vendor',
          'Do you want to show the route to this vendor?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes', onPress: () => onVendorSelect(user) },
          ]
        );
      };
    // Debug: Log routeCoords to verify polyline data
    React.useEffect(() => {
      if (routeCoords && routeCoords.length > 0) {
        console.log('Polyline coordinates:', routeCoords);
      } else {
        console.log('No polyline coordinates to display');
      }
    }, [routeCoords]);
  // Validate mapRegion (no city restriction, just check for valid numbers)
  const safeRegion =
    mapRegion &&
    typeof mapRegion.latitude === 'number' &&
    typeof mapRegion.longitude === 'number' &&
    typeof mapRegion.latitudeDelta === 'number' &&
    typeof mapRegion.longitudeDelta === 'number' &&
    !isNaN(mapRegion.latitude) &&
    !isNaN(mapRegion.longitude) &&
    !isNaN(mapRegion.latitudeDelta) &&
    !isNaN(mapRegion.longitudeDelta)
      ? mapRegion
      : {
          latitude: 14.565, // Default center, but not restricted
          longitude: 121.085,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        region={safeRegion}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        rotateEnabled={true}
        pitchEnabled={true}
        loadingEnabled={true}
        loadingIndicatorColor="#2563eb"
        loadingBackgroundColor="#ffffff"
      >
        {/* Vendor markers */}
        {vendors.map(user => {
          // Support both lat/lng and latitude/longitude for backward compatibility
          const latitude = user.latitude !== undefined ? user.latitude : user.lat;
          const longitude = user.longitude !== undefined ? user.longitude : user.lng;
          if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) return null;
          const isSelected = selectedVendor && selectedVendor.id === user.id;
          return (
            <Marker
              key={user.id}
              coordinate={{ latitude, longitude }}
              title={user.firstname ? `${user.firstname} ${user.lastname || ''}` : 'Vendor'}
              onPress={() => onVendorSelect(user)}
            >
              {/* Simplified marker for cleaner look */}
              {user.img && user.img.length > 0 ? (
                <View style={styles.markerWrapper}>
                  <Image 
                    source={{ uri: user.img }} 
                    style={[styles.vendorMarkerImage, isSelected && styles.vendorMarkerImageSelected]}
                  />
                  {user.active && <View style={styles.markerActiveDot} />}
                </View>
              ) : (
                <View style={styles.markerWrapper}>
                  <View style={[styles.vendorMarkerCircle, isSelected && styles.vendorMarkerCircleSelected]}>
                    <Text style={styles.vendorMarkerText}>🛒</Text>
                  </View>
                  {user.active && <View style={styles.markerActiveDot} />}
                </View>
              )}
            </Marker>
          );
        })}
        {/* Customer marker */}
        {customerLoc && typeof customerLoc.latitude === 'number' && typeof customerLoc.longitude === 'number' && !isNaN(customerLoc.latitude) && !isNaN(customerLoc.longitude) && (
          <Marker
            coordinate={{ latitude: customerLoc.latitude, longitude: customerLoc.longitude }}
            title="You"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            {/* Direction indicator cone - simplified with React Native */}
            <View style={[styles.directionIndicator, { transform: [{ rotate: `${heading}deg` }] }]} />
            {customerLoc.img && customerLoc.img.length > 0 ? (
              <View style={styles.markerWrapper}>
                <Image 
                  source={{ uri: customerLoc.img }} 
                  style={styles.customerMarkerImage}
                />
                {customerLoc.active && <View style={styles.markerActiveDot} />}
              </View>
            ) : (
              <View style={styles.markerWrapper}>
                <View style={styles.customerMarkerCircle}>
                  <Text style={styles.customerMarkerText}>👤</Text>
                </View>
                {customerLoc.active && <View style={styles.markerActiveDot} />}
              </View>
            )}
          </Marker>
        )}
        {/* Route polyline */}
        {Array.isArray(routeCoords) && routeCoords.length > 0 && routeCoords.every(pt => typeof pt.latitude === 'number' && typeof pt.longitude === 'number') && (
          <>
            {/* Shadow/outline polyline */}
            <Polyline
              coordinates={routeCoords}
              strokeColor="rgba(37, 99, 235, 0.2)"
              strokeWidth={8}
              lineCap="round"
              lineJoin="round"
            />
            {/* Main polyline */}
            <Polyline
              coordinates={routeCoords}
              strokeColor="#2563eb"
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
              zIndex={1}
            />
          </>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  directionIndicator: {
    position: 'absolute',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    top: -60,
    left: -60,
  },
  // Marker styles
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  vendorMarkerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#6366f1',
    backgroundColor: '#fff',
  },
  vendorMarkerImageSelected: {
    borderColor: '#2563eb',
    borderWidth: 4,
    transform: [{ scale: 1.1 }],
  },
  vendorMarkerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366f1',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorMarkerCircleSelected: {
    backgroundColor: '#2563eb',
    borderWidth: 4,
    transform: [{ scale: 1.1 }],
  },
  vendorMarkerText: {
    fontSize: 24,
  },
  customerMarkerImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 4,
    borderColor: '#10b981',
    backgroundColor: '#fff',
  },
  customerMarkerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#10b981',
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerMarkerText: {
    fontSize: 26,
  },
  markerActiveDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#fff',
  },
});
