import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BASE_URL from "../common/baseurl";

export default function AdminVendorApplications({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      const status = filter === "all" ? "" : `?status=${filter}`;

      const res = await fetch(`${BASE_URL}/api/admin/vendor/applications${status}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const handleApprove = async (appId) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/api/admin/vendor/applications/${appId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        Alert.alert("Success", "Application approved!");
        fetchApplications();
        setSelectedApp(null);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to approve application");
    }
  };

  const handleReject = async (appId) => {
    Alert.prompt(
      "Reject Application",
      "Enter rejection reason:",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Reject",
          onPress: async (reason) => {
            if (!reason?.trim()) {
              Alert.alert("Error", "Please enter a rejection reason");
              return;
            }

            try {
              const token = await AsyncStorage.getItem("access_token");
              const res = await fetch(
                `${BASE_URL}/api/admin/vendor/applications/${appId}/reject`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ rejection_reason: reason }),
                }
              );

              if (res.ok) {
                Alert.alert("Success", "Application rejected!");
                fetchApplications();
                setSelectedApp(null);
              }
            } catch (err) {
              Alert.alert("Error", "Failed to reject application");
            }
          },
        },
      ],
      "plain-text"
    );
  };

  if (loading && applications.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  const filteredApps = applications;
  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;

  if (selectedApp) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedApp(null)}
          >
            <Text style={styles.backText}>← Back to List</Text>
          </TouchableOpacity>

          {/* Vendor Photo */}
          {selectedApp.vendor_photo_url && (
            <Image
              source={{ uri: selectedApp.vendor_photo_url }}
              style={styles.heroImage}
            />
          )}

          {/* Vendor Info */}
          <View style={styles.card}>
            <Text style={styles.title}>Vendor Information</Text>
            <InfoRow label="Name" value={`${selectedApp.vendor_firstname} ${selectedApp.vendor_lastname}`} />
            <InfoRow label="Email" value={selectedApp.vendor_email} />
            <InfoRow label="Barangay" value={selectedApp.vendor_barangay} />
            <InfoRow label="Address" value={selectedApp.vendor_address} />
            <InfoRow label="Mobile" value={selectedApp.vendor_mobile_no} />
          </View>

          {/* Business Info */}
          <View style={styles.card}>
            <Text style={styles.title}>Business Information</Text>
            <InfoRow label="Business Name" value={selectedApp.business_name} />
            <InfoRow label="Goods Type" value={selectedApp.goods_type} />
            <InfoRow label="Cart Type" value={selectedApp.cart_type} />
            <InfoRow label="Operating Hours" value={selectedApp.operating_hours || "—"} />
            <InfoRow label="Years in Operation" value={selectedApp.years_in_operation ? `${selectedApp.years_in_operation}+ years` : "—"} />
            <InfoRow label="Area of Operation" value={selectedApp.area_of_operation?.join(", ") || "—"} />
            <InfoRow label="Delivery Capability" value={selectedApp.delivery_capability ? "Available" : "Not Available"} />
          </View>

          {/* Products */}
          {selectedApp.products && selectedApp.products.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.title}>Products & Items</Text>
              {selectedApp.products.map((p, i) => (
                <View key={i} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{p.name}</Text>
                  <Text style={styles.infoValue}>₱{p.price}</Text>
                </View>
              ))}
              {selectedApp.specialty_items && selectedApp.specialty_items.length > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Specialty Items:</Text>
                  <Text style={styles.infoValue}>{selectedApp.specialty_items.join(", ")}</Text>
                </View>
              )}
            </View>
          )}

          {/* Social Media */}
          {selectedApp.social_media && (selectedApp.social_media.facebook || selectedApp.social_media.instagram || selectedApp.social_media.tiktok) && (
            <View style={styles.card}>
              <Text style={styles.title}>Social Media</Text>
              {selectedApp.social_media.facebook && <InfoRow label="Facebook" value={selectedApp.social_media.facebook} />}
              {selectedApp.social_media.instagram && <InfoRow label="Instagram" value={selectedApp.social_media.instagram} />}
              {selectedApp.social_media.tiktok && <InfoRow label="TikTok" value={selectedApp.social_media.tiktok} />}
            </View>
          )}

          {/* Contact Info */}
          <View style={styles.card}>
            <Text style={styles.title}>Contact Information</Text>
            <InfoRow label="Preferred Contact" value={selectedApp.preferred_contact || "Not specified"} />
            <InfoRow label="Completeness" value={`${selectedApp.completeness_percentage}%`} />
          </View>

          {/* Images */}
          <View style={styles.card}>
            <Text style={styles.title}>Images</Text>
            {selectedApp.business_logo_url && (
              <View style={styles.imageItem}>
                <Text style={styles.imageLabel}>Business Logo</Text>
                <Image
                  source={{ uri: selectedApp.business_logo_url }}
                  style={styles.imagePreview}
                />
              </View>
            )}
            {selectedApp.cart_image_url && (
              <View style={styles.imageItem}>
                <Text style={styles.imageLabel}>Cart Image</Text>
                <Image
                  source={{ uri: selectedApp.cart_image_url }}
                  style={styles.imagePreview}
                />
              </View>
            )}
          </View>

          {/* Status & Actions */}
          <View style={styles.card}>
            <Text style={styles.title}>Status: {selectedApp.status.toUpperCase()}</Text>
            {selectedApp.rejection_reason && (
              <Text style={styles.rejectionReason}>
                Reason: {selectedApp.rejection_reason}
              </Text>
            )}

            {selectedApp.status === "pending" && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.button, styles.approveButton]}
                  onPress={() => handleApprove(selectedApp.id)}
                >
                  <Text style={styles.buttonText}>✓ Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.rejectButton]}
                  onPress={() => handleReject(selectedApp.id)}
                >
                  <Text style={styles.buttonText}>✗ Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Pending" value={pendingCount} color="#f59e0b" />
        <StatCard label="Approved" value={approvedCount} color="#16a34a" />
        <StatCard label="Rejected" value={rejectedCount} color="#dc2626" />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {["all", "pending", "approved", "rejected"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredApps.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No applications found</Text>
          </View>
        ) : (
          filteredApps.map((app) => (
            <TouchableOpacity
              key={app.id}
              style={styles.applicationCard}
              onPress={() => setSelectedApp(app)}
            >
              <View style={styles.appHeader}>
                {app.business_logo_url && (
                  <Image
                    source={{ uri: app.business_logo_url }}
                    style={styles.appLogo}
                  />
                )}
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app.business_name}</Text>
                  <Text style={styles.appVendor}>{`${app.vendor_firstname} ${app.vendor_lastname}`}</Text>
                  <Text style={styles.appGoods}>{app.goods_type}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        app.status === "approved"
                          ? "#dcfce7"
                          : app.status === "rejected"
                          ? "#fee2e2"
                          : "#fef3c7",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                          color:
                          app.status === "approved"
                            ? "#16a34a"
                            : app.status === "rejected"
                            ? "#dc2626"
                            : "#b45309",
                        },
                      ]}
                  >
                    {app.status}
                  </Text>
                </View>
              </View>
              <View style={styles.appDetails}>
                <Text style={styles.appDetail}>
                  {app.completeness_percentage}% Complete
                </Text>
                <Text style={styles.appDetail}>
                  {app.vendor_barangay} • {app.cart_type}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value || "—"}</Text>
  </View>
);

const StatCard = ({ label, value, color }) => (
  <View style={[styles.statCard, { borderTopColor: color }]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderTopWidth: 3,
    alignItems: "center",
  },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#1e293b" },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 4 },

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  filterButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterText: { fontSize: 14, color: "#64748b" },
  filterTextActive: { color: "#fff", fontWeight: "600" },

  applicationCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  appLogo: { width: 48, height: 48, borderRadius: 8 },
  appInfo: { flex: 1 },
  appName: { fontSize: 16, fontWeight: "bold", color: "#1e293b" },
  appVendor: { fontSize: 12, color: "#2563eb", marginTop: 2, fontWeight: "500" },
  appGoods: { fontSize: 13, color: "#64748b", marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontSize: 12, fontWeight: "600" },
  appDetails: { marginTop: 8, gap: 4 },
  appDetail: { fontSize: 13, color: "#64748b" },

  backButton: { padding: 16 },
  backText: { color: "#2563eb", fontSize: 16, fontWeight: "600" },

  heroImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 12 },
  infoRow: { marginBottom: 10, flexDirection: "row", justifyContent: "space-between" },
  infoLabel: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  infoValue: { fontSize: 14, color: "#1e293b", fontWeight: "600" },

  imageItem: { marginBottom: 12 },
  imageLabel: { fontSize: 13, color: "#64748b", marginBottom: 6, fontWeight: "500" },
  imagePreview: { width: "100%", height: 150, borderRadius: 8, backgroundColor: "#f1f5f9" },

  rejectionReason: {
    color: "#dc2626",
    fontSize: 14,
    marginBottom: 12,
    fontStyle: "italic",
  },

  actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  approveButton: { backgroundColor: "#16a34a" },
  rejectButton: { backgroundColor: "#dc2626" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#94a3b8", fontSize: 16 },
});
