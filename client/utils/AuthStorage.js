// utils/AuthStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export const setAuthToken = async (token) => {
  try {
    // Store the token
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    
    // Set expiry time (current time + 30 minutes)
    const expiryTime = Date.now() + SESSION_DURATION;
    await AsyncStorage.setItem(AUTH_TOKEN_EXPIRY_KEY, expiryTime.toString());
    
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
      
      // If token is expired, clear it and return null
      if (now > expiryTime) {
        console.log('Auth token expired, clearing session');
        await clearAuthToken();
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