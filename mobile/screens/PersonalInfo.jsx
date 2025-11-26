// PersonalInfo.jsx  (updated – matches your current Login.jsx perfectly)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function PersonalInfo({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      // These are EXACTLY the keys your Login.jsx currently saves
      const keys = [
        'user_firstname',
        'user_lastname',
        'user_middlename',     // may be missing → will be undefined → we handle it
        'user_email',
        'user_mobile',         // this is mobile_no from backend
        'user_address',
        'user_barangay',
        'user_img',
        'user_role',
      ];

      const values = await AsyncStorage.multiGet(keys);
      const data = {};
      values.forEach(([key, value]) => {
        if (value !== null) data[key.replace('user_', '')] = value;
      });

      // Build clean user object
      setUser({
        firstname: data.firstname || '',
        lastname: data.lastname || '',
        middlename: data.middlename || '',
        email: data.email || '',
        mobile: data.mobile || '',
        address: data.address || '',
        barangay: data.barangay || '',
        img: data.img,
        role: (data.role || 'user').charAt(0).toUpperCase() + (data.role || 'user').slice(1),
        fullName: `${data.firstname || ''} ${data.middlename || ''} ${data.lastname || ''}`.trim() || 'User',
      });
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(React.useCallback(() => { loadUser(); }, []));
  useEffect(() => { loadUser(); }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={styles.header}>Personal Information</Text>

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
          <Text style={styles.roleBadge}>{user.role}</Text>
        </View>

        {/* Info List */}
        <View style={styles.infoCard}>
          <InfoRow icon="account" label="First Name" value={user.firstname} />
          {user.middlename ? <InfoRow icon="account" label="Middle Name" value={user.middlename} /> : null}
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
  header: { fontSize: 32, fontWeight: '700', marginTop: 20, marginHorizontal: 20, color: '#1e293b' },

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