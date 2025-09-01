import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useGlobalFonts } from '../hooks/font';

const { width } = Dimensions.get('window');

const Welcome = ({ navigation }) => {
  const fontsLoaded = useGlobalFonts();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef(null);

  if (!fontsLoaded) {
    return null;
  }

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    setCurrentPage(page);
  };

  const scrollToPage = (page) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: page * width, animated: true });
    }
  };

  const pages = [
    {
      title: "Digital Permit Management",
      description: "Vendors can apply, renew, and track their permits online through a simple web or mobile interface. This reduces paperwork, minimizes delays, and provides government agencies with a centralized record of all active and expired permits.",
      image: require('../assets/images/permit.png')
    },
    {
      title: "AI-Powered Compliance Monitoring",
      description: "The system uses AI tools to analyze vendor activities and detect potential violations, such as unregistered vendors or those operating outside designated areas. This helps authorities ensure fair enforcement and maintain order in urban spaces.",
      image: require('../assets/images/ai.png')
    },
    {
      title: "Centralized Dashboard & Reporting",
      description: "Government agencies can access a unified dashboard that displays vendor data, compliance status, and real-time reports. This supports data-driven decision-making and improves transparency in managing street vending operations.",
      image: require('../assets/images/dashboard.png')
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {pages.map((page, index) => (
          <View key={index} style={styles.page}>
            <View style={styles.contentContainer}>
              {/* Logo/Title - SV PAMS on every page */}
              <View style={styles.logoContainer}>
                <Text variant="headlineLarge" style={styles.logoText}>SV: PAMS</Text>
              </View>

              {/* Illustration */}
              <View style={styles.illustrationContainer}>
                <Image 
                  source={page.image} 
                  style={styles.illustration}
                  resizeMode="contain"
                />
              </View>

              {/* Page Title */}
              <Text variant="headlineSmall" style={styles.pageTitle}>{page.title}</Text>

              {/* Description */}
              <Text variant="bodyMedium" style={styles.description}>
                {page.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentPage === index && styles.activeDot
            ]}
            onTouchEnd={() => scrollToPage(index)}
          />
        ))}
      </View>

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          style={styles.button}
          labelStyle={styles.buttonText}
          onPress={() => navigation && navigation.navigate('Register')}
        >
          Sign up
        </Button>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already a Member? </Text>
          <Text
            style={styles.loginLink}
            onPress={() => navigation && navigation.navigate('Login')}
          >
            Login here.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: width,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  logoContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  logoText: {
    fontFamily: 'Poppins-Bold',
    color: '#2563eb',
    textAlign: 'center',
  },
  pageTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  illustrationContainer: {
    marginBottom: 24,
  },
  illustration: {
    width: 300,
    height: 250,
  },
  description: {
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
    color: '#444',
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#2563eb',
    width: 24,
    borderRadius: 4,
  },
  bottomContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  button: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 4,
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    color: '#2563eb',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Welcome;