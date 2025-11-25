import { initializeApp } from "firebase/app";
import { Database, getDatabase } from "firebase/database";

const firebaseConfig = {
 apiKey: "AIzaSyClm4V0Td6kLL-T0HJVrZobRltjiIeAUh0",
  authDomain: "sv-pams-477706.firebaseapp.com",
  projectId: "sv-pams-477706",
  storageBucket: "sv-pams-477706.firebasestorage.app",
  messagingSenderId: "657897595229",
  appId: "1:657897595229:web:e917cf44d3c94cdf2408b4",
  measurementId: "G-WKHRSD5M5P",
  databaseURL: "https://sv-pams-477706-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
