import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

export default function VendorMap({ location, mapRegion, onRegionChange }) {
  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={onRegionChange}
      >
        {location && (
          <Marker
            coordinate={location}
            title={location.firstname ? `${location.firstname} ${location.lastname || ''}` : 'Vendor'}
          >
            <View style={styles.markerWrapper}>
              <View style={styles.markerContainer}>
                {location.img ? (
                  <Image source={{ uri: location.img }} style={styles.markerImage} />
                ) : (
                  <View style={styles.markerPlaceholder}>
                    <Text style={styles.markerPlaceholderText}>🏪</Text>
                  </View>
                )}
              </View>
            </View>
            <Callout>
              <View style={styles.calloutContainer}>
                <View style={styles.calloutHeader}>
                  {location.img && <Image source={{ uri: location.img }} style={styles.calloutImage} />}
                  <View style={styles.calloutHeaderText}>
                    <Text style={styles.calloutName}>
                      {location.firstname ? `${location.firstname} ${location.lastname || ''}` : 'Vendor'}
                    </Text>
                    <View style={styles.calloutBadgeRow}>
                      <View style={[styles.badge, location.active ? styles.badgeActive : styles.badgeInactive]}>
                        <Text style={styles.badgeText}>{location.active ? '● Active' : '● Inactive'}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.calloutDivider} />
                <Text style={styles.calloutMeta}>Your live location</Text>
              </View>
            </Callout>
          </Marker>
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
  },
  map: {
    width: '95%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  markerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  markerPlaceholder: {
    fontSize: 28,
  },
  markerPlaceholderText: {
    fontSize: 32,
  },
  calloutContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calloutImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    backgroundColor: '#e3e8ef',
  },
  calloutHeaderText: {
    flex: 1,
  },
  calloutName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  calloutBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeActive: {
    backgroundColor: '#d1fae5',
  },
  badgeInactive: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  calloutDivider: {
    height: 1,
    backgroundColor: '#e3e8ef',
    marginVertical: 8,
  },
  calloutMeta: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
