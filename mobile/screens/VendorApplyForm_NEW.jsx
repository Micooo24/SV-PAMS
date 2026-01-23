import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import BASE_URL from "../common/baseurl.js";

/* ---------------- OPTIONS ---------------- */
const goodsOptions = [
  "Street Food",
  "Snacks",
  "Beverages",
  "Fruits & Vegetables",
  "Clothing",
  "Accessories",
  "Others",
];
const cartOptions = ["Push Cart", "Food Stall", "Kiosk", "Table Setup", "None"];
const areaOptions = ["School", "Market", "Streets", "Mall"];
const specialtyOptions = ["Vegetarian", "Halal", "Gluten-Free"];
const contactOptions = ["SMS", "Email", "Call"];
const yearsOptions = ["< 1 year", "1-2 years", "3-5 years", "5+ years"];

const VendorApplyForm = ({ navigation, route }) => {
  const isUpdate = route?.params?.update || false;
  const existingData = route?.params?.data || null;

  // Slot Availability & Eligibility State
  const [slotAvailability, setSlotAvailability] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  // Helper to convert years number back to text
  const getYearsText = (num) => {
    if (num === null || num === undefined) return "";
    if (num === 0) return "< 1 year";
    if (num === 1) return "1-2 years";
    if (num === 3) return "3-5 years";
    if (num >= 5) return "5+ years";
    return "";
  };

  // Basic Info
  const [businessName, setBusinessName] = useState(
    existingData?.business_name || "",
  );
  const [goodsType, setGoodsType] = useState(existingData?.goods_type || "");
  const [cartType, setCartType] = useState(existingData?.cart_type || "");
  const [operatingHours, setOperatingHours] = useState(
    existingData?.operating_hours || "",
  );

  // NEW: Years in operation
  const [yearsInOperation, setYearsInOperation] = useState(
    getYearsText(existingData?.years_in_operation),
  );

  // Area & Delivery
  const [areaOfOperation, setAreaOfOperation] = useState(
    existingData?.area_of_operation || [],
  );
  const [deliveryCapability, setDeliveryCapability] = useState(
    existingData?.delivery_capability || false,
  );

  // Products
  const [products, setProducts] = useState(
    existingData?.products && existingData.products.length > 0
      ? existingData.products
      : [{ name: "", category: "", price: "" }],
  );
  const [specialtyItems, setSpecialtyItems] = useState(
    existingData?.specialty_items || [],
  );

  // Contact
  const [preferredContact, setPreferredContact] = useState(
    existingData?.preferred_contact || "SMS",
  );

  // NEW: Social Media
  const [facebook, setFacebook] = useState(
    existingData?.social_media?.facebook || "",
  );
  const [instagram, setInstagram] = useState(
    existingData?.social_media?.instagram || "",
  );
  const [tiktok, setTiktok] = useState(
    existingData?.social_media?.tiktok || "",
  );

  // NEW: Images - use existing URLs if available
  const [businessLogo, setBusinessLogo] = useState(
    existingData?.business_logo_url || null,
  );
  const [cartImage, setCartImage] = useState(
    existingData?.cart_image_url || null,
  );
  const [vendorPhoto, setVendorPhoto] = useState(
    existingData?.vendor_photo_url || null,
  );

  const [loading, setLoading] = useState(false);

  // Check slot availability and eligibility on mount
  useEffect(() => {
    checkSlotAvailabilityAndEligibility();
  }, []);

  const checkSlotAvailabilityAndEligibility = async () => {
    try {
      setCheckingEligibility(true);
      const token = await AsyncStorage.getItem("access_token");

      // Fetch slot availability
      const slotResponse = await fetch(
        `${BASE_URL}/api/vendor/slots/availability`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const slotData = await slotResponse.json();
      setSlotAvailability(slotData);

      // Fetch eligibility
      const eligibilityResponse = await fetch(
        `${BASE_URL}/api/vendor/eligibility`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const eligibilityData = await eligibilityResponse.json();
      setEligibility(eligibilityData);
    } catch (err) {
      console.error("Failed to check eligibility:", err);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const toggleMultiSelect = (value, state, setState) => {
    if (state.includes(value)) setState(state.filter((v) => v !== value));
    else setState([...state, value]);
  };

  // Image Picker
  const pickImage = async (setImage) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Upload image to Cloudinary or your backend
  const uploadImage = async (imageUri) => {
    if (!imageUri) return null;

    // If it's already a URL (existing image), don't upload again
    if (imageUri.startsWith("http://") || imageUri.startsWith("https://")) {
      return imageUri;
    }

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "upload.jpg",
      });

      const token = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/api/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.url;
    } catch (err) {
      console.error("Image upload error:", err);
      return imageUri; // Return original if upload fails
    }
  };

  const handleSubmit = async () => {
    if (!businessName || !goodsType || !cartType) {
      Alert.alert("Incomplete Form", "Please fill out required fields.");
      return;
    }

    // Require images before submission
    if (!businessLogo || !cartImage || !vendorPhoto) {
      Alert.alert(
        "Images Required",
        "Please upload all required images:\n• Business Logo\n• Cart/Stall Image\n• Your Photo",
      );
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");

      // Upload images if selected (or keep existing URLs)
      const businessLogoUrl = await uploadImage(businessLogo);
      const cartImageUrl = await uploadImage(cartImage);
      const vendorPhotoUrl = await uploadImage(vendorPhoto);

      // Verify uploads succeeded
      if (!businessLogoUrl || !cartImageUrl || !vendorPhotoUrl) {
        Alert.alert(
          "Upload Failed",
          "Failed to upload one or more images. Please try again.",
        );
        return;
      }

      // Convert years text to number
      let yearsNum = null;
      if (yearsInOperation === "< 1 year") yearsNum = 0;
      else if (yearsInOperation === "1-2 years") yearsNum = 1;
      else if (yearsInOperation === "3-5 years") yearsNum = 3;
      else if (yearsInOperation === "5+ years") yearsNum = 5;

      const endpoint = isUpdate
        ? `${BASE_URL}/api/vendor/application`
        : `${BASE_URL}/api/vendor/apply`;

      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_name: businessName,
          goods_type: goodsType,
          cart_type: cartType,
          operating_hours: operatingHours,
          area_of_operation: areaOfOperation,
          delivery_capability: deliveryCapability,
          products: products.map((p) => ({
            name: p.name,
            category: p.category || goodsType,
            price: Number(p.price) || 0,
          })),
          specialty_items: specialtyItems,
          preferred_contact: preferredContact,
          years_in_operation: yearsNum,
          social_media: {
            facebook: facebook || null,
            instagram: instagram || null,
            tiktok: tiktok || null,
          },
          business_logo_url: businessLogoUrl,
          cart_image_url: cartImageUrl,
          vendor_photo_url: vendorPhotoUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.detail || "Something went wrong");
        return;
      }

      const successMessage = isUpdate
        ? "Application updated successfully!"
        : "Application submitted successfully!";

      Alert.alert("Success", successMessage, [
        { text: "OK", onPress: () => navigation.replace("BusinessInfo") },
      ]);
    } catch (err) {
      Alert.alert("Network Error", "Unable to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.mainTitle}>
          {isUpdate ? "Update Application" : "Apply as Street Vendor"}
        </Text>
        {isUpdate && (
          <Text style={styles.updateHint}>
            Previously filled fields are pre-loaded. Update what you need.
          </Text>
        )}

        {/* SLOT AVAILABILITY & ELIGIBILITY CHECK */}
        {checkingEligibility ? (
          <View style={styles.eligibilityCard}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.eligibilityText}>Checking availability...</Text>
          </View>
        ) : (
          <>
            {/* Slot Availability Card */}
            {slotAvailability && (
              <View
                style={[
                  styles.slotCard,
                  {
                    backgroundColor: slotAvailability.is_accepting
                      ? "#dcfce7"
                      : "#fee2e2",
                  },
                ]}
              >
                <View style={styles.slotHeader}>
                  <Text style={styles.slotTitle}>
                    {slotAvailability.is_accepting
                      ? "✅ Slots Available"
                      : "❌ No Slots Available"}
                  </Text>
                </View>
                <View style={styles.slotStats}>
                  <View style={styles.slotStat}>
                    <Text style={styles.slotNumber}>
                      {slotAvailability.available_slots}
                    </Text>
                    <Text style={styles.slotLabel}>Available</Text>
                  </View>
                  <View style={styles.slotStat}>
                    <Text style={styles.slotNumber}>
                      {slotAvailability.used_slots}
                    </Text>
                    <Text style={styles.slotLabel}>Used</Text>
                  </View>
                  <View style={styles.slotStat}>
                    <Text style={styles.slotNumber}>
                      {slotAvailability.total_slots}
                    </Text>
                    <Text style={styles.slotLabel}>Total</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Eligibility Status Card */}
            {eligibility && !isUpdate && (
              <View
                style={[
                  styles.eligibilityCard,
                  {
                    backgroundColor: eligibility.is_eligible
                      ? "#dcfce7"
                      : "#fef3c7",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.eligibilityTitle,
                    { color: eligibility.is_eligible ? "#166534" : "#92400e" },
                  ]}
                >
                  {eligibility.is_eligible
                    ? "✅ You are eligible to apply!"
                    : "⚠️ Eligibility Check"}
                </Text>
                <Text style={styles.eligibilityMessage}>
                  {eligibility.message}
                </Text>

                {/* Criteria Checklist */}
                <View style={styles.criteriaList}>
                  {Object.entries(eligibility.criteria || {}).map(
                    ([key, value]) => (
                      <View key={key} style={styles.criteriaItem}>
                        <Text style={{ fontSize: 16 }}>
                          {value ? "✅" : "❌"}
                        </Text>
                        <Text style={styles.criteriaText}>
                          {key
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Text>
                      </View>
                    ),
                  )}
                </View>

                {eligibility.missing_requirements?.length > 0 && (
                  <View style={styles.missingRequirements}>
                    <Text style={styles.missingTitle}>
                      Missing Requirements:
                    </Text>
                    {eligibility.missing_requirements.map((req, i) => (
                      <Text key={i} style={styles.missingItem}>
                        • {req}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Show warning if not eligible and not updating */}
            {!isUpdate &&
              eligibility &&
              !eligibility.is_eligible &&
              !slotAvailability?.is_accepting && (
                <View style={styles.warningCard}>
                  <Text style={styles.warningText}>
                    Applications are currently not being accepted. Please check
                    back later.
                  </Text>
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={checkSlotAvailabilityAndEligibility}
                  >
                    <Text style={styles.refreshButtonText}>Refresh Status</Text>
                  </TouchableOpacity>
                </View>
              )}
          </>
        )}

        {/* BUSINESS INFO */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📋 Business Information</Text>

          <TextInput
            style={styles.input}
            placeholderTextColor="#94a3b8"
            placeholder="Business Name *"
            value={businessName}
            onChangeText={setBusinessName}
          />

          <Text style={styles.subLabel}>Type of Goods *</Text>
          <View style={styles.optionRow}>
            {goodsOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  goodsType === option && styles.optionSelected,
                ]}
                onPress={() => setGoodsType(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    goodsType === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subLabel}>Cart Type *</Text>
          <View style={styles.optionRow}>
            {cartOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  cartType === option && styles.optionSelected,
                ]}
                onPress={() => setCartType(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    cartType === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Operating Hours (e.g. 7AM–5PM)"
            placeholderTextColor="#94a3b8"
            value={operatingHours}
            onChangeText={setOperatingHours}
          />

          <Text style={styles.subLabel}>Years in Operation</Text>
          <View style={styles.optionRow}>
            {yearsOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  yearsInOperation === option && styles.optionSelected,
                ]}
                onPress={() => setYearsInOperation(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    yearsInOperation === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AREA & DELIVERY */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📍 Area of Operation</Text>
          <View style={styles.optionRow}>
            {areaOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  areaOfOperation.includes(option) && styles.optionSelected,
                ]}
                onPress={() =>
                  toggleMultiSelect(option, areaOfOperation, setAreaOfOperation)
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    areaOfOperation.includes(option) &&
                      styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subLabel}>Delivery Capability</Text>
          <View style={styles.optionRow}>
            {["Yes", "No"].map((val) => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.optionButton,
                  deliveryCapability === (val === "Yes") &&
                    styles.optionSelected,
                ]}
                onPress={() => setDeliveryCapability(val === "Yes")}
              >
                <Text
                  style={[
                    styles.optionText,
                    deliveryCapability === (val === "Yes") &&
                      styles.optionTextSelected,
                  ]}
                >
                  {val}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PRODUCTS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🛒 Products</Text>
          {products.map((p, i) => (
            <View key={i} style={styles.productRow}>
              <TextInput
                style={[styles.input, styles.productInput]}
                placeholder="Product Name"
                placeholderTextColor="#94a3b8"
                value={p.name}
                onChangeText={(t) => {
                  const arr = [...products];
                  arr[i].name = t;
                  setProducts(arr);
                }}
              />
              <TextInput
                style={[styles.input, styles.productInput]}
                placeholder="Category"
                placeholderTextColor="#94a3b8"
                value={p.category}
                onChangeText={(t) => {
                  const arr = [...products];
                  arr[i].category = t;
                  setProducts(arr);
                }}
              />
              <TextInput
                style={[styles.input, styles.priceInput]}
                placeholder="Price"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={p.price}
                onChangeText={(t) => {
                  const arr = [...products];
                  arr[i].price = t;
                  setProducts(arr);
                }}
              />
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              setProducts([...products, { name: "", category: "", price: "" }])
            }
          >
            <Text style={styles.addButtonText}>+ Add Product</Text>
          </TouchableOpacity>

          <Text style={styles.subLabel}>Specialty Items (Optional)</Text>
          <View style={styles.optionRow}>
            {specialtyOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  specialtyItems.includes(option) && styles.optionSelected,
                ]}
                onPress={() =>
                  toggleMultiSelect(option, specialtyItems, setSpecialtyItems)
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    specialtyItems.includes(option) &&
                      styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SOCIAL MEDIA */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📱 Social Media (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor="#94a3b8"
            placeholder="Facebook Page URL"
            value={facebook}
            onChangeText={setFacebook}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholderTextColor="#94a3b8"
            placeholder="Instagram Handle"
            value={instagram}
            onChangeText={setInstagram}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholderTextColor="#94a3b8"
            placeholder="TikTok Handle"
            value={tiktok}
            onChangeText={setTiktok}
            autoCapitalize="none"
          />
        </View>

        {/* IMAGES */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📷 Images</Text>

          <Text style={styles.subLabel}>Business Logo</Text>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => pickImage(setBusinessLogo)}
          >
            {businessLogo ? (
              <Image
                source={{ uri: businessLogo }}
                style={styles.imagePreview}
              />
            ) : (
              <Text style={styles.imageButtonText}>📁 Upload Logo</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.subLabel}>Cart/Stall Image</Text>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => pickImage(setCartImage)}
          >
            {cartImage ? (
              <Image source={{ uri: cartImage }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.imageButtonText}>📁 Upload Cart Image</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.subLabel}>Your Photo</Text>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => pickImage(setVendorPhoto)}
          >
            {vendorPhoto ? (
              <Image
                source={{ uri: vendorPhoto }}
                style={styles.imagePreview}
              />
            ) : (
              <Text style={styles.imageButtonText}>📁 Upload Your Photo</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* CONTACT */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📞 Preferred Contact Method</Text>
          <View style={styles.optionRow}>
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  preferredContact === option && styles.optionSelected,
                ]}
                onPress={() => setPreferredContact(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    preferredContact === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isUpdate ? "Update Application" : "Submit Application"}
            </Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default VendorApplyForm;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000000",
  },
  updateHint: {
    fontSize: 14,
    color: "#000000",
    marginBottom: 16,
    fontStyle: "italic",
  },
  sectionCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000000",
  },
  subLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: "#ffffff",
    color: "#000000",
    fontColor: "#000000",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  optionSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  optionText: {
    fontSize: 13,
    color: "#000000",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#ffffff",
    fontWeight: "600",
  },

  productRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  productInput: { flex: 2 },
  priceInput: { flex: 1 },

  addButton: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#eff6ff",
  },
  addButtonText: {
    color: "#2563eb",
    fontWeight: "600",
  },

  imageButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
    minHeight: 100,
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  imageButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "500",
  },
  imagePreview: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    resizeMode: "cover",
  },

  submitButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Slot Availability Styles
  slotCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  slotHeader: {
    marginBottom: 12,
  },
  slotTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  slotStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  slotStat: {
    alignItems: "center",
  },
  slotNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2563eb",
  },
  slotLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },

  // Eligibility Styles
  eligibilityCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  eligibilityTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  eligibilityMessage: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 12,
  },
  eligibilityText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  criteriaList: {
    marginTop: 8,
  },
  criteriaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  criteriaText: {
    fontSize: 13,
    color: "#475569",
    marginLeft: 8,
  },
  missingRequirements: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  missingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
    marginBottom: 8,
  },
  missingItem: {
    fontSize: 13,
    color: "#78350f",
    marginBottom: 4,
  },
  warningCard: {
    backgroundColor: "#fee2e2",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  warningText: {
    fontSize: 14,
    color: "#991b1b",
    textAlign: "center",
    marginBottom: 12,
  },
  refreshButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
