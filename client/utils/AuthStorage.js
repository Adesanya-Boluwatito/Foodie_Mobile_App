// utils/AuthStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const LOCATION_REFRESH_NEEDED_KEY = 'location_refresh_needed';

export const setAuthToken = async (token) => {
  try {
    // Store the token
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    
    // Set expiry time (current time + 30 minutes)
    const expiryTime = Date.now() + SESSION_DURATION;
    await AsyncStorage.setItem(AUTH_TOKEN_EXPIRY_KEY, expiryTime.toString());
    
    // Reset the location refresh flag when setting a new token
    await AsyncStorage.removeItem(LOCATION_REFRESH_NEEDED_KEY);
    
    console.log(`Auth token set with expiry at: ${new Date(expiryTime).toLocaleString()}`);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

export const getAuthToken = async () => {
  try {
    // Get the token and expiry time
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const expiryTimeStr = await AsyncStorage.getItem(AUTH_TOKEN_EXPIRY_KEY);
    
    // If no token, return null
    if (!token) return null;
    
    // If expiry time exists, check if token is expired
    if (expiryTimeStr) {
      const expiryTime = parseInt(expiryTimeStr, 10);
      const now = Date.now();
      
      // If token is expired, clear it, set location refresh flag, and return null
      if (now > expiryTime) {
        console.log('Auth token expired, clearing session');
        await clearAuthToken();
        
        // Set a flag indicating location needs to be refreshed on next login
        await AsyncStorage.setItem(LOCATION_REFRESH_NEEDED_KEY, 'true');
        console.log('Location refresh flag set for next login');
        
        return null;
      }
      
      // Token is valid, reset expiry time
      const newExpiryTime = now + SESSION_DURATION;
      await AsyncStorage.setItem(AUTH_TOKEN_EXPIRY_KEY, newExpiryTime.toString());
      console.log(`Auth token expiry extended to: ${new Date(newExpiryTime).toLocaleString()}`);
    }
    
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const clearAuthToken = async () => {
  try {
    // Remove both token and expiry time
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY);
    console.log('Auth token and expiry cleared');
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

// Check if location needs to be refreshed after session timeout
export const isLocationRefreshNeeded = async () => {
  try {
    const needsRefresh = await AsyncStorage.getItem(LOCATION_REFRESH_NEEDED_KEY);
    return needsRefresh === 'true';
  } catch (error) {
    console.error('Error checking if location refresh is needed:', error);
    return false;
  }
};

// Clear the location refresh flag after refreshing location
export const clearLocationRefreshFlag = async () => {
  try {
    await AsyncStorage.removeItem(LOCATION_REFRESH_NEEDED_KEY);
    console.log('Location refresh flag cleared');
  } catch (error) {
    console.error('Error clearing location refresh flag:', error);
  }
};