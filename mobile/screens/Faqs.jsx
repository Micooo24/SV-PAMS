import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useGlobalFonts } from '../hooks/font';

const FAQs = () => {
  const fontsLoaded = useGlobalFonts();
  if (!fontsLoaded) return null;

  const faqList = [
    {
      question: "What is SV-PAMS?",
      answer:
        "SV-PAMS is a digital platform for managing street vendor permits and monitoring compliance with AI-powered tools."
    },
    {
      question: "Who can use the system?",
      answer:
        "The system is designed for vendors, permit officers, field inspectors, and system administrators."
    },
    {
      question: "How does the AI compliance monitoring work?",
      answer:
        "AI analyzes photos captured by field inspectors to detect unauthorized vendors, incorrect locations, and violations."
    },
    {
      question: "Can vendors apply for permits online?",
      answer:
        "Yes, vendors can apply, upload documents, renew, and track permit statuses online or via the mobile app."
    },
    {
      question: "Is the system secure?",
      answer:
        "SV-PAMS uses encrypted communication, role-based access, secure login, and validated backend APIs."
    }
  ];

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <Text style={styles.headerTitle} variant="headlineLarge">
        FAQs
      </Text>

      {/* FAQ List */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        {faqList.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.question} variant="titleMedium">
              {item.question}
            </Text>
            <Text style={styles.answer} variant="bodyMedium">
              {item.answer}
            </Text>
          </View>
        ))}
      </ScrollView>

    </View>
  );
};

export default FAQs;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 50
  },

  headerTitle: {
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#0066CC"
  },

  scrollArea: {
    flex: 1
  },

  card: {
    backgroundColor: "#F5F7FA",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 1
  },

  question: {
    fontFamily: "Poppins-Bold",
    color: "#333",
    marginBottom: 8
  },

  answer: {
    fontFamily: "Poppins-Regular",
    color: "#555",
    lineHeight: 22
  }
});
