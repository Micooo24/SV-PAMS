import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BASE_URL from "../common/baseurl";

export default function BusinessInfo({ navigation }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchApplication = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      const res = await fetch(`${BASE_URL}/api/vendor/application`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setApplication(data);
      } else {
        setApplication(null);
      }
    } catch (e) {
      console.log("Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, []);

  const getStatusColor = () => {
    if (!application) return "#94a3b8";
    const status = application.status;
    if (status === "approved") return "#22c55e";
    if (status === "rejected") return "#ef4444";
    return "#f59e0b";
  };

  const getStatusLabel = () => {
    if (!application) return "No Application";
    const completeness = application.completeness_percentage || 0;
    if (application.status === "approved" && completeness >= 90)
      return "Approved - Vendor Access Granted!";
    if (application.status === "approved") return "Approved - Complete Profile to Access";
    if (application.status === "rejected") return "Rejected";
    if (completeness >= 90) return "Ready for Review";
    if (completeness >= 50) return "In Progress";
    return "Incomplete";
  };

  const canAccessVendorDashboard = () => {
    if (!application) return false;
    return application.status === "approved" && application.completeness_percentage >= 90;
  };

  const activateVendorRole = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/api/vendor/activate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await AsyncStorage.setItem("user_role", "vendor");
        Alert.alert("Success!", "Vendor role activated! Please restart the app or navigate to Home.", [
          {
            text: "Go to Home",
            onPress: () => navigation.navigate("Home"),
          },
        ]);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to activate vendor role");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.noDataText}>No application data found.</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("VendorApplyForm")}
        >
          <Text style={styles.primaryButtonText}>Apply Now</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const completeness = application.completeness_percentage || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          {application.business_logo_url ? (
            <Image source={{ uri: application.business_logo_url }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.placeholderText}>LOGO</Text>
            </View>
          )}

          <Text style={styles.businessName}>{application.business_name}</Text>

          <View style={styles.vendorRow}>
            {application.vendor_photo_url ? (
              <Image source={{ uri: application.vendor_photo_url }} style={styles.vendorAvatar} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
            <Text style={styles.vendorText}>Registered Vendor</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusBadgeText}>{getStatusLabel()}</Text>
          </View>
        </View>

        {/* ===== PROGRESS ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completeness}%` }]} />
          </View>
          <Text style={styles.progressText}>{completeness}% complete</Text>
        </View>

        {/* ===== BUSINESS DETAILS ===== */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Business Overview</Text>
          <InfoRow label="Goods Type" value={application.goods_type} />
          <InfoRow label="Cart Type" value={application.cart_type} />
          <InfoRow label="Operating Hours" value={application.operating_hours} />
          <InfoRow
            label="Years in Operation"
            value={application.years_in_operation ? `${application.years_in_operation}+ years` : "—"}
          />
          <InfoRow
            label="Area"
            value={application.area_of_operation?.join(", ") || "—"}
          />
          <InfoRow
            label="Delivery"
            value={application.delivery_capability ? "Available" : "Not Available"}
          />
        </View>

        {/* ===== PRODUCTS ===== */}
        {application.products?.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Products</Text>
            {application.products.map((p, i) => (
              <View key={i} style={styles.productRow}>
                <Text style={styles.productName}>{p.name}</Text>
                <Text style={styles.productPrice}>₱{p.price}</Text>
              </View>
            ))}
            {application.specialty_items?.length > 0 && (
              <Text style={styles.infoValue}>Specialty: {application.specialty_items.join(", ")}</Text>
            )}
          </View>
        )}

        {/* ===== IMAGES ===== */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {application.cart_image_url && (
              <Image source={{ uri: application.cart_image_url }} style={styles.imagePreview} />
            )}
            {application.vendor_photo_url && (
              <Image source={{ uri: application.vendor_photo_url }} style={styles.imagePreview} />
            )}
          </ScrollView>
        </View>

        {/* ===== SOCIAL MEDIA ===== */}
        {application.social_media && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Social Media</Text>
            {application.social_media.facebook && <InfoRow label="Facebook" value={application.social_media.facebook} />}
            {application.social_media.instagram && <InfoRow label="Instagram" value={application.social_media.instagram} />}
            {application.social_media.tiktok && <InfoRow label="TikTok" value={application.social_media.tiktok} />}
            {!application.social_media.facebook && !application.social_media.instagram && !application.social_media.tiktok && (
              <Text style={styles.infoValue}>Not provided</Text>
            )}
          </View>
        )}

        {/* ===== CONTACT ===== */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <InfoRow label="Preferred Method" value={application.preferred_contact || "Not specified"} />
        </View>

        {/* ===== ACTIONS ===== */}
        {(application.status === "pending" || application.status === "rejected") && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              navigation.navigate("VendorApplyForm_NEW", { update: true, data: application })
            }
          >
            <Text style={styles.primaryButtonText}>Update Application</Text>
          </TouchableOpacity>
        )}

        {canAccessVendorDashboard() && (
          <TouchableOpacity style={styles.successButton} onPress={activateVendorRole}>
            <Text style={styles.primaryButtonText}> Accept </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- HELPERS ---------- */
const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value || "—"}</Text>
  </View>
);

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },

  /* HEADER */
  header: { alignItems: "center", marginBottom: 24 },
  logo: { width: 100, height: 100, borderRadius: 16, marginBottom: 12 },
  logoPlaceholder: { width: 100, height: 100, borderRadius: 16, backgroundColor: "#e2e8f0", justifyContent: "center", alignItems: "center" },
  businessName: { fontSize: 24, fontWeight: "bold", color: "#0f172a", marginBottom: 6 },
  vendorRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  vendorAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#cbd5e1", marginRight: 8 },
  vendorText: { fontSize: 14, color: "#475569" },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  statusBadgeText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  /* SECTIONS */
  section: { marginBottom: 24 },
  sectionCard: { backgroundColor: "#fff", padding: 16, borderRadius: 14, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12, color: "#1e293b" },

  /* INFO ROW */
  infoRow: { marginBottom: 10 },
  infoLabel: { fontSize: 14, fontWeight: "500", color: "#64748b", marginBottom: 2 },
  infoValue: { fontSize: 15, color: "#1e293b" },

  /* PRODUCTS */
  productRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  productName: { fontSize: 15, color: "#1e293b" },
  productPrice: { fontSize: 15, fontWeight: "600", color: "#2563eb" },

  /* IMAGES */
  imagePreview: { width: 120, height: 120, borderRadius: 8, backgroundColor: "#f1f5f9", marginRight: 12 },

  /* PROGRESS */
  progressBar: { height: 8, backgroundColor: "#e2e8f0", borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", backgroundColor: "#2563eb" },
  progressText: { fontSize: 14, color: "#64748b", textAlign: "right" },

  /* BUTTONS */
  primaryButton: { backgroundColor: "#2563eb", padding: 16, borderRadius: 14, alignItems: "center", marginBottom: 12 },
  successButton: { backgroundColor: "#16a34a", padding: 16, borderRadius: 14, alignItems: "center", marginBottom: 12 },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  noDataText: { fontSize: 16, color: "#64748b", marginBottom: 16 },
  placeholderText: { fontSize: 12, color: "#94a3b8" },
});
