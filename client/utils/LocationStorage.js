import AsyncStorage from '@react-native-async-storage/async-storage';
import { isLocationRefreshNeeded, clearLocationRefreshFlag } from './AuthStorage';

const LOCATION_KEY = 'user_location';
const READABLE_LOCATION_KEY = 'user_readable_location';
const LOCATION_PERMISSION_GRANTED_KEY = 'location_permission_granted';

/**
 * Save user location coordinates to AsyncStorage
 * @param {Object} location - Object containing latitude and longitude
 */
export const saveLocationCoordinates = async (location) => {
  try {
    if (!location) return;
    
    await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(location));
    console.log('Location coordinates saved to storage');
  } catch (error) {
    console.error('Error saving location coordinates:', error);
  }
};

/**
 * Get user location coordinates from AsyncStorage
 * @returns {Object|null} Location object or null if not found
 */
export const getLocationCoordinates = async () => {
  try {
    const locationData = await AsyncStorage.getItem(LOCATION_KEY);
    if (!locationData) return null;
    
    return JSON.parse(locationData);
  } catch (error) {
    console.error('Error getting location coordinates:', error);
    return null;
  }
};

/**
 * Save user readable location (e.g. "New York, NY") to AsyncStorage
 * @param {string} readableLocation - Human-readable location string
 */
export const saveReadableLocation = async (readableLocation) => {
  try {
    if (!readableLocation) return;
    
    await AsyncStorage.setItem(READABLE_LOCATION_KEY, readableLocation);
    console.log('Readable location saved to storage');
  } catch (error) {
    console.error('Error saving readable location:', error);
  }
};

/**
 * Get user readable location from AsyncStorage
 * @returns {string|null} Readable location or null if not found
 */
export const getReadableLocation = async () => {
  try {
    return await AsyncStorage.getItem(READABLE_LOCATION_KEY);
  } catch (error) {
    console.error('Error getting readable location:', error);
    return null;
  }
};

/**
 * Save both coordinates and readable location at once
 * @param {Object} locationData - Object with location and readableLocation properties
 */
export const saveLocationData = async (locationData) => {
  try {
    if (locationData?.location) {
      await saveLocationCoordinates(locationData.location);
    }
    
    if (locationData?.readableLocation) {
      await saveReadableLocation(locationData.readableLocation);
    }
    
    // Also mark that location permission has been granted
    await setLocationPermissionGranted();
    
    console.log('Full location data saved to storage');
  } catch (error) {
    console.error('Error saving location data:', error);
  }
};

/**
 * Get both coordinates and readable location
 * @returns {Object} Object containing location and readableLocation properties
 */
export const getLocationData = async () => {
  try {
    const location = await getLocationCoordinates();
    const readableLocation = await getReadableLocation();
    
    return {
      location,
      readableLocation
    };
  } catch (error) {
    console.error('Error getting location data:', error);
    return {
      location: null,
      readableLocation: null
    };
  }
};

/**
 * Set flag indicating that location permission has been granted
 */
export const setLocationPermissionGranted = async () => {
  try {
    await AsyncStorage.setItem(LOCATION_PERMISSION_GRANTED_KEY, 'true');
    console.log('Location permission flag set to granted');
  } catch (error) {
    console.error('Error setting location permission flag:', error);
  }
};

/**
 * Check if location permission has been granted previously
 * @returns {Promise<boolean>} Whether location permission has been granted
 */
export const isLocationPermissionGranted = async () => {
  try {
    const value = await AsyncStorage.getItem(LOCATION_PERMISSION_GRANTED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking location permission flag:', error);
    return false;
  }
};

/**
 * Gets a formatted, user-friendly location name from storage
 * This is a convenience function that returns a formatted location name or a default value
 * @param {string} defaultValue - Default value to return if no location is found
 * @returns {Promise<string>} Formatted location name or default value
 */
export const getFormattedLocationName = async (defaultValue = 'Set Location') => {
  try {
    const readableLocation = await getReadableLocation();
    if (!readableLocation) return defaultValue;
    
    // You could implement additional formatting here if needed
    // For example, shortening very long location names or extracting specific parts
    
    return readableLocation;
  } catch (error) {
    console.error('Error getting formatted location name:', error);
    return defaultValue;
  }
};

// Re-export the location refresh functions
export { isLocationRefreshNeeded, clearLocationRefreshFlag }; 