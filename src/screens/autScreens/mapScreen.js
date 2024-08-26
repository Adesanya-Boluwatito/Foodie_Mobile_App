import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, TextInput, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
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

  const handleSearch = useCallback(async (query) => {
    if (query.length > 2) { // Start searching after 3 characters
      try {
        const bbox = [-3.0, 4.0, 15.0, 14.0]; // Bounding box coordinates for Nigeria
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`, {
          params: {
            access_token: "pk.eyJ1IjoiYm9sdXdhdGl0byIsImEiOiJjbTA2cmVwaG4wd3JrMmtzZ2ZrZHp1Y3NyIn0.0U7q1yCc51dpEtk_xGcE0A",
            bbox: bbox.join(','), // Bounding box
          }
        });
        setSuggestions(response.data.features);
      } catch (error) {
        console.error(error);
        setErrorMsg("Failed to fetch location suggestions.");
      }
    } else {
      setSuggestions([]);
    }
  }, []);

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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4D4D" />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Mapbox.MapView
        style={styles.map}
        styleURL="mapbox://styles/mapbox/streets-v12"
      >
        <Mapbox.Camera
          zoomLevel={14}
          centerCoordinate={[location.longitude, location.latitude]}
        />
        <Mapbox.PointAnnotation
          id="userLocation"
          coordinate={[location.longitude, location.latitude]}
        >
          {/* <Image
            source={require('../../../assets/ima/pngwing.png')}
            style={styles.markerImage}
          /> */}
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>

      <View style={styles.currentLocationContainer}>
        <Text style={styles.currentLocationText}>Current Location:</Text>
        <Text style={styles.currentLocation}>{`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}</Text>
      </View>

      <View style={styles.searchContainer}>
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
      </View>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  currentLocationContainer: {
    position: 'absolute',
    bottom: 80,
    left: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 5,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentLocation: {
    fontSize: 14,
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 1,
    padding: 10,
  },
  searchBar: {
    height: 50,
    borderColor: 'gray',
    borderRadius: 20,
    paddingLeft: 8,
    backgroundColor: '#fff',
  },
  suggestionsContainer: {
    marginTop: 5,
    maxHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 3,
    zIndex: 2,
  },
  suggestion: {
    padding: 10,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
