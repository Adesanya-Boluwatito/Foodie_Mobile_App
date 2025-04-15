// Add in-memory cache for location data to reduce AsyncStorage calls
let locationDataCache = null;
let cacheTTL = 30 * 60 * 1000; // 30 minutes in milliseconds
let cacheTimestamp = 0;

/**
 * Get both coordinates and readable location with optimized caching
 * @returns {Object} Object containing location and readableLocation properties
 */
export const getLocationData = async () => {
  try {
    // Check memory cache first for fastest access
    const now = Date.now();
    if (locationDataCache && now - cacheTimestamp < cacheTTL) {
      return locationDataCache;
    }
    
    // If not in memory cache, fetch from AsyncStorage
    const [locationStr, readableLocation] = await AsyncStorage.multiGet([
      LOCATION_KEY, 
      READABLE_LOCATION_KEY
    ]);
    
    const location = locationStr[1] ? JSON.parse(locationStr[1]) : null;
    
    // Update memory cache
    locationDataCache = {
      location,
      readableLocation: readableLocation[1]
    };
    cacheTimestamp = now;
    
    return locationDataCache;
  } catch (error) {
    console.error('Error getting location data:', error);
    return {
      location: null,
      readableLocation: null
    };
  }
};

/**
 * Save both coordinates and readable location at once with optimized caching
 * @param {Object} locationData - Object with location and readableLocation properties
 */
export const saveLocationData = async (locationData) => {
  try {
    if (!locationData) return;
    
    const pairs = [];
    
    if (locationData.location) {
      pairs.push([LOCATION_KEY, JSON.stringify(locationData.location)]);
    }
    
    if (locationData.readableLocation) {
      pairs.push([READABLE_LOCATION_KEY, locationData.readableLocation]);
    }
    
    // Add permission flag
    pairs.push([LOCATION_PERMISSION_GRANTED_KEY, 'true']);
    
    // Use multiSet for better performance
    if (pairs.length > 0) {
      await AsyncStorage.multiSet(pairs);
    }
    
    // Update memory cache
    locationDataCache = {
      location: locationData.location,
      readableLocation: locationData.readableLocation
    };
    cacheTimestamp = Date.now();
    
    console.log('Full location data saved to storage and cache');
  } catch (error) {
    console.error('Error saving location data:', error);
  }
}; 