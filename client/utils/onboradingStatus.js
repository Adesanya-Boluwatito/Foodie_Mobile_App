// utils/OnboardingStatus.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
const ONBOARDING_VERSION_KEY = 'onboarding_version';
const CURRENT_ONBOARDING_VERSION = '1.0'; // Increment this when onboarding screens change

/**
 * Marks onboarding as completed with the current version
 */
export const setOnboardingCompleted = async () => {
  try {
    // Use a multi-set operation to ensure atomicity
    await AsyncStorage.multiSet([
      [ONBOARDING_COMPLETED_KEY, 'true'],
      [ONBOARDING_VERSION_KEY, CURRENT_ONBOARDING_VERSION]
    ]);
    console.log('Onboarding marked as completed with version:', CURRENT_ONBOARDING_VERSION);
  } catch (error) {
    console.error('Error setting onboarding status:', error);
  }
};

/**
 * Checks if onboarding has been completed
 * @returns {Promise<boolean>} Whether onboarding has been completed with the current version
 */
export const isOnboardingCompleted = async () => {
  try {
    // Get both completion flag and version
    const [completedResult, versionResult] = await AsyncStorage.multiGet([
      ONBOARDING_COMPLETED_KEY,
      ONBOARDING_VERSION_KEY
    ]);
    
    const completed = completedResult[1] === 'true';
    const savedVersion = versionResult[1];
    
    // If we have a version mismatch, force onboarding again
    if (completed && savedVersion !== CURRENT_ONBOARDING_VERSION) {
      console.log('Onboarding version mismatch. Saved:', savedVersion, 'Current:', CURRENT_ONBOARDING_VERSION);
      return false;
    }
    
    return completed;
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return false;
  }
};

/**
 * Force reset onboarding status (for testing or troubleshooting)
 */
export const resetOnboardingStatus = async () => {
  try {
    await AsyncStorage.multiRemove([ONBOARDING_COMPLETED_KEY, ONBOARDING_VERSION_KEY]);
    console.log('Onboarding status reset successfully');
  } catch (error) {
    console.error('Error resetting onboarding status:', error);
  }
};