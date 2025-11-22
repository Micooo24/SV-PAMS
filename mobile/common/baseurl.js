import { Platform } from "react-native";

// HOST URLS - UPDATE THESE WITH YOUR ACTUAL IP
const mico_url = "http://192.168.1.7:8000";
const lei_url = "http://192.168.27.41:8000";
const janna_url = "http://10.218.241.95:8000";
const jane_url = "http://192.168.1.7:8000"; // Update this

// ACTIVE HOST - Change this to switch between hosts
const ACTIVE_HOST = janna_url;

let BASE_URL = "http://10.218.241.95:8000";

if (Platform.OS === "android") {
  BASE_URL = ACTIVE_HOST;
} else if (Platform.OS === "ios") {
  BASE_URL = ACTIVE_HOST; // Use same for iOS
} else {
  BASE_URL = "http://localhost:8000"; // Web fallback
}

console.log("=".repeat(50));
console.log("BASE_URL Configuration:");
console.log("Platform:", Platform.OS);
console.log("BASE_URL:", BASE_URL);
console.log("=".repeat(50));

export default BASE_URL;
