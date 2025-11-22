import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FloatingNavBar from "../components/FloatingNavBar";

const Notifications = ({ navigation }) => {
  const [filter, setFilter] = useState("all");

  const notifications = [
    {
      id: 1,
      type: "success",
      icon: "checkmark-circle",
      color: "#10b981",
      title: "Document Approved",
      message: "Your business permit has been approved and verified.",
      time: "2 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "warning",
      icon: "alert-circle",
      color: "#f59e0b",
      title: "Action Required",
      message: "Please update your vendor cart location information.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "info",
      icon: "information-circle",
      color: "#3b82f6",
      title: "System Update",
      message: "New AI features have been added to document verification.",
      time: "3 hours ago",
      read: true,
    },
    {
      id: 4,
      type: "success",
      icon: "shield-checkmark",
      color: "#10b981",
      title: "Verification Complete",
      message: "Your profile has been successfully verified by the system.",
      time: "Yesterday",
      read: true,
    },
    {
      id: 5,
      type: "alert",
      icon: "warning",
      color: "#ef4444",
      title: "Permit Expiring Soon",
      message: "Your vendor permit will expire in 30 days. Please renew.",
      time: "2 days ago",
      read: true,
    },
    {
      id: 6,
      type: "info",
      icon: "document-text",
      color: "#8b5cf6",
      title: "New Document Submitted",
      message: "Your sanitary permit has been submitted for review.",
      time: "3 days ago",
      read: true,
    },
    {
      id: 7,
      type: "success",
      icon: "cart",
      color: "#10b981",
      title: "Cart Detected",
      message: "Your vendor cart was successfully detected and verified.",
      time: "1 week ago",
      read: true,
    },
  ];

  const filterButtons = [
    { key: "all", label: "All", icon: "apps" },
    { key: "unread", label: "Unread", icon: "mail-unread" },
    { key: "success", label: "Success", icon: "checkmark-circle" },
    { key: "alert", label: "Alerts", icon: "warning" },
  ];

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notif.read;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterButtons.map((btn) => (
            <TouchableOpacity
              key={btn.key}
              style={[
                styles.filterButton,
                filter === btn.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(btn.key)}
            >
              <Ionicons
                name={btn.icon}
                size={18}
                color={filter === btn.key ? "#fff" : "#64748b"}
              />
              <Text
                style={[
                  styles.filterText,
                  filter === btn.key && styles.filterTextActive,
                ]}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={80} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              You're all caught up! Check back later for updates.
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[
                styles.notificationCard,
                !notif.read && styles.unreadCard,
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: notif.color + "15" },
                ]}
              >
                <Ionicons name={notif.icon} size={24} color={notif.color} />
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notif.title}</Text>
                  {!notif.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage}>{notif.message}</Text>
                <View style={styles.notificationFooter}>
                  <Ionicons name="time-outline" size={14} color="#94a3b8" />
                  <Text style={styles.notificationTime}>{notif.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderTop: 50,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  badge: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    gap: 6,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#2563eb",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  filterTextActive: {
    color: "#fff",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#94a3b8",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

export default Notifications;
