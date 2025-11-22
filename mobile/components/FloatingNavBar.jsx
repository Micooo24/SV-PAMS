import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const FloatingNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const navItems = [
    { name: "Home", icon: "home", screen: "Home" },
    { name: "Carts", icon: "cart", screen: "VendorCarts" },
    { name: "Docs", icon: "document-text", screen: "DocSubmission" },
    { name: "Profile", icon: "person", screen: "Profile" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        {navItems.map((item, index) => {
          const isActive = route.name === item.screen;
          return (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  isActive && styles.activeIconContainer,
                ]}
              >
                <Ionicons
                  name={isActive ? item.icon : `${item.icon}-outline`}
                  size={26}
                  color={isActive ? "#118df0" : "#6683a4"}
                />
              </View>
              <Text style={[styles.navText, isActive && styles.activeNavText]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    paddingHorizontal: 16,
    zIndex: 1000,
    backgroundColor: "transparent",
  },
  navbar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#002248",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#e6eaf0",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  activeIconContainer: {
    backgroundColor: "#e6eaf0",
  },
  navText: {
    fontSize: 11,
    color: "#6683a4",
    marginTop: 2,
    fontWeight: "500",
  },
  activeNavText: {
    color: "#118df0",
    fontWeight: "700",
  },
});

export default FloatingNavBar;
