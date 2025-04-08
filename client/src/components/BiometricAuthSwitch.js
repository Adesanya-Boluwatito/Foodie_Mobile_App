import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Switch, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../firebaseconfi';
import { 
  isBiometricAvailable, 
  isBiometricEnabled, 
  enableBiometricAuth, 
  disableBiometricAuth 
} from '../../utils/BiometricAuth';
import { fonts } from '../global/styles/theme';
import { moderateScale, verticalScale, horizontalScale } from '../theme/Metrics';
import { Toast } from 'react-native-toast-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalAuthentication } from 'expo-local-authentication';
import { ALERT_TYPE } from 'react-native-toast-notifications';

export default function BiometricAuthSwitch() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkBiometricStatus = async () => {
      try {
        setIsInitializing(true);
        
        // Check if biometrics are available on device
        const { available, biometryName } = await isBiometricAvailable();
        setIsAvailable(available);
        setBiometricType(biometryName || 'Biometric');
        
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

  const toggleSwitch = async () => {
    try {
      setIsLoading(true);
      
      if (isEnabled) {
        // Disable biometric authentication
        const { success, error } = await disableBiometricAuth();
        
        if (success) {
          setIsEnabled(false);
          Alert.alert('Success', `${biometricType} login disabled`);
        } else {
          Alert.alert('Error', `Failed to disable ${biometricType} login: ${error}`);
        }
      } else {
        // Ensure user is authenticated before enabling biometrics
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Error', 'You must be logged in to enable biometric authentication');
          return;
        }
        
        // Enable biometric authentication
        await enableBiometricAuth();
      }
    } catch (error) {
      console.error('Error toggling biometric auth:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Don't render if biometric auth is not available or still initializing
  if (isInitializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }
  
  if (!isAvailable) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="finger-print" size={24} color="#888" />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Biometric Login</Text>
          <Text style={styles.subtitle}>Not available on this device</Text>
        </View>
      </View>
    );
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
      style={styles.container} 
      activeOpacity={0.7}
      onPress={isLoading ? null : toggleSwitch}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={getBiometricIcon()} size={24} color="#000" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{biometricType} Login</Text>
        <Text style={styles.subtitle}>
          {isEnabled 
            ? `Sign in with ${biometricType} is enabled` 
            : `Enable to sign in with ${biometricType}`}
        </Text>
      </View>
      <View style={styles.switchContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#FF4D4F" />
        ) : (
          <Switch
            trackColor={{ false: "#e0e0e0", true: "#FF4D4F" }}
            thumbColor={isEnabled ? "#fff" : "#f4f3f4"}
            ios_backgroundColor="#e0e0e0"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginVertical: verticalScale(8),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: moderateScale(16),
    color: '#000',
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: moderateScale(14),
    color: '#666',
  },
  switchContainer: {
    marginLeft: horizontalScale(8),
  }
}); 