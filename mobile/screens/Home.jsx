// screens/Home.jsx - FULLY RESPONSIVE VERSION (inline styles only)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  PixelRatio,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGlobalFonts } from '../hooks/font';
import BASE_URL from '../common/baseurl';

// Responsive helpers
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const baseWidth = 375;
const scale = SCREEN_WIDTH / baseWidth;

const wp = (percentage) => (SCREEN_WIDTH * percentage) / 100;
const hp = (percentage) => (SCREEN_HEIGHT * percentage) / 100;

const normalize = (size) => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

const Home = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState(null);

  const checkApplicationStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/api/vendor/application`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplicationStatus(data);
      }
    } catch (err) {
      // No application or error
      setApplicationStatus(null);
    }
  };

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

      // Check application status if not vendor yet
      if (role !== 'vendor') {
        await checkApplicationStatus();
      }
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
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const isVendor = user.role === 'vendor';
  const hasApplication = applicationStatus !== null;
  const canApply = !isVendor && !hasApplication;
  const shouldShowStatus = !isVendor && hasApplication;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(12) }}>

        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/logo1.png")}
            style={styles.logoCircle}
            resizeMode="contain"
          />
          
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>SV: PAMS</Text>
              <TouchableOpacity style={styles.notificationIcon}>
                <MaterialCommunityIcons name="bell" size={normalize(28)} color="#2563eb" />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              Street Vendor Permit and AI-powered Monitoring System
            </Text>
          </View>
        </View>

        {/* Welcome Card */}
        <Card style={styles.welcomeCard} elevation={4}>
          <View style={styles.welcomeRow}>
            {user.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatar} />
            ) : (
              <Avatar.Text 
                size={wp(16)} 
                label={user.name.slice(0, 2).toUpperCase()} 
                backgroundColor="#2563eb" 
              />
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

        {/* BIG HERO CARD - Only for Citizens without application */}
        {canApply && (
          <Card style={styles.heroCard} elevation={6}>
            <View style={styles.heroCardContent}>
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Become a Registered Street Vendor</Text>
                <Text style={styles.heroSubtitle}>
                  Get your official Digital ID. 
                </Text>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => navigation.navigate('VendorApplyForm')}
                >
                  <Text style={styles.applyButtonText}>Apply as Vendor →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}

        {/* Application Status Card - For citizens with pending application */}
        {shouldShowStatus && (
          <Card style={styles.statusApplicationCard} elevation={4}>
            <Text style={styles.statusCardTitle}>Your Vendor Application</Text>
            <View style={styles.statusCardRow}>
              <Text style={styles.statusCardLabel}>Status:</Text>
              <Text style={[styles.statusCardValue, { 
                color: applicationStatus.status === 'approved' ? '#16a34a' : 
                       applicationStatus.status === 'rejected' ? '#dc2626' : '#f59e0b' 
              }]}>
                {applicationStatus.status.toUpperCase()}
              </Text>
            </View>
            <View style={styles.statusCardRow}>
              <Text style={styles.statusCardLabel}>Completeness:</Text>
              <Text style={styles.statusCardValue}>{applicationStatus.completeness_percentage}%</Text>
            </View>
            {applicationStatus.status === 'approved' && applicationStatus.completeness_percentage >= 90 && (
              <Text style={styles.statusCardReady}>🎉 Ready to activate vendor role!</Text>
            )}
            <TouchableOpacity
              style={styles.viewApplicationButton}
              onPress={() => navigation.navigate('BusinessInfo')}
            >
              <Text style={styles.viewApplicationText}>View Application Details</Text>
            </TouchableOpacity>
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
                <MaterialCommunityIcons name="wallet" size={normalize(40)} color="#fff" />
                <Text style={styles.tileTitle}>My Payments</Text>
                <Text style={styles.tileSub}>Last: Oct 2025</Text>
              </TouchableOpacity>

              {/* Permit Status */}
              <TouchableOpacity style={[styles.tile, styles.greenTile]}>
                <MaterialCommunityIcons name="shield-check" size={normalize(40)} color="#fff" />
                <Text style={styles.tileTitle}>Permit Status</Text>
                <Text style={styles.tileSub}>Active • Renew Dec</Text>
              </TouchableOpacity>

              {/* My Cart */}
              <TouchableOpacity style={[styles.tile, styles.blueTile]}>
                <MaterialCommunityIcons name="cart" size={normalize(40)} color="#fff" />
                <Text style={styles.tileTitle}>My Cart</Text>
                <Text style={styles.tileSub}>Plate: ABC-123</Text>
              </TouchableOpacity>

              {/* View Vendor Location */}
              <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('VendorLocation')}>
                <MaterialCommunityIcons name="map" size={normalize(40)} color="#2563eb" />
                <Text style={styles.tileTitleDark}>View Vendor Location</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={[styles.tile, styles.greenTile]} onPress={() => navigation.navigate('VendorList')}>
                <MaterialCommunityIcons name="store" size={normalize(40)} color="#fff" />
                <Text style={styles.tileTitle}>Browse Vendors</Text>
                <Text style={styles.tileSub}>Find by category</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('DocSubmission')}>
                <MaterialCommunityIcons name="file-clock" size={normalize(40)} color="#2563eb" />
                <Text style={styles.tileTitleDark}>Submit Documents</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('CustomerMap')}>
                <MaterialCommunityIcons name="map-marker-radius" size={normalize(40)} color="#2563eb" />
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
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontFamily: 'Poppins-Regular',
    fontSize: normalize(16),
  },

  header: {
    paddingHorizontal: wp(6),
    paddingTop: hp(4),
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: wp(18),
    height: wp(18),
    borderRadius: 12,
  },
  titleContainer: {
    marginLeft: wp(4),
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationIcon: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    backgroundColor: '#ef4444',
  },
  title: {
    fontSize: normalize(32),
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: normalize(13),
    color: '#64748b',
    marginTop: hp(0.5),
    fontFamily: 'Poppins-Regular',
  },

  welcomeCard: {
    marginHorizontal: wp(5),
    marginTop: hp(2),
    marginBottom: hp(1.5),
    padding: wp(5),
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
  },
  welcomeText: {
    marginLeft: wp(4),
    flex: 1,
  },
  greeting: {
    fontSize: normalize(24),
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
  },
  welcomeBack: {
    fontSize: normalize(15),
    color: '#64748b',
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  roleBadge: {
    marginTop: hp(1.5),
    backgroundColor: '#dbeafe',
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: normalize(14),
    fontFamily: 'Poppins-SemiBold',
    color: '#2563eb',
  },

  heroCard: {
    marginHorizontal: wp(5),
    marginTop: hp(2),
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    overflow: 'hidden',
  },
  heroCardContent: {
    borderRadius: 20,
  },
  heroContent: {
    padding: wp(7),
  },
  heroTitle: {
    fontSize: normalize(24),
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
    lineHeight: normalize(32),
  },
  heroSubtitle: {
    fontSize: normalize(16),
    color: '#475569',
    marginVertical: hp(1.5),
    fontFamily: 'Poppins-Medium',
  },
  applyButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: wp(8),
    paddingVertical: hp(2),
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: normalize(17),
    fontFamily: 'Poppins-Bold',
  },

  statusApplicationCard: {
    marginHorizontal: wp(5),
    marginTop: hp(2),
    padding: wp(5),
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  statusCardTitle: {
    fontSize: normalize(18),
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
    marginBottom: hp(1.5),
  },
  statusCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  statusCardLabel: {
    fontSize: normalize(15),
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
  },
  statusCardValue: {
    fontSize: normalize(15),
    fontFamily: 'Poppins-SemiBold',
    color: '#1e293b',
  },
  statusCardReady: {
    fontSize: normalize(14),
    fontFamily: 'Poppins-SemiBold',
    color: '#16a34a',
    marginTop: hp(1),
    textAlign: 'center',
  },
  viewApplicationButton: {
    backgroundColor: '#2563eb',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: 8,
    marginTop: hp(2),
    alignSelf: 'flex-start',
  },
  viewApplicationText: {
    color: '#fff',
    fontSize: normalize(14),
    fontFamily: 'Poppins-SemiBold',
  },

  grid: {
    paddingHorizontal: wp(5),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: hp(3),
  },
  tile: {
    width: wp(44),
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: wp(5),
    marginBottom: hp(2),
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  greenTile: { backgroundColor: '#16a34a' },
  amberTile: { backgroundColor: '#f59e0b' },
  blueTile: { backgroundColor: '#2563eb' },
  idPreview: {
    width: wp(24),
    height: wp(16),
    borderRadius: 8,
    marginBottom: hp(1.5),
  },
  tileTitle: {
    fontSize: normalize(16),
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    textAlign: 'center',
    marginTop: hp(1),
  },
  tileSub: {
    fontSize: normalize(12),
    color: '#e0e7ff',
    marginTop: hp(0.5),
    fontFamily: 'Poppins-Regular',
  },
  tileTitleDark: {
    fontSize: normalize(15),
    fontFamily: 'Poppins-SemiBold',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: hp(1.5),
  },
});

export default Home;