import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FloatingNavBar from "../components/FloatingNavBar";

const Support = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [message, setMessage] = useState("");

  const supportCategories = [
    {
      id: 1,
      icon: "document-text",
      title: "Document Issues",
      description: "Problems with document submission or verification",
      color: "#3b82f6",
    },
    {
      id: 2,
      icon: "person",
      title: "Account Help",
      description: "Login, registration, or profile issues",
      color: "#8b5cf6",
    },
    {
      id: 3,
      icon: "card",
      title: "Permit Problems",
      description: "Issues with permits or approvals",
      color: "#10b981",
    },
    {
      id: 4,
      icon: "bug",
      title: "Technical Issues",
      description: "App crashes, bugs, or errors",
      color: "#ef4444",
    },
    {
      id: 5,
      icon: "help-circle",
      title: "General Inquiry",
      description: "Other questions or concerns",
      color: "#f59e0b",
    },
  ];

  const faqs = [
    {
      question: "How long does document verification take?",
      answer:
        "AI-powered verification typically takes 2-5 minutes. Complex documents may take up to 24 hours for manual review.",
    },
    {
      question: "What documents do I need to submit?",
      answer:
        "You need to submit: Business Permit, Sanitary Permit, Barangay Clearance, and Valid ID. All documents should be clear and legible.",
    },
    {
      question: "How do I update my personal information?",
      answer:
        "Go to Profile > Personal Information > Edit. Make your changes and tap Save. Some changes may require verification.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes! We use bank-level encryption and comply with data protection regulations. Your information is never shared without consent.",
    },
    {
      question: "Can I track my application status?",
      answer:
        "Yes! Visit the History section to view all your submissions and their current status in real-time.",
    },
  ];

  const contactOptions = [
    {
      icon: "call",
      title: "Phone Support",
      subtitle: "+63 912 345 6789",
      action: () => Linking.openURL("tel:+639123456789"),
      color: "#10b981",
    },
    {
      icon: "mail",
      title: "Email Us",
      subtitle: "support@svpams.com",
      action: () => Linking.openURL("mailto:support@svpams.com"),
      color: "#3b82f6",
    },
    {
      icon: "chatbubbles",
      title: "Live Chat",
      subtitle: "Available 24/7",
      action: () => Alert.alert("Live Chat", "Chat feature coming soon!"),
      color: "#8b5cf6",
    },
    {
      icon: "logo-facebook",
      title: "Facebook",
      subtitle: "SV-PAMS Official",
      action: () => Linking.openURL("https://facebook.com"),
      color: "#1877f2",
    },
  ];

  const handleSubmit = () => {
    if (!selectedCategory) {
      Alert.alert("Select Category", "Please select a support category first.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Message Required", "Please describe your issue.");
      return;
    }
    Alert.alert(
      "Support Request Sent",
      "Our team will respond within 24 hours. Check your email for updates.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="headset" size={40} color="#2563eb" />
          </View>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            Get support from our team or find answers in our FAQ
          </Text>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactCard}
                onPress={option.action}
              >
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: option.color + "15" },
                  ]}
                >
                  <Ionicons name={option.icon} size={24} color={option.color} />
                </View>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Support Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Select Category</Text>
            <View style={styles.categoryContainer}>
              {supportCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id &&
                      styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Ionicons
                    name={category.icon}
                    size={18}
                    color={
                      selectedCategory === category.id ? "#fff" : category.color
                    }
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Describe Your Issue</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={6}
              placeholder="Tell us what you need help with..."
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Request</Text>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqCard}>
              <View style={styles.faqHeader}>
                <Ionicons
                  name="help-circle"
                  size={20}
                  color="#2563eb"
                  style={styles.faqIcon}
                />
                <Text style={styles.faqQuestion}>{faq.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Helpful Resources</Text>
          <TouchableOpacity style={styles.linkCard}>
            <Ionicons name="book" size={24} color="#3b82f6" />
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>User Guide</Text>
              <Text style={styles.linkSubtitle}>
                Complete app documentation
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkCard}>
            <Ionicons name="videocam" size={24} color="#ef4444" />
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>Video Tutorials</Text>
              <Text style={styles.linkSubtitle}>Learn how to use SV-PAMS</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkCard}>
            <Ionicons name="chatbubbles" size={24} color="#10b981" />
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>Community Forum</Text>
              <Text style={styles.linkSubtitle}>
                Connect with other vendors
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FloatingNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroSection: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  contactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  contactCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
    textAlign: "center",
  },
  contactSubtitle: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  categoryTextActive: {
    color: "#fff",
  },
  textArea: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
    minHeight: 120,
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  faqCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  faqIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    paddingLeft: 28,
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  linkContent: {
    flex: 1,
    marginLeft: 12,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  linkSubtitle: {
    fontSize: 13,
    color: "#64748b",
  },
});

export default Support;
