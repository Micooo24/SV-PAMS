import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BASE_URL from "../common/baseurl";

export default function AdminDashboard({ navigation }) {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      const keys = ["user_firstname", "user_lastname"];
      const values = await AsyncStorage.multiGet(keys);
      const data = {};
      values.forEach(([k, v]) => v && (data[k.replace("user_", "")] = v));

      setAdmin({
        name: data.firstname || "Admin",
        fullName: `${data.firstname || ""} ${data.lastname || ""}`.trim(),
      });

      // Fetch stats
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/api/admin/vendor/applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const apps = data.applications || [];
        setStats({
          pending: apps.filter((a) => a.status === "pending").length,
          approved: apps.filter((a) => a.status === "approved").length,
          rejected: apps.filter((a) => a.status === "rejected").length,
          total: apps.length,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {admin.name}!</Text>
            <Text style={styles.role}>Administrator Dashboard</Text>
          </View>
          <TouchableOpacity>
            <MaterialCommunityIcons name="account" size={40} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Application Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="file-clock"
              label="Pending"
              value={stats.pending}
              color="#f59e0b"
            />
            <StatCard
              icon="check-circle"
              label="Approved"
              value={stats.approved}
              color="#16a34a"
            />
            <StatCard
              icon="close-circle"
              label="Rejected"
              value={stats.rejected}
              color="#dc2626"
            />
            <StatCard
              icon="file-multiple"
              label="Total"
              value={stats.total}
              color="#2563eb"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("AdminVendorApplications")}
          >
            <View style={styles.actionCardContent}>
              <MaterialCommunityIcons name="folder-open" size={32} color="#2563eb" />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Review Applications</Text>
                <Text style={styles.actionSubtitle}>
                  Approve, reject, or request documents
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              navigation.navigate("AdminVendorApplications", {
                filter: "pending",
              })
            }
          >
            <View style={styles.actionCardContent}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={32}
                color="#f59e0b"
              />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Pending Review</Text>
                <Text style={styles.actionSubtitle}>
                  {stats.pending} applications waiting
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              navigation.navigate("AdminVendorApplications", {
                filter: "approved",
              })
            }
          >
            <View style={styles.actionCardContent}>
              <MaterialCommunityIcons
                name="check-circle"
                size={32}
                color="#16a34a"
              />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Approved Vendors</Text>
                <Text style={styles.actionSubtitle}>
                  {stats.approved} vendors approved
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
          </TouchableOpacity>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ icon, label, value, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
      <MaterialCommunityIcons name={icon} size={28} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  greeting: { fontSize: 24, fontWeight: "bold", color: "#1e293b" },
  role: { fontSize: 14, color: "#64748b", marginTop: 4 },

  statsSection: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 22, fontWeight: "bold", color: "#1e293b" },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 2 },

  actionsSection: { paddingHorizontal: 16, marginBottom: 20 },
  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionCardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  actionText: { marginLeft: 12, flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: "bold", color: "#1e293b" },
  actionSubtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },

  infoSection: { paddingHorizontal: 16 },
  infoCard: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoText: { fontSize: 14, color: "#92400e", flex: 1 },
});
