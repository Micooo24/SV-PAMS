// screens/Home.jsx - FINAL PERFECT VERSION
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGlobalFonts } from '../hooks/font';


const Home = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const keys = ['user_firstname', 'user_lastname', 'user_role', 'user_img', 'user_barangay', 'user_email'];
      const values = await AsyncStorage.multiGet(keys);
      const data = {};
      values.forEach(([k, v]) => v && (data[k.replace('user_', '')] = v));

      const role = (data.role || 'citizen').toLowerCase();
      const name = `${data.firstname || ''} ${data.lastname || ''}`.trim() || 'User';

      setUser({
        name: name.split(' ')[0],
        fullName: name,
        photo: data.img,
        role,
        barangay: data.barangay || 'Pasig City',
        email: data.email || '',
      });
    } catch (err) {
      setUser({ name: 'User', role: 'citizen' });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(React.useCallback(() => { loadUser(); }, []));
  useEffect(() => { loadUser(); }, []);

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 16, color: '#64748b' }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const isVendor = user.role === 'vendor';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header - Logo on Left, Title in Middle, Notification on Right */}
        <View style={styles.header}>
           <Animated.Image
                  source={require("../assets/images/logo1.png")}
                  style={styles.logoCircle}
                  resizeMode="contain"
                />
          
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>SV: PAMS</Text>
              <TouchableOpacity style={styles.notificationIcon}>
                <MaterialCommunityIcons name="bell" size={28} color="#2563eb" />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Street Vendor Permit and AI-powered Monitoring System</Text>
          </View>
        </View>

        {/* Welcome Card */}
        <Card style={styles.welcomeCard} elevation={4}>
          <View style={styles.welcomeRow}>
            {user.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatar} />
            ) : (
              <Avatar.Text size={60} label={user.name.slice(0, 2).toUpperCase()} backgroundColor="#2563eb" />
            )}
            <View style={styles.welcomeText}>
              <Text style={styles.greeting}>Hello, {user.name}!</Text>
              <Text style={styles.welcomeBack}>Welcome back to SV: PAMS</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {isVendor ? 'Approved Vendor' : 'Citizen'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* BIG HERO CARD - Only if NOT Vendor */}
        {!isVendor && (
          <Card style={styles.heroCard} elevation={6}>
            <View style={styles.heroCardContent}>
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Become a Registered Street Vendor</Text>
                <Text style={styles.heroSubtitle}>
                  Get your official Digital ID & Permit
                </Text>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => navigation.navigate('DocSubmission')}
                >
                  <Text style={styles.applyButtonText}>Apply as Vendor →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}

        {/* 2×2 Tiles Grid */}
        <View style={styles.grid}>
          {isVendor ? (
            <>
              {/* My Digital ID */}
              <TouchableOpacity style={[styles.tile, styles.greenTile]} onPress={() => navigation.navigate('DigitalPermit')}>
                <Image source={{ uri: user.photo || 'https://via.placeholder.com/100' }} style={styles.idPreview} />
                <Text style={styles.tileTitle}>My Digital ID</Text>
                <Text style={styles.tileSub}>SV-{user.email?.slice(0,8).toUpperCase()}</Text>
              </TouchableOpacity>

              {/* My Payments */}
              <TouchableOpacity style={[styles.tile, styles.amberTile]}>
                <MaterialCommunityIcons name="wallet" size={40} color="#fff" />
                <Text style={styles.tileTitle}>My Payments</Text>
                <Text style={styles.tileSub}>Last: Oct 2025</Text>
              </TouchableOpacity>

              {/* Permit Status */}
              <TouchableOpacity style={[styles.tile, styles.greenTile]}>
                <MaterialCommunityIcons name="shield-check" size={40} color="#fff" />
                <Text style={styles.tileTitle}>Permit Status</Text>
                <Text style={styles.tileSub}>Active • Renew Dec</Text>
              </TouchableOpacity>

              {/* My Cart */}
              <TouchableOpacity style={[styles.tile, styles.blueTile]}>
                <MaterialCommunityIcons name="cart" size={40} color="#fff" />
                <Text style={styles.tileTitle}>My Cart</Text>
                <Text style={styles.tileSub}>Plate: ABC-123</Text>
              </TouchableOpacity>

              {/* View Vendor Location */}
              <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('VendorLocation')}>
                <MaterialCommunityIcons name="map" size={40} color="#2563eb" />
                <Text style={styles.tileTitleDark}>View Vendor Location</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('DocSubmission')}>
                <MaterialCommunityIcons name="file-clock" size={40} color="#2563eb" />
                <Text style={styles.tileTitleDark}>Track Application</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('CustomerMap')}>
                <MaterialCommunityIcons name="map-marker-radius" size={40} color="#2563eb" />
                <Text style={styles.tileTitleDark}>View Map</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { padding: 30, alignItems: 'flex-start', flexDirection: 'row', alignItems: 'center' },
  titleContainer: { marginLeft: 16, flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notificationIcon: { padding: 8, position: 'relative', marginLeft: 12 },
  notificationBadge: { position: 'absolute', top: 5, right: 5, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' },
  logoCircle: { width: 70, height: 70, marginTop: 5, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoText: { fontSize: 35, fontFamily: 'Poppins-Bold', color: '#fff' },
  title: { fontSize: 32, fontFamily: 'Poppins-Bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },

  welcomeCard: { marginHorizontal: 20, marginTop: 5, marginBottom: 10, padding: 20, borderRadius: 20, backgroundColor: '#fff', elevation: 4 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  welcomeText: { marginLeft: 16 },
  greeting: { fontSize: 24, fontFamily: 'Poppins-Bold', color: '#1e293b' },
  welcomeBack: { fontSize: 15, color: '#64748b', marginTop: 4 },
  roleBadge: { marginTop: 12, backgroundColor: '#dbeafe', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  roleText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },

  heroCard: { marginHorizontal: 20, marginTop: 16, borderRadius: 20, backgroundColor: '#dbeafe', elevation: 6 },
  heroCardContent: { overflow: 'hidden', borderRadius: 20 },
  heroContent: { padding: 28 },
  heroTitle: { fontSize: 24, fontFamily: 'Poppins-Bold', color: '#1e293b', lineHeight: 32 },
  heroSubtitle: { fontSize: 16, color: '#475569', marginVertical: 12, fontFamily: 'Poppins-Medium' },
  applyButton: { backgroundColor: '#2563eb', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  applyButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  grid: { paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 },
  tile: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'center', elevation: 4 },
  greenTile: { backgroundColor: '#16a34a' },
  amberTile: { backgroundColor: '#f59e0b' },
  blueTile: { backgroundColor: '#2563eb' },
  idPreview: { width: 90, height: 60, borderRadius: 8, marginBottom: 12 },
  tileTitle: { fontSize: 16, fontWeight: '600', color: '#fff', textAlign: 'center', marginTop: 8 },
  tileSub: { fontSize: 12, color: '#e0e7ff', marginTop: 4 },
  tileTitleDark: { fontSize: 15, fontWeight: '600', color: '#1e293b', textAlign: 'center', marginTop: 12 },
});

export default Home;