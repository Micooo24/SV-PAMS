import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import useAuth from '../hooks/useAuth';

export default function PersonalInfo({ navigation }) {
  const { getAuthUserProfile, user: authUser, loading } = useAuth();
  const [user, setUser] = useState(null);

  const loadUser = async () => {
    try {
      const result = await getAuthUserProfile();
      
      if (result.success && result.user) {
        const userData = result.user;
        
        // Build clean user object
        setUser({
          firstname: userData.firstname || '',
          lastname: userData.lastname || '',
          email: userData.email || '',
          mobile: userData.mobile_no?.toString() || '',
          address: userData.address || '',
          barangay: userData.barangay || '',
          img: userData.img,
          role: (userData.role || 'user').charAt(0).toUpperCase() + (userData.role || 'user').slice(1),
          fullName: `${userData.firstname || ''} ${userData.lastname || ''}`.trim() || 'User',
        });
      } else {
        Alert.alert('Error', result.error || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      Alert.alert('Error', 'Failed to load user profile. Please try again.');
    }
  };

  // Load user on screen focus
  useFocusEffect(
    React.useCallback(() => {
      loadUser();
    }, [])
  );

  // Initial load
  useEffect(() => {
    loadUser();
  }, []);

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Personal Information</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('UpdateProfile')}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {user.img ? (
            <Image source={{ uri: user.img }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={80} color="#2563eb" />
            </View>
          )}
          <Text style={styles.fullName}>{user.fullName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{user.role}</Text>
          </View>
        </View>

        {/* Info List */}
        <View style={styles.infoCard}>
          <InfoRow icon="account" label="First Name" value={user.firstname} />
          <InfoRow icon="account" label="Last Name" value={user.lastname} />
          <InfoRow icon="email" label="Email" value={user.email} />
          <InfoRow icon="phone" label="Mobile Number" value={user.mobile || 'Not provided'} />
          <InfoRow icon="home" label="Address" value={user.address || 'Not provided'} />
          <InfoRow icon="map-marker" label="Barangay" value={user.barangay || 'Not provided'} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.iconWrapper}>
      <MaterialCommunityIcons name={icon} size={24} color="#2563eb" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  
  header: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: '#1e293b',
    flex: 1,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
  },

  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },

  profileHeader: { alignItems: 'center', marginVertical: 30 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 16 },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  fullName: { fontSize: 24, fontWeight: '700', color: '#1e293b' },
  roleBadge: { marginTop: 8, backgroundColor: '#dbeafe', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  roleBadgeText: { color: '#2563eb', fontWeight: '600' },

  infoCard: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, elevation: 4, paddingVertical: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  iconWrapper: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  textContainer: { flex: 1 },
  label: { fontSize: 14, color: '#64748b' },
  value: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginTop: 2 },
});