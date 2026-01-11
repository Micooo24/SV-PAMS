import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BASE_URL from "../common/baseurl";

export default function VendorDetailScreen({ navigation, route }) {
  const { vendorId } = route.params;
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorDetail();
  }, [vendorId]);

  const fetchVendorDetail = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/vendors/${vendorId}`);
      if (res.ok) {
        const data = await res.json();
        setVendor(data);
      }
    } catch (err) {
      console.log("Failed to load vendor details");
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleSocialMedia = (platform, handle) => {
    if (!handle) return;
    
    let url = "";
    if (platform === "facebook") {
      url = `https://facebook.com/${handle}`;
    } else if (platform === "instagram") {
      url = `https://instagram.com/${handle}`;
    } else if (platform === "tiktok") {
      url = `https://tiktok.com/@${handle}`;
    }
    
    if (url) {
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  if (!vendor) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Vendor not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        {vendor.vendor_photo_url && (
          <Image source={{ uri: vendor.vendor_photo_url }} style={styles.headerImage} />
        )}

        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>

        {/* Business Header */}
        <View style={styles.header}>
          {vendor.business_logo_url ? (
            <Image source={{ uri: vendor.business_logo_url }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoPlaceholderText}>📦</Text>
            </View>
          )}
          <Text style={styles.businessName}>{vendor.business_name}</Text>
          <Text style={styles.vendorName}>by {vendor.vendor_name}</Text>
          
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{vendor.goods_type}</Text>
            </View>
            {vendor.delivery_capability && (
              <View style={[styles.tag, styles.tagDelivery]}>
                <Text style={styles.tagTextDelivery}>🚚 Delivers</Text>
              </View>
            )}
          </View>
        </View>

        {/* Business Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          <InfoRow label="Cart Type" value={vendor.cart_type} />
          <InfoRow label="Operating Hours" value={vendor.operating_hours || "—"} />
          <InfoRow label="Years in Business" value={vendor.years_in_operation ? `${vendor.years_in_operation}+ years` : "—"} />
          <InfoRow label="Service Area" value={vendor.area_of_operation?.join(", ") || "—"} />
          <InfoRow label="Location" value={vendor.vendor_barangay || "—"} />
        </View>

        {/* Products */}
        {vendor.products && vendor.products.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Menu / Products</Text>
            {vendor.products.map((product, index) => (
              <View key={index} style={styles.productRow}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>₱{product.price}</Text>
              </View>
            ))}
            {vendor.specialty_items && vendor.specialty_items.length > 0 && (
              <View style={styles.specialtyBox}>
                <Text style={styles.specialtyLabel}>Specialty Items:</Text>
                <Text style={styles.specialtyText}>{vendor.specialty_items.join(", ")}</Text>
              </View>
            )}
          </View>
        )}

        {/* Cart Image */}
        {vendor.cart_image_url && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cart Preview</Text>
            <Image source={{ uri: vendor.cart_image_url }} style={styles.cartImage} />
          </View>
        )}

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <InfoRow label="Preferred Contact" value={vendor.preferred_contact || "Not specified"} />
          
          {vendor.vendor_mobile_no && (
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => handleCall(vendor.vendor_mobile_no)}
            >
              <Text style={styles.contactButtonText}>📞 Call {vendor.vendor_mobile_no}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Social Media */}
        {vendor.social_media && (vendor.social_media.facebook || vendor.social_media.instagram || vendor.social_media.tiktok) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Media</Text>
            <View style={styles.socialButtons}>
              {vendor.social_media.facebook && (
                <TouchableOpacity 
                  style={[styles.socialButton, styles.facebook]}
                  onPress={() => handleSocialMedia("facebook", vendor.social_media.facebook)}
                >
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </TouchableOpacity>
              )}
              {vendor.social_media.instagram && (
                <TouchableOpacity 
                  style={[styles.socialButton, styles.instagram]}
                  onPress={() => handleSocialMedia("instagram", vendor.social_media.instagram)}
                >
                  <Text style={styles.socialButtonText}>Instagram</Text>
                </TouchableOpacity>
              )}
              {vendor.social_media.tiktok && (
                <TouchableOpacity 
                  style={[styles.socialButton, styles.tiktok]}
                  onPress={() => handleSocialMedia("tiktok", vendor.social_media.tiktok)}
                >
                  <Text style={styles.socialButtonText}>TikTok</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  
  headerImage: { width: "100%", height: 200, resizeMode: "cover" },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backBtnText: { fontSize: 16, color: "#2563eb", fontWeight: "600" },

  header: { alignItems: "center", padding: 20, backgroundColor: "#fff" },
  logo: { width: 100, height: 100, borderRadius: 16, marginBottom: 12 },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoPlaceholderText: { fontSize: 40 },
  businessName: { fontSize: 24, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
  vendorName: { fontSize: 14, color: "#64748b", marginBottom: 12 },
  tags: { flexDirection: "row", gap: 8 },
  tag: { backgroundColor: "#f1f5f9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 13, color: "#64748b", fontWeight: "600" },
  tagDelivery: { backgroundColor: "#dcfce7" },
  tagTextDelivery: { fontSize: 13, color: "#16a34a", fontWeight: "600" },

  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 12 },
  
  infoRow: { marginBottom: 10 },
  infoLabel: { fontSize: 14, color: "#64748b", fontWeight: "500", marginBottom: 2 },
  infoValue: { fontSize: 15, color: "#1e293b" },

  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  productName: { fontSize: 15, color: "#1e293b" },
  productPrice: { fontSize: 15, fontWeight: "600", color: "#2563eb" },
  
  specialtyBox: { marginTop: 12, padding: 12, backgroundColor: "#fef3c7", borderRadius: 8 },
  specialtyLabel: { fontSize: 13, fontWeight: "600", color: "#b45309", marginBottom: 4 },
  specialtyText: { fontSize: 13, color: "#92400e" },

  cartImage: { width: "100%", height: 200, borderRadius: 12 },

  contactButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  contactButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  socialButtons: { flexDirection: "row", gap: 8 },
  socialButton: { flex: 1, padding: 12, borderRadius: 12, alignItems: "center" },
  socialButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  facebook: { backgroundColor: "#1877f2" },
  instagram: { backgroundColor: "#e4405f" },
  tiktok: { backgroundColor: "#000" },

  errorText: { fontSize: 16, color: "#64748b", marginBottom: 16 },
  backButton: { backgroundColor: "#2563eb", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
