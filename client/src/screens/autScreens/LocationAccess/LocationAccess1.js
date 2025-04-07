import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Image, Platform, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useLocation } from '../../../context/LocationContext';
import axios from 'axios';
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { globalStyles, fonts } from "../../../global/styles/theme";
import { verticalScale, horizontalScale, moderateScale } from "../../../theme/Metrics";

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
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Error", "Permission to access location was denied");
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
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

        // Add these console logs
        console.log('Location data ready:', locationName);


        // ADD THIS CODE HERE - Set location data in context
        setLocationData({
          location: { latitude, longitude },
          readableLocation: locationName
        });
        
        // Pass location and readableLocation directly to MainTab
        navigation.navigate("MainTab", {
          location: { latitude, longitude },
          readableLocation: locationName
        });
        
      } else {
        setReadableLocation("Location not found");
      }
    } catch (error) {
      console.error("Reverse Geocoding error:", error);
      Alert.alert("Error", "Could not get readable location name");
    }
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Could not get your location");
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