import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function MapDistanceInfo({ distance, eta, onClearRoute }) {
  if (!distance && !eta) return null;
  return (
    <View style={styles.infoBox}>
      <View style={styles.contentWrapper}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🚶</Text>
        </View>
        <View style={styles.textContent}>
          {distance && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Distance: </Text>
              <Text style={styles.value}>{distance}</Text>
            </View>
          )}
          {eta && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>ETA: </Text>
              <Text style={styles.value}>{eta}</Text>
            </View>
          )}
        </View>
        {onClearRoute && (
          <TouchableOpacity style={styles.clearButton} onPress={onClearRoute}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    zIndex: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e3e8ef',
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 24,
  },
  textContent: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: '#1e40af',
    fontSize: 16,
    fontWeight: '700',
  },
  clearButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  clearIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});
