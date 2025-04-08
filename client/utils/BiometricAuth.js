// utils/BiometricAuth.js
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken, setAuthToken } from './AuthStorage';
// Import Firebase using require to avoid any module resolution issues
const { db } = require('../firebaseconfi');
const { doc, getDoc } = require('firebase/firestore');

// Storage keys
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_USER_ID_KEY = 'biometric_user_id';

/**
 * Check if device supports biometric authentication
 * @returns {Promise<{available: boolean, biometryType: string|null, biometryName: string, error: string|null}>}
 */
export const isBiometricAvailable = async () => {
  try {
    // Check if hardware supports biometrics
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      return { 
        available: false, 
        biometryType: null, 
        biometryName: '', 
        error: 'This device does not have biometric hardware' 
      };
    }

    // Check if biometrics are enrolled (e.g. fingerprint saved, face registered)
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      return { 
        available: false, 
        biometryType: null, 
        biometryName: '', 
        error: 'No biometrics enrolled on this device' 
      };
    }

    // Get the available biometric types
    const biometryType = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    // Convert to readable name
    let biometryName = 'Biometric';
    if (biometryType.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometryName = 'Face ID';
    } else if (biometryType.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometryName = 'Fingerprint';
    } else if (biometryType.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometryName = 'Iris';
    }
    
    return { 
      available: true, 
      biometryType: biometryType[0], 
      biometryName,
      error: null 
    };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return { 
      available: false, 
      biometryType: null, 
      biometryName: '', 
      error: error.message 
    };
  }
};

/**
 * Check if user has enabled biometric authentication
 * @returns {Promise<boolean>}
 */
export const isBiometricEnabled = async () => {
  try {
    const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking if biometric auth is enabled:', error);
    return false;
  }
};

/**
 * Enable biometric authentication for a user
 * @param {string} userId - The Firebase user ID to associate with biometric auth
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const enableBiometricAuth = async (userId) => {
  try {
    // Check if biometrics are available on this device
    const { available, error } = await isBiometricAvailable();
    if (!available) {
      return { 
        success: false, 
        error: error || 'Biometric authentication is not available on this device.' 
      };
    }

    // Store user ID in AsyncStorage
    await AsyncStorage.setItem(BIOMETRIC_USER_ID_KEY, userId);
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error enabling biometric auth:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Disable biometric authentication
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const disableBiometricAuth = async () => {
  try {
    await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    await AsyncStorage.removeItem(BIOMETRIC_USER_ID_KEY);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error disabling biometric auth:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Authenticate the user using biometrics
 * @param {string} promptMessage - Message to display in the biometric prompt
 * @returns {Promise<{success: boolean, userId: string|null, error: string|null}>}
 */
export const authenticateWithBiometrics = async (promptMessage = 'Authenticate to log in') => {
  try {
    // Check if biometric auth is enabled
    const isEnabled = await isBiometricEnabled();
    if (!isEnabled) {
      return { success: false, userId: null, error: 'Biometric authentication is not enabled.' };
    }
    
    // Retrieve stored user ID
    const userId = await AsyncStorage.getItem(BIOMETRIC_USER_ID_KEY);
    if (!userId) {
      return { success: false, userId: null, error: 'No user associated with biometric authentication.' };
    }
    
    // Authenticate with biometrics
    const { success } = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });
    
    if (success) {
      // Set the auth token with the normal expiry
      await setAuthToken(userId);
      
      try {
        console.log('Getting user data for userId:', userId);
        
        // First check if we have a Google profile image saved
        const googleProfileImage = await AsyncStorage.getItem('@googleProfileImage');
        // Also check if we have a Google profile image specifically saved for biometric auth
        const bioAuthGoogleImage = await AsyncStorage.getItem('@bioAuthGoogleImage');
        const profileImage = bioAuthGoogleImage || googleProfileImage;
        console.log('Retrieved Google profile image:', profileImage);
        
        // Fetch user data from Firestore to ensure we have the complete profile
        try {
          const userDocRef = doc(db, "users", userId);
          console.log('userDocRef created');
          const userDocSnap = await getDoc(userDocRef);
          console.log('userDocSnap fetched');
          
          if (userDocSnap.exists()) {
            // Store user information in AsyncStorage to persist across app restarts
            const userData = userDocSnap.data();
            console.log('User data retrieved from Firestore:', userData);
            
            // Look for profile picture in various possible properties
            // Prioritize Google profile image if available
            const photoURL = profileImage || 
                             userData.profilePictureUrl || 
                             userData.photoURL || 
                             userData.photo || 
                             userData.picture;
            
            await AsyncStorage.setItem('@user', JSON.stringify({
              uid: userId,
              displayName: userData.displayName || '',
              email: userData.email || '',
              photoURL: photoURL,
              profilePictureUrl: photoURL, // Add an additional property for backup
              ...userData // Include any other fields from Firestore
            }));
            console.log('User data stored in AsyncStorage after biometric auth');
          } else {
            console.log('No user document found in Firestore, using basic user data');
            // If no Firestore data, store minimal user info but still include Google profile image if available
            await AsyncStorage.setItem('@user', JSON.stringify({
              uid: userId,
              photoURL: profileImage || null
            }));
          }
        } catch (firestoreError) {
          console.error('Error in Firestore operations:', firestoreError);
          // Still mark auth as successful even if profile retrieval fails
          // If we have a Google profile image, still include it
          await AsyncStorage.setItem('@user', JSON.stringify({
            uid: userId,
            photoURL: profileImage || null
          }));
        }
      } catch (error) {
        console.error('Error fetching user data after biometric auth:', error);
        // Still mark auth as successful even if profile retrieval fails
        await AsyncStorage.setItem('@user', JSON.stringify({
          uid: userId
        }));
      }
      
      return { success: true, userId, error: null };
    } else {
      return { success: false, userId: null, error: 'Biometric authentication failed.' };
    }
  } catch (error) {
    console.error('Error during biometric authentication:', error);
    return { success: false, userId: null, error: error.message };
  }
};

/**
 * Get the type of biometric authentication available on this device
 * @returns {Promise<string>} - Description of available biometric type
 */
export const getBiometricType = async () => {
  const { available, biometryName } = await isBiometricAvailable();
  
  if (!available) return 'None';
  
  return biometryName;
}; 