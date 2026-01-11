// Pasig City center coordinates and radius (in meters)
const PASIG_CENTER = { latitude: 14.5764, longitude: 121.0851 };
const PASIG_RADIUS_METERS = 6000; // ~6km radius covers most of Pasig

// Haversine formula to calculate distance between two lat/lng points in meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Returns true if location is within Pasig geofence
export function isWithinPasig(location) {
  if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') return false;
  const dist = getDistanceMeters(
    PASIG_CENTER.latitude,
    PASIG_CENTER.longitude,
    location.latitude,
    location.longitude
  );
  return dist <= PASIG_RADIUS_METERS;
}
import AsyncStorage from '@react-native-async-storage/async-storage';


// Key will be per user: 'gallery_{userId}'
// Accepts location: { latitude, longitude }
export async function saveImageToGallery(userId, imageUri, location) {
  const key = `gallery_${userId}`;
  const gallery = await getGallery(userId);
  const imageObj = {
    id: `${Date.now()}_${Math.floor(Math.random() * 1e9)}`,
    uri: imageUri,
    capturedAt: new Date().toISOString(),
    location: location || null,
  };
  gallery.push(imageObj);
  await AsyncStorage.setItem(key, JSON.stringify(gallery));
  return imageObj;
}

export async function getGallery(userId) {
  const key = `gallery_${userId}`;
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export async function removeImageFromGallery(userId, imageId) {
  const key = `gallery_${userId}`;
  const gallery = await getGallery(userId);
  const filtered = gallery.filter(img => img.id !== imageId);
  await AsyncStorage.setItem(key, JSON.stringify(filtered));
}

export function isValidImage(img) {
  const now = new Date();
  const captured = new Date(img.capturedAt);
  const diffHrs = (now - captured) / (1000 * 60 * 60);
  return diffHrs <= 36;
}
