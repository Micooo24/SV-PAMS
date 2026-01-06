import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Animated, PanResponder, Dimensions } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const COLLAPSED_HEIGHT = 120;
const PARTIAL_HEIGHT = SCREEN_HEIGHT * 0.45;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.75;

export default function VendorBottomSheet({ vendors, selectedVendor, onVendorSelect, customerLoc, distance, eta }) {
  const [sheetState, setSheetState] = useState('partial'); // 'hidden', 'collapsed', 'partial', 'expanded'
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT - PARTIAL_HEIGHT)).current;

  // Calculate distance for each vendor
  const calculateDistance = (vendor) => {
    if (!customerLoc || !vendor.latitude || !vendor.longitude) return null;
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(vendor.latitude - customerLoc.latitude);
    const dLon = toRad(vendor.longitude - customerLoc.longitude);
    const lat1 = toRad(customerLoc.latitude);
    const lat2 = toRad(vendor.latitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    if (distance < 1) return `${Math.round(distance * 1000)} m`;
    return `${distance.toFixed(1)} km`;
  };

  // Calculate ETA (assuming 5km/h walking speed)
  const calculateETA = (vendor) => {
    if (!customerLoc || !vendor.latitude || !vendor.longitude) return null;
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(vendor.latitude - customerLoc.latitude);
    const dLon = toRad(vendor.longitude - customerLoc.longitude);
    const lat1 = toRad(customerLoc.latitude);
    const lat2 = toRad(vendor.latitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    const eta = distance / 5 * 60; // 5km/h, minutes
    return `${Math.round(eta)} min`;
  };

  // PanResponder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        const newY = SCREEN_HEIGHT - PARTIAL_HEIGHT + gestureState.dy;
        if (newY >= SCREEN_HEIGHT - EXPANDED_HEIGHT && newY <= SCREEN_HEIGHT - COLLAPSED_HEIGHT) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const velocity = gestureState.vy;
        if (velocity < -0.5 || (gestureState.dy < -50 && sheetState === 'partial')) {
          animateToPosition('expanded');
        } else if (velocity > 0.5 || (gestureState.dy > 50 && sheetState === 'partial')) {
          animateToPosition('collapsed');
        } else if (sheetState === 'expanded' && gestureState.dy > 50) {
          animateToPosition('partial');
        } else {
          animateToPosition(sheetState);
        }
      },
    })
  ).current;

  const animateToPosition = (state) => {
    setSheetState(state);
    let toValue;
    switch (state) {
      case 'hidden':
        toValue = SCREEN_HEIGHT;
        break;
      case 'collapsed':
        toValue = SCREEN_HEIGHT - COLLAPSED_HEIGHT;
        break;
      case 'partial':
        toValue = SCREEN_HEIGHT - PARTIAL_HEIGHT;
        break;
      case 'expanded':
        toValue = SCREEN_HEIGHT - EXPANDED_HEIGHT;
        break;
      default:
        toValue = SCREEN_HEIGHT - PARTIAL_HEIGHT;
    }
    Animated.spring(translateY, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  };

  const handleHeaderPress = () => {
    if (sheetState === 'partial') {
      animateToPosition('expanded');
    } else if (sheetState === 'expanded') {
      animateToPosition('partial');
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          height: SCREEN_HEIGHT,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Drag Handle */}
      <View {...panResponder.panHandlers}>
        <TouchableOpacity
          style={styles.dragHandle}
          onPress={handleHeaderPress}
          activeOpacity={0.7}
        >
          <View style={styles.dragBar} />
        </TouchableOpacity>

        {/* Header */}
        <TouchableOpacity
          style={styles.header}
          onPress={handleHeaderPress}
          activeOpacity={0.9}
        >
          <Text style={styles.title}>Active Vendors</Text>
          <View style={styles.headerRight}>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{vendors.length}</Text>
            </View>
            <Text style={styles.expandIcon}>
              {sheetState === 'expanded' ? '▼' : sheetState === 'collapsed' ? '▲' : '▲▼'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Selected Vendor Info - Show when route is active */}
      {selectedVendor && distance && eta && sheetState !== 'collapsed' && (
        <View style={styles.selectedVendorInfo}>
          <View style={styles.selectedVendorHeader}>
            <View style={styles.selectedVendorPhotoWrapper}>
              {selectedVendor.img && selectedVendor.img.length > 0 ? (
                <Image source={{ uri: selectedVendor.img }} style={styles.selectedVendorPhoto} />
              ) : (
                <View style={styles.selectedVendorPhotoPlaceholder}>
                  <Text style={styles.selectedVendorPhotoPlaceholderText}>🛒</Text>
                </View>
              )}
            </View>
            <View style={styles.selectedVendorDetails}>
              <Text style={styles.selectedVendorName}>
                {selectedVendor.firstname ? `${selectedVendor.firstname} ${selectedVendor.lastname || ''}` : 'Vendor'}
              </Text>
              <Text style={styles.selectedVendorBusiness}>
                {selectedVendor.business_name || 'Street Vendor'}
              </Text>
            </View>
          </View>
          <View style={styles.selectedVendorStats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{distance}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>ETA</Text>
              <Text style={styles.statValue}>{eta}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Vendor List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEnabled={sheetState !== 'collapsed'}
      >
        {vendors.map((vendor) => {
          const vendorDistance = calculateDistance(vendor);
          const vendorETA = calculateETA(vendor);
          const isSelected = selectedVendor && selectedVendor.id === vendor.id;
          
          return (
            <TouchableOpacity
              key={vendor.id}
              style={[styles.vendorCard, isSelected && styles.vendorCardSelected]}
              onPress={() => onVendorSelect(vendor)}
              activeOpacity={0.7}
            >
              <View style={styles.vendorContent}>
                {/* Vendor Photo */}
                <View style={styles.photoWrapper}>
                  {vendor.img && vendor.img.length > 0 ? (
                    <Image source={{ uri: vendor.img }} style={styles.vendorPhoto} />
                  ) : (
                    <View style={styles.vendorPhotoPlaceholder}>
                      <Text style={styles.vendorPhotoPlaceholderText}>🛒</Text>
                    </View>
                  )}
                  {vendor.active && <View style={styles.activeDot} />}
                </View>

                {/* Vendor Info */}
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorName}>
                    {vendor.firstname ? `${vendor.firstname} ${vendor.lastname || ''}` : 'Vendor'}
                  </Text>
                  <Text style={styles.vendorStatus}>
                    {vendor.business_name || 'Street Vendor'}
                  </Text>
                </View>

                {/* Route Button */}
                {isSelected ? (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓ Selected</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.routeButton}
                    onPress={() => onVendorSelect(vendor)}
                  >
                    <Text style={styles.routeButtonText}>📍</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {vendors.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No active vendors nearby</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  dragHandle: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  dragBar: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e3e8ef',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e40af',
  },
  countBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  expandIcon: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '700',
  },
  selectedVendorInfo: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  selectedVendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedVendorPhotoWrapper: {
    marginRight: 12,
  },
  selectedVendorPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  selectedVendorPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedVendorPhotoPlaceholderText: {
    fontSize: 24,
  },
  selectedVendorDetails: {
    flex: 1,
  },
  selectedVendorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 2,
  },
  selectedVendorBusiness: {
    fontSize: 13,
    color: '#64748b',
  },
  selectedVendorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e3e8ef',
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    color: '#1e40af',
    fontWeight: '700',
  },
  vendorDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  vendorDistance: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  vendorETA: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingTop: 12,
  },
  vendorCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  vendorCardSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  vendorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  vendorPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#2563eb',
  },
  vendorPhotoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#2563eb',
  },
  vendorPhotoPlaceholderText: {
    fontSize: 28,
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 3,
  },
  vendorStatus: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 3,
  },
  vendorDistance: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  routeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  routeButtonText: {
    fontSize: 22,
  },
  selectedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94a3b8',
  },
});
