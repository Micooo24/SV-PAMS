import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  Dimensions 
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { useGlobalFonts } from '../hooks/font';

const { width } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();

  if (!fontsLoaded) {
    return null;
  }

  const features = [
    {
      icon: 'file-document-edit',
      title: 'Vendor Permit Application',
      description: 'Streamlined permit application and management system for vendors',
      color: '#3b82f6',
    },
    {
      icon: 'robot',
      title: 'AI-Powered Monitoring',
      description: 'Intelligent monitoring system for vendor compliance and violations',
      color: '#2563eb',
    },
    {
      icon: 'monitor-dashboard',
      title: 'Web Dashboard',
      description: 'Comprehensive admin dashboard for complete system oversight',
      color: '#1d4ed8',
    },
    {
      icon: 'cellphone',
      title: 'Mobile Monitoring',
      description: 'Real-time on-the-ground monitoring via mobile application',
      color: '#1e40af',
    },
    {
      icon: 'shield-lock',
      title: 'Secure Access Control',
      description: 'Role-based authentication with advanced security protocols',
      color: '#1e3a8a',
    },
    {
      icon: 'sync',
      title: 'Real-Time Sync',
      description: 'Seamless synchronization across web, mobile, and backend',
      color: '#172554',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>SV</Text>
            </View>
          </View>
          <Text style={styles.title}>SV: PAMS</Text>
          <Text style={styles.subtitle}>
            Street Vendor: Permit and Monitoring System
          </Text>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to the Future</Text>
          <Text style={styles.welcomeSubtitle}>
            Revolutionizing street vendor management through technology
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          
          {features.map((feature, index) => (
            <View 
              key={index} 
              style={[
                styles.featureCard,
                index === features.length - 1 && styles.lastFeatureCard
              ]}
            >
              <View style={styles.featureContent}>
                <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
                  <IconButton
                    icon={feature.icon}
                    iconColor="#fff"
                    size={28}
                  />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Empowering communities through smart governance
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // Header Styles
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  title: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 280,
  },

  // Welcome Section
  welcomeSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#f8fafc',
    marginTop: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Features Section
  featuresSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lastFeatureCard: {
    marginBottom: 0,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
    paddingTop: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    lineHeight: 20,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#94a3b8',
  },
});

export default Home;