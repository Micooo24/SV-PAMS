// utils/reverseGeocode.js
// Utility to get address from lat/lng using Google Maps Geocoding API
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDv6VxCOMfx_FCg6vu6Ycpsp7IU4S_0FX0'; // Use your key

export async function getAddressFromCoords(lat, lng) {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    console.log('[reverseGeocode] Requesting:', url);
    const res = await axios.get(url);
    console.log('[reverseGeocode] Response:', res.data);
    if (res.data && res.data.results && res.data.results.length > 0) {
      const components = res.data.results[0].address_components;
      let barangay = '';
      let street = '';
      components.forEach(comp => {
        if (comp.types.includes('route')) street = comp.long_name;
        if (comp.types.includes('sublocality_level_1')) barangay = comp.long_name;
      });
      let address = res.data.results[0].formatted_address;
      if (barangay && street) address = `${street}, ${barangay}`;
      else if (barangay) address = barangay;
      else if (street) address = street;
      console.log('[reverseGeocode] Decoded address:', address);
      return address;
    }
    console.log('[reverseGeocode] No results for coordinates:', lat, lng);
    return 'Unknown location';
  } catch (err) {
    console.error('[reverseGeocode] Error:', err);
    return 'Unknown location';
  }
}
