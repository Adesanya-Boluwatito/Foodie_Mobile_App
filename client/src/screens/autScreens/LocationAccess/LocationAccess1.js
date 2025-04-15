import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Image, Platform, Alert, Linking } from "react-native";
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useLocation } from '../../../context/LocationContext';
import axios from 'axios';
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { globalStyles, fonts } from "../../../global/styles/theme";
import { verticalScale, horizontalScale, moderateScale } from "../../../theme/Metrics";
import { setLocationPermissionGranted } from "../../../../utils/LocationStorage";

export default function LocationAccessScreen_1() {
  const [location, setLocation] = useState(null);
  const [readableLocation, setReadableLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { setLocationData } = useLocation();

  const requestLocationPermission = async () => {
    let permission;
    if (Platform.OS === 'android') {
      permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    } else {
      permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    }

    // Check permission status
    const result = await check(permission);
    if (result === RESULTS.GRANTED) {
      // Permission granted, get location
      getCurrentLocation();
    } else if (result === RESULTS.DENIED) {
      // Request permission if it was denied
      const requestResult = await request(permission);
      if (requestResult === RESULTS.GRANTED) {
        // Permission granted after request
        getCurrentLocation();
      } else {
        Alert.alert(
          "Location Permission",
          "We need location access to provide better services. Please enable it in settings.",
          [{ text: "OK" }]
        );
      }
    } else if (result === RESULTS.BLOCKED) {
      Alert.alert(
        "Location Permission Blocked",
        "Location permission is blocked. Please go to settings and enable it manually.",
        [{ text: "OK" }]
      );
    }
  };

  // In LocationAccessScreen_1.js, modify your getCurrentLocation function:
const getCurrentLocation = async () => {
  setLoading(true);
  try {
    // First check if location services are enabled at the device level
    const isLocationServicesEnabled = await Location.hasServicesEnabledAsync();
    
    if (!isLocationServicesEnabled) {
      setLoading(false);
      Alert.alert(
        "Location Services Disabled",
        "Your device's location services are turned off. Please enable location services in your device settings to use your current location.",
        [
          { 
            text: "Cancel",
            style: "cancel" 
          },
          { 
            text: "Open Settings", 
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }
          }
        ]
      );
      return;
    }

    // Request permission if location services are enabled
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLoading(false);
      Alert.alert(
        "Location Permission Required",
        "We need location access to provide relevant restaurants in your area. Please enable location permissions.",
        [
          { 
            text: "Enter Manually", 
            onPress: () => navigation.navigate('LocationAccess2'),
            style: "cancel"
          },
          { 
            text: "Try Again", 
            onPress: () => requestLocationPermission() 
          }
        ]
      );
      return;
    }

    // Mark that location permission has been granted
    await setLocationPermissionGranted();

    // Try to get current position with timeout
    let currentLocation;
    try {
      currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000, // Limit the time to wait for location
        mayShowUserSettingsDialog: true // Show settings dialog if needed
      });
    } catch (positionError) {
      console.error("Error getting position:", positionError);
      setLoading(false);
      Alert.alert(
        "Location Error",
        "We couldn't get your current location. Make sure location services are enabled with high accuracy.",
        [
          { 
            text: "Enter Manually", 
            onPress: () => navigation.navigate('LocationAccess2') 
          },
          { 
            text: "Try Again", 
            onPress: () => getCurrentLocation() 
          }
        ]
      );
      return;
    }

    const { latitude, longitude } = currentLocation.coords;
    setLocation({ latitude, longitude });

    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
        {
          params: {
            access_token: "pk.eyJ1IjoiYm9sdXdhdGl0byIsImEiOiJjbTA2cmVwaG4wd3JrMmtzZ2ZrZHp1Y3NyIn0.0U7q1yCc51dpEtk_xGcE0A",
            types: "place"
          },
        }
      );

      if (response.data && response.data.features.length > 0) {
        const detailedFeature = response.data.features.find(
          feature => feature.place_type.includes('neighborhood') ||
            feature.place_type.includes('locality')
        );

        const locationName = detailedFeature
          ? detailedFeature.place_name
          : response.data.features[0].place_name;

        setReadableLocation(locationName);

        console.log('Location data ready:', locationName);

        // Create location data object
        const locationData = {
          location: { latitude, longitude },
          readableLocation: locationName
        };

        // Set location data in context - this will also save to AsyncStorage
        await setLocationData(locationData);
        
        // Pass location and readableLocation directly to MainTab
        navigation.navigate("MainTab", {
          location: { latitude, longitude },
          readableLocation: locationName
        });
        
      } else {
        setReadableLocation("Location not found");
        setLoading(false);
        Alert.alert(
          "Location Error",
          "We couldn't determine your location name. Please enter it manually.",
          [{ text: "OK", onPress: () => navigation.navigate('LocationAccess2') }]
        );
      }
    } catch (error) {
      console.error("Reverse Geocoding error:", error);
      setLoading(false);
      Alert.alert(
        "Location Error", 
        "Could not get your location name. Please enter it manually.", 
        [{ text: "OK", onPress: () => navigation.navigate('LocationAccess2') }]
      );
    }
  } catch (error) {
    console.error(error);
    setLoading(false);
    Alert.alert(
      "Location Error",
      "Could not access your location. Please try again or enter your location manually.",
      [
        { 
          text: "Enter Manually", 
          onPress: () => navigation.navigate('LocationAccess2') 
        },
        { 
          text: "Try Again", 
          onPress: () => requestLocationPermission() 
        }
      ]
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={globalStyles.container}>
      <View style={styles.imageContainer}>
        <Image source={require('../../../../assets/ima/Location.png')} style={styles.image} />
      </View>

      <View style={styles.GrantAccessContainer}>
        <Text style={styles.LocationText}>Grant Location Access</Text>
      </View>

      <View style={styles.InstructionContainer}>
        <Text style={styles.InstructionText}>Kindly click on one of the buttons below to select your location</Text>
      </View>

      <View style={styles.BlackbuttonContainer}>
        <TouchableOpacity style={styles.Blackbutton} onPress={requestLocationPermission}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.BlackbuttonText}>Use Current Location</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.WhitebuttonContainer}>
        <TouchableOpacity style={styles.Whitebutton} onPress={() => navigation.navigate('LocationAccess2')}>
          <Text style={styles.WhitebuttonText}>Enter Manually</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    alignSelf: "center",
    alignContent: "center",
    paddingTop: verticalScale(100)
  },
  image: {
    width: horizontalScale(350),
    height: verticalScale(280),
    resizeMode: 'contain',
  },
  GrantAccessContainer: {
    alignSelf: "center",
    marginTop: verticalScale(80)
  },
  LocationText: {
    fontSize: moderateScale(20),
    fontFamily: fonts.extendedBold,
    fontWeight: "700",
    textAlign: "center"
  },
  InstructionContainer: {
    alignSelf: "center",
    alignContent: "center",
    alignItems: "center",
    marginTop: moderateScale(15),
  },
  InstructionText: {
    textAlign: "center",
    fontFamily: fonts.regular,
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#A5A5A5",
  },
  BlackbuttonContainer: {
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: verticalScale(60)
  },
  Blackbutton: {
    backgroundColor: "#000",
    width: moderateScale(350),
    height: moderateScale(50),
    borderRadius: moderateScale(10),
    justifyContent: "center"
  },
  BlackbuttonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: fonts.extendedBold,
    fontSize: moderateScale(16),
    fontWeight: "400"
  },
  WhitebuttonContainer: {
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: verticalScale(20)
  },
  Whitebutton: {
    borderWidth: 1,
    width: moderateScale(350),
    height: moderateScale(50),
    borderRadius: moderateScale(10),
    justifyContent: "center"
  },
  WhitebuttonText: {
    color: "#0A0908",
    textAlign: "center",
    fontFamily: fonts.extendedBold,
    fontSize: moderateScale(16),
    fontWeight: "400"
  }
});