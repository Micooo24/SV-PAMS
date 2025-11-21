import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Button } from 'react-native-paper';
import { useGlobalFonts } from '../hooks/font';

const Home = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>SV</Text>
        </View>
        <Text style={styles.title}>SV: PAMS</Text>
        <Text style={styles.subtitle}>Street Vendor: Permit and Monitoring System</Text>
      </View>

      {/* Welcome Message */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Hello, User!</Text>
        <Text style={styles.welcomeSubtext}>Welcome to SV: PAMS</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button 
          mode="contained" 
          icon="account-check"
          style={styles.applyButton}
          labelStyle={styles.buttonLabel}
          onPress={() => navigation.navigate('DocSubmission')}
        >
          Apply as a Vendor
        </Button>
      </View>

            <View style={styles.quickActions}>
        <Button 
          mode="contained" 
          icon="cart"
          style={styles.applyButton}
          labelStyle={styles.buttonLabel}
          onPress={() => navigation.navigate('VendorCarts')}
        >
          Report Vendor Carts
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 20 },
  logoCircle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#2563eb', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  logoText: { fontSize: 40, fontFamily: 'Poppins-Bold', color: '#fff' },
  title: { 
    fontSize: 42, 
    fontFamily: 'Poppins-Bold', 
    color: '#1e293b', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    fontFamily: 'Poppins-Regular', 
    color: '#64748b', 
    textAlign: 'center', 
    paddingHorizontal: 40 
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 24,
    backgroundColor: '#f8fafc',
    marginHorizontal: 24,
    borderRadius: 16,
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
  },
  quickActions: { 
    paddingHorizontal: 24, 
    marginTop: 30,
    gap: 16,
  },
  applyButton: { 
    backgroundColor: '#2563eb', 
    borderRadius: 12, 
    paddingVertical: 8,
    elevation: 2,
  },
  navButton: { 
    borderColor: '#2563eb',
    borderWidth: 2,
    borderRadius: 12, 
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  outlineButtonLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#2563eb',
  },
});

export default Home;