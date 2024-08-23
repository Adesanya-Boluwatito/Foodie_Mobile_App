import React, { useState, useEffect } from "react";
import { StyleSheet, View,  Alert, Text } from "react-native";
import Mapbox from "@rnmapbox/maps";
import * as Location from 'expo-location';

// Set your Mapbox access token
Mapbox.setAccessToken("pk.eyJ1IjoiYm9sdXdhdGl0byIsImEiOiJjbTA2cmVwaG4wd3JrMmtzZ2ZrZHp1Y3NyIn0.0U7q1yCc51dpEtk_xGcE0A");


// Use a Mapbox vector style instead of the raster style
const mapScreen = () => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
      (async () => {
        // Request permission to access location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
          return;
        }
  
        // Get the user's current location
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      })();
    }, []);

    if (errorMsg) {
        return <Text>{errorMsg}</Text>;
      }
    
      if (!location) {
        return <Text>Loading map...</Text>; // Show loading while location is being fetched
      }
  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Mapbox.MapView
          style={styles.map} // Apply the correct style
          styleURL="mapbox://styles/mapbox/outdoors-v12"// You can use Mapbox's pre-defined styles
        >
          <Mapbox.Camera
            zoomLevel={14}
            centerCoordinate={[location.longitude, location.latitude]} // Set the initial camera position
          />
          {/* Add additional layers or annotations here if needed */}
        </Mapbox.MapView>
      </View>
    </View>
  );
};

export default mapScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    height: 700,
    width: 390,
  },
  map: {
    flex: 1,
  },
});
