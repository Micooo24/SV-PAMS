import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BASE_URL from "../common/baseurl";

export default function VendorListScreen({ navigation, route }) {
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");

  useEffect(() => {
    fetchCategories();
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [selectedCategory, deliveryFilter]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/vendors/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.log("Failed to load categories");
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      let url = `${BASE_URL}/api/vendors/list?`;
      
      if (selectedCategory !== "all") {
        url += `goods_type=${encodeURIComponent(selectedCategory)}&`;
      }
      
      if (deliveryFilter === "delivery") {
        url += `delivery_capable=true&`;
      } else if (deliveryFilter === "no-delivery") {
        url += `delivery_capable=false&`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setVendors(data.vendors || []);
      }
    } catch (err) {
      console.log("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

 const renderVendorCard = ({ item }) => (
  <TouchableOpacity
    style={styles.vendorCard}
    onPress={() => navigation.navigate("VendorDetail", { vendorId: item.id })}
  >
    <View style={styles.cardContent}>
      {item.business_logo_url ? (
        <Image source={{ uri: item.business_logo_url }} style={styles.vendorLogo} />
      ) : (
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>📦</Text>
        </View>
      )}
      
      <View style={styles.vendorInfo}>
        <Text style={styles.businessName}>{item.business_name}</Text>
        <Text style={styles.goodsType}>{item.goods_type}</Text>
        <Text style={styles.location}>📍 {item.vendor_barangay || "Unknown"}</Text>
        
        <View style={styles.badges}>
          {item.delivery_capability && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🚚 Delivery</Text>
            </View>
          )}
          {item.years_in_operation != null && (
            <View style={[styles.badge, styles.badgeSecondary]}>
              <Text style={styles.badgeTextSecondary}>
                {item.years_in_operation}+ years
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <Text style={styles.arrow}>›</Text>
    </View>
  </TouchableOpacity>
);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Vendors</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, selectedCategory === "all" && styles.filterChipActive]}
          onPress={() => setSelectedCategory("all")}
        >
          <Text style={[styles.filterText, selectedCategory === "all" && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Delivery Filter */}
      <View style={styles.deliveryFilter}>
        <TouchableOpacity
          style={[styles.deliveryChip, deliveryFilter === "all" && styles.deliveryChipActive]}
          onPress={() => setDeliveryFilter("all")}
        >
          <Text style={[styles.deliveryText, deliveryFilter === "all" && styles.deliveryTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deliveryChip, deliveryFilter === "delivery" && styles.deliveryChipActive]}
          onPress={() => setDeliveryFilter("delivery")}
        >
          <Text style={[styles.deliveryText, deliveryFilter === "delivery" && styles.deliveryTextActive]}>
            🚚 Delivers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deliveryChip, deliveryFilter === "no-delivery" && styles.deliveryChipActive]}
          onPress={() => setDeliveryFilter("no-delivery")}
        >
          <Text style={[styles.deliveryText, deliveryFilter === "no-delivery" && styles.deliveryTextActive]}>
            Pickup Only
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vendor List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : vendors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No vendors found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
        </View>
      ) : (
        <FlatList
          data={vendors}
          renderItem={renderVendorCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: { width: 60 },
  backText: { fontSize: 18, color: "#2563eb", fontWeight: "600" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },

  filterScroll: { maxHeight: 60, backgroundColor: "#fff" },
  filterContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: "#2563eb" },
  filterText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
  filterTextActive: { color: "#fff", fontWeight: "600" },

  deliveryFilter: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  deliveryChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  deliveryChipActive: { backgroundColor: "#dcfce7" },
  deliveryText: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  deliveryTextActive: { color: "#16a34a", fontWeight: "600" },

  listContent: { padding: 16, paddingBottom: 100 },
  vendorCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: { flexDirection: "row", padding: 12, alignItems: "center" },
  vendorLogo: { width: 60, height: 60, borderRadius: 12 },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: { fontSize: 24 },
  vendorInfo: { flex: 1, marginLeft: 12 },
  businessName: { fontSize: 16, fontWeight: "bold", color: "#1e293b", marginBottom: 2 },
  goodsType: { fontSize: 13, color: "#64748b", marginBottom: 4 },
  location: { fontSize: 12, color: "#94a3b8", marginBottom: 6 },
  badges: { flexDirection: "row", gap: 6 },
  badge: { backgroundColor: "#dcfce7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, color: "#16a34a", fontWeight: "600" },
  badgeSecondary: { backgroundColor: "#dbeafe" },
  badgeTextSecondary: { fontSize: 11, color: "#2563eb", fontWeight: "600" },
  arrow: { fontSize: 24, color: "#cbd5e1" },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#64748b", marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: "#94a3b8" },
});
