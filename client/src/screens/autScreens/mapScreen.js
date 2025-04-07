// import React, { useState, useEffect, useCallback } from "react";
// import { StyleSheet, View, TextInput, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
// import { useNavigation, useRoute } from '@react-navigation/native';
// import Mapbox from "@rnmapbox/maps";
// import * as Location from 'expo-location';
// import axios from 'axios';

// // Set your Mapbox access token
// Mapbox.setAccessToken("pk.eyJ1IjoiYm9sdXdhdGl0byIsImEiOiJjbTA2cmVwaG4wd3JrMmtzZ2ZrZHp1Y3NyIn0.0U7q1yCc51dpEtk_xGcE0A");

// const MapScreen = () => {
//   const [location, setLocation] = useState(null);
//   const [readableLocation, setReadableLocation] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [suggestions, setSuggestions] = useState([]);
//   const [errorMsg, setErrorMsg] = useState(null);
//   const navigation = useNavigation();

//   const handlSetLocations = () => {
//     console.log("Location before navigation:", readableLocation)
//     navigation.navigate('Home', {readableLocation })
//     console.log("Location after navigation:",readableLocation)
//   }

//   const getReadableLocation = useCallback(async (latitude, longitude) => {
//     try {
//       const response = await axios.get(
//         `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
//         {
//           params: {
//             access_token: "pk.eyJ1IjoiYm9sdXdhdGl0byIsImEiOiJjbTA2cmVwaG4wd3JrMmtzZ2ZrZHp1Y3NyIn0.0U7q1yCc51dpEtk_xGcE0A",
//             types: "place" // Finer details
//           },
//         }
//       );
  
//       if (response.data && response.data.features.length > 0) {
//         // Try to find the most specific feature, such as locality or neighborhood
//         const detailedFeature = response.data.features.find(
//           (feature) => feature.place_type.includes('neighborhood') || feature.place_type.includes('locality')
//         );
  
//         // Fallback to the first feature if no detailed feature is found
//         if (detailedFeature) {
//           setReadableLocation(detailedFeature.place_name);
//         } else {
//           setReadableLocation(response.data.features[0].place_name);
//           console.log(readableLocation)
//         }
//       } else {
//         setReadableLocation("Location not found");
//       }
//     } catch (error) {
//       console.error("Reverse Geocoding error:", error);
//       setReadableLocation("Failed to fetch location name.");
//     }
//   }, []);
  

//   useEffect(() => {
//     (async () => {
//       // Request permission to access location
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         setErrorMsg('Permission to access location was denied');
//         return;
//       }

//       // Get the user's current location
//       let currentLocation = await Location.getCurrentPositionAsync({});
//       setLocation(currentLocation.coords);
//       // console.log(currentLocation)

//       getReadableLocation(currentLocation.coords.latitude, currentLocation.coords.longitude);
//     })();
//   }, [getReadableLocation]);

//   const handleSearch = useCallback(async (query) => {
//     if (query.length > 2) { // Start searching after 3 characters
//       try {
//         const bbox = [-3.0, 4.0, 15.0, 14.0]; // Bounding box coordinates for Nigeria
//         const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`, {
//           params: {
//             access_token: "pk.eyJ1IjoiYm9sdXdhdGl0byIsImEiOiJjbTA2cmVwaG4wd3JrMmtzZ2ZrZHp1Y3NyIn0.0U7q1yCc51dpEtk_xGcE0A",
//             bbox: bbox.join(','), // Bounding box
//           }
//         });
//         setSuggestions(response.data.features);
//       } catch (error) {
//         console.error(error);
//         setErrorMsg("Failed to fetch location suggestions.");
//       }
//     } else {
//       setSuggestions([]);
//     }
//   }, []);

//   const handleSelectSuggestion = (suggestion) => {
//     const coordinates = suggestion.geometry.coordinates;
//     setLocation({ longitude: coordinates[0], latitude: coordinates[1] });
//     setSearchQuery(suggestion.place_name);
//     setSuggestions([]);

//     getReadableLocation(coordinates[1], coordinates[0]);
//   };

//   if (errorMsg) {
//     return <Text>{errorMsg}</Text>;
//   }

//   if (!location) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#FF4D4D" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.page}>
//       <Mapbox.MapView
//         style={styles.map}
//         styleURL="mapbox://styles/mapbox/streets-v12"
//       >
//         <Mapbox.Camera
//           zoomLevel={14}
//           centerCoordinate={[location.longitude, location.latitude]}
//         />
//         <Mapbox.PointAnnotation
//           id="userLocation"
//           coordinate={[location.longitude, location.latitude]}
//         >
//           {/* <Image
//             source={require('../../../assets/ima/pngwing.png')}
//             style={styles.markerImage}
//           /> */}
//         </Mapbox.PointAnnotation>
//       </Mapbox.MapView>

//       <View style={styles.currentLocationContainer}>
//         <Text style={styles.currentLocationText}>Current Location:</Text>
//         <Text style={styles.currentLocation}>{readableLocation}</Text>
//       </View>

//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchBar}
//           placeholder="Search for a location"
//           value={searchQuery}
//           onChangeText={(text) => {
//             setSearchQuery(text);
//             handleSearch(text);
//           }}
//         />
//         {suggestions.length > 0 && (
//           <FlatList
//             data={suggestions}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <TouchableOpacity onPress={() => handleSelectSuggestion(item)}>
//                 <Text style={styles.suggestion}>{item.place_name}</Text>
//               </TouchableOpacity>
//             )}
//             style={styles.suggestionsContainer}
//           />
//         )}
//       </View>
//       <TouchableOpacity
//         style={styles.navigateButton}
//         onPress={() => handlSetLocations()}
        
//       >
//         <Text style={styles.buttonText}>📌Set Location</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default MapScreen;

// const styles = StyleSheet.create({
//   page: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   currentLocationContainer: {
//     position: 'absolute',
//     bottom: 80,
//     left: 10,
//     right: 10,
//     zIndex: 1,
//     backgroundColor: '#fff',
//     padding: 10,
//     borderRadius: 10,
//     elevation: 5,
//   },
//   currentLocationText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   currentLocation: {
//     fontSize: 14,
//   },
//   searchContainer: {
//     position: 'absolute',
//     top: 50,
//     left: 10,
//     right: 10,
//     zIndex: 1,
//     padding: 10,
//   },
//   searchBar: {
//     height: 50,
//     borderColor: 'gray',
//     borderRadius: 20,
//     paddingLeft: 8,
//     backgroundColor: '#fff',
//   },
//   suggestionsContainer: {
//     marginTop: 5,
//     maxHeight: 200,
//     backgroundColor: '#fff',
//     borderRadius: 5,
//     elevation: 3,
//     zIndex: 2,
//   },
//   suggestion: {
//     padding: 10,
//     fontSize: 16,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   navigateButton: {
//     position: 'absolute',
//     bottom: 20,
//     // left: 10,
//     // right: 10,
//     width:150,
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent:"center",
//     alignSelf:'center',
//     elevation: 5
//   },
//   buttonText: {
//     color: '#000000',
//     fontSize: 16,
//     fontWeight: "bold",
//   },
  
// });
