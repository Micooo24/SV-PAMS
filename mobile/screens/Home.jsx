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

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button 
          mode="contained" 
          icon="file-document-multiple"
          style={styles.navButton}
          onPress={() => navigation.navigate('DocSubmission')}
        >
          Document Comparison
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  logoText: { fontSize: 40, fontFamily: 'Poppins-Bold', color: '#fff' },
  title: { fontSize: 42, fontFamily: 'Poppins-Bold', color: '#1e293b', marginBottom: 8 },
  subtitle: { fontSize: 16, fontFamily: 'Poppins-Regular', color: '#64748b', textAlign: 'center', paddingHorizontal: 40 },
  quickActions: { paddingHorizontal: 24, marginTop: 40 },
  navButton: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 8 },
});

export default Home;