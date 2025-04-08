import React, { useState, useEffect } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { isBiometricAvailable, isBiometricEnabled, authenticateWithBiometrics } from '../../utils/BiometricAuth';
import { fonts } from '../global/styles/theme';
import { moderateScale } from '../theme/Metrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import Firebase using require
const { auth, db } = require('../../firebaseconfi');
const { doc, getDoc } = require('firebase/firestore');

export default function BiometricLoginButton({ onLoginSuccess, style }) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const checkBiometricStatus = async () => {
      try {
        setIsInitializing(true);
        
        // Check if biometrics are available on this device
        const { available, biometryName } = await isBiometricAvailable();
        setIsAvailable(available);
        setBiometricType(biometryName);
        
        // Check if user has enabled biometric login
        const enabled = await isBiometricEnabled();
        setIsEnabled(enabled);
      } catch (error) {
        console.error('Error checking biometric status:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    checkBiometricStatus();
  }, []);

  const handleBiometricLogin = async () => {
    try {
      setIsLoading(true);
      
      // Attempt biometric authentication
      const { success, userId, error } = await authenticateWithBiometrics('Log in to Foodie App');
      
      if (success) {
        // Get the user data that was stored during authentication
        const userDataString = await AsyncStorage.getItem('@user');
        if (!userDataString) {
          console.error("No user data found in AsyncStorage after biometric authentication");
          // If no data in AsyncStorage, we need to try to fetch it again
          try {
            const userDocRef = doc(db, "users", userId);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              await AsyncStorage.setItem('@user', JSON.stringify({
                uid: userId,
                displayName: userData.displayName,
                email: userData.email,
                photoURL: userData.profilePictureUrl || null,
                ...userData
              }));
              console.log("Retrieved and stored user data after biometric auth");
            }
          } catch (fetchError) {
            console.error("Error fetching user data after biometric auth:", fetchError);
          }
        }
        
        // Try again to get the user data
        const finalUserDataString = await AsyncStorage.getItem('@user');
        const userData = finalUserDataString ? JSON.parse(finalUserDataString) : { uid: userId };
        
        // Force reload the auth state
        if (auth.currentUser === null) {
          // This is a workaround to ensure Firebase recognizes the authentication
          console.log("Need to refresh auth state after biometric login");
          
          // In some cases we need to wait for authentication to be registered
          setTimeout(() => {
            if (onLoginSuccess) {
              onLoginSuccess(userId);
            } else {
              // Default navigation to LocationAccess1 if no success handler provided
              navigation.reset({
                index: 0,
                routes: [{ name: 'LocationAccess1' }],
              });
            }
          }, 500);
        } else {
          if (onLoginSuccess) {
            onLoginSuccess(userId);
          } else {
            // Default navigation to LocationAccess1 if no success handler provided
            navigation.reset({
              index: 0,
              routes: [{ name: 'LocationAccess1' }],
            });
          }
        }
      } else {
        console.log('Biometric authentication failed:', error);
      }
    } catch (error) {
      console.error('Error during biometric login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render the button if biometrics aren't available or enabled
  if (isInitializing) {
    return null; // Don't show anything while initializing
  }

  if (!isAvailable || !isEnabled) {
    return null;
  }

  // Icon based on biometric type
  const getBiometricIcon = () => {
    if (biometricType.includes('Face')) {
      return 'md-scan-outline';
    } else if (biometricType.includes('Finger') || biometricType.includes('Touch')) {
      return 'finger-print';
    }
    return 'finger-print'; // Default
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleBiometricLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View style={styles.buttonContent}>
          <Ionicons name={getBiometricIcon()} size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>
            Sign in with {biometricType}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#333',
    borderRadius: moderateScale(15),
    paddingVertical: moderateScale(15),
    paddingHorizontal: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: moderateScale(10),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: moderateScale(16),
    marginLeft: moderateScale(10),
  }
}); 