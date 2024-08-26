import React, { useState, useEffect } from "react";
import { StyleSheet, View, TextInput, Button,Text, FlatList, TouchableOpacity, Image } from "react-native";
import Mapbox from "@rnmapbox/maps";
import * as Location from 'expo-location';
import axios from 'axios';

// Set your Mapbox access token
Mapbox.setAccessToken("pk.eyJ1IjoiYm9sdXdhdGl0byIsImEiOiJjbTA2cmVwaG4wd3JrMmtzZ2ZrZHp1Y3NyIn0.0U7q1yCc51dpEtk_xGcE0A");

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
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

  const handleSearch = async (query) => {
    if (query.length > 2) { // Start searching after 3 characters
        try {// Start searching after 3 characters
          const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=pk.eyJ1IjoiYm9sdXdhdGl0byIsImEiOiJjbTA2cmVwaG4wd3JrMmtzZ2ZrZHp1Y3NyIn0.0U7q1yCc51dpEtk_xGcE0A`);
          setSuggestions(response.data.features);
      } catch (error) {
        console.error(error);
        setErrorMsg("Failed to fetch location suggestions.");
      }
    } else {
      setSuggestions([]);
    }
  };

    const handleSelectSuggestion = (suggestion) => {
        const coordinates = suggestion.geometry.coordinates;
        setLocation({ longitude: coordinates[0], latitude: coordinates[1] });
        setSearchQuery(suggestion.place_name);
        setSuggestions([]);
      };

  if (errorMsg) {
    return <Text>{errorMsg}</Text>;
  }

  if (!location) {
    return <Text>Loading map...</Text>;
  }

  return (
    <View style={styles.page}>
    <TextInput
      style={styles.searchBar}
      placeholder="Search for a location"
      value={searchQuery}
      onChangeText={(text) => {
        setSearchQuery(text);
        handleSearch(text);
      }}
    />
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectSuggestion(item)}>
              <Text style={styles.suggestion}>{item.place_name}</Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionsContainer}
        />
      )}
      <View style={styles.container}>
        <Mapbox.MapView
          style={styles.map}
          styleURL="mapbox://styles/mapbox/satellite-streets-v12"
        >
          <Mapbox.Camera
            zoomLevel={16}
            centerCoordinate={[location.longitude, location.latitude]}
          />
          <Mapbox.PointAnnotation
            id="userLocation"
            coordinate={[location.longitude, location.latitude]}
          >
            <Image
              source={require('../../../assets/ima/pngwing.png')}
              style={styles.markerImage}
            />
          </Mapbox.PointAnnotation>
        </Mapbox.MapView>
      </View>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight:800
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 8,
    marginBottom: 10,
    width: '80%',
  },
  container: {
    height: 700,
    width: 390,
  },
  map: {
    flex: 1,
  },
  markerImage: {
    width: 100,  // Adjust size based on your marker image
    height: 30, // Adjust size based on your marker image
    resizeMode: 'contain', // Ensures the image is properly contained within the dimensions
  },
});
