import 'dotenv/config';

export default {
  expo: {
    name: "SV_PAMS",
    slug: "sv_pams",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo1.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/logo1.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera"
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you share them."
        }
      ]
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ],
      package: "com.mico.svpams_android",
      googleServicesFile: "./secrets_mobile/google-services.json",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || "AIzaSyDv6VxCOMfx_FCg6vu6Ycpsp7IU4S_0FX0" 
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    }
  }
};