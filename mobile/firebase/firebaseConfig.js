import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
  signInWithCredential,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyClm4V0Td6kLL-T0HJVrZobRltjiIeAUh0",
  authDomain: "sv-pams-477706.firebaseapp.com",
  databaseURL:
    "https://sv-pams-477706-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "sv-pams-477706",
  storageBucket: "sv-pams-477706.firebasestorage.app",
  messagingSenderId: "657897595229",
  appId: "1:657897595229:web:e917cf44d3c94cdf2408b4",
  measurementId: "G-WKHRSD5M5P",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getDatabase(app);

export {
  auth,
  GoogleAuthProvider,
  signInWithCredential,
  createUserWithEmailAndPassword,
};
