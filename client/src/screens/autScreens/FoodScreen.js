import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import restaurantsData from "../../components/data/restaurants_feed.json"
import CarouselIndicator from "../../components/CarouselIndicator"
import Icon from 'react-native-vector-icons/Ionicons';
import { horizontalScale, verticalScale, moderateScale } from '../../theme/Metrics';
import { globalStyles, fonts } from '../../global/styles/theme';
import { useLocation } from '../../context/LocationContext';
import { formatRating, updateRestaurantWithLiveRating } from '../../utils/RatingUtils';

const categories = [
  { id: '1', name: 'Pizza', icon: require('../../../assets/ima/Pizza.jpg') },
  { id: '2', name: 'Burger', icon: require('../../../assets/ima/Burger.jpg') },
  { id: '3', name: 'Jollof', icon: require('../../../assets/ima/Jollof Rice.jpg') },
  { id: '4', name: 'Pasta', icon: require('../../../assets/ima/Pasta.jpg') },
  { id: '5', name: 'Swallow', icon: require('../../../assets/ima/Abula1.jpg') },
];

const { width } = Dimensions.get('window');

const adBanners = [
  {
      "id": 1,
      "image": require("../../../assets/ima/Ad Banneer.png"),
  },  

  {
      "id": 2,
      "image": require("../../../assets/ima/ad-banner3.png")
  }
]

// Helper function to normalize location text for comparison
const normalizeLocationText = (text) => {
  if (!text) return '';
  return text.toLowerCase().trim();
};

// Enhanced location matcher that checks if keywords are present
const isLocationMatch = (userLocation, vendorLocation) => {
  if (!userLocation || !vendorLocation) return false;
  
  // Normalize both locations
  const normalizedUserLocation = normalizeLocationText(userLocation);
  const normalizedVendorLocation = normalizeLocationText(vendorLocation);
  
  // Extract keywords from user location (typically city and area names)
  const userLocationParts = normalizedUserLocation.split(',').map(part => part.trim());
  
  // Check if any part of the user's location appears in the vendor's location
  return userLocationParts.some(part => {
    // Skip very short parts (like single letters)
    if (part.length < 3) return false;
    
    // Check if this part of user location is in vendor location
    return normalizedVendorLocation.includes(part);
  });
};

// Function to extract the main area name from a location string
const extractMainArea = (location) => {
  if (!location) return '';
  
  // Split the location by commas and clean each part
  const parts = location.split(',').map(part => part.trim());
  
  // Return the first part as the main area
  return parts[0] || '';
};

export default function FoodScreen({ navigation, route }) {
    console.log('FoodScreen rendered with navigation:', !!navigation);

    const [sortedRestaurants, setSortedRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [userLocation, setUserLocation] = useState('');
    const [mainArea, setMainArea] = useState('');
    const scrollX = useRef(new Animated.Value(0)).current;
    const { locationData } = useLocation();

    // Update user location from location context or route params
    useEffect(() => {
      // First check route params (these take precedence if provided)
      if (route?.params?.readableLocation) {
        const location = route.params.readableLocation;
        console.log("Setting user location in FoodScreen from route params:", location);
        setUserLocation(location);
        
        // Extract and set the main area (e.g., "Ikorodu" from "Ikorodu, Lagos, Nigeria")
        const area = extractMainArea(location);
        console.log("Main area extracted in FoodScreen from route params:", area);
        setMainArea(area);
      }
      // If no route params, check location context
      else if (locationData?.readableLocation) {
        const location = locationData.readableLocation;
        console.log("Setting user location in FoodScreen from context:", location);
        setUserLocation(location);
        
        // Extract and set the main area (e.g., "Ikorodu" from "Ikorodu, Lagos, Nigeria")
        const area = extractMainArea(location);
        console.log("Main area extracted in FoodScreen from context:", area);
        setMainArea(area);
      }
    }, [locationData, route?.params]);

    // Filter and sort restaurants based on location
    useEffect(() => {
      // Skip excessive logging
      // console.log("Filtering restaurants for location in FoodScreen:", userLocation);
      
      // Create a local cache for this component's restaurant data
      let isMounted = true;
      
      const loadRestaurants = async () => {
        try {
          if (!userLocation) {
            // If no location set, just get top rated restaurants without waiting for live ratings
            const sorted = [...restaurantsData.restaurants];
            
            // Use batch processing for better performance
            const updatedRestaurants = await batchUpdateRestaurantsWithRatings(sorted);
            
            if (!isMounted) return;
            
            // Sort by rating and take top 5
            const topRated = [...updatedRestaurants]
              .sort((a, b) => b.details.rating - a.details.rating)
              .slice(0, 5);
            
            setSortedRestaurants(topRated);
            setFilteredRestaurants(updatedRestaurants);
            return;
          }

          // Pre-filter restaurants by location match for better performance
          const matchingRestaurants = restaurantsData.restaurants.filter(restaurant => 
            isLocationMatch(userLocation, restaurant.details.location)
          );
          
          // Skip excessive logging
          // console.log(`Found ${matchingRestaurants.length} matching restaurants in FoodScreen`);

          // Use batch update for better performance
          const updatedMatchingRestaurants = await batchUpdateRestaurantsWithRatings(matchingRestaurants);
          
          if (!isMounted) return;
          
          // Sort restaurants by rating and take top 5
          const topRestaurants = [...updatedMatchingRestaurants]
            .sort((a, b) => b.details.rating - a.details.rating)
            .slice(0, 5);
          
          setSortedRestaurants(topRestaurants);
          
          // For explore section - all matching restaurants or all if none match
          if (updatedMatchingRestaurants.length > 0) {
            setFilteredRestaurants(updatedMatchingRestaurants);
          } else {
            // If no matches, load all restaurants without waiting for ratings
            const allRestaurants = await batchUpdateRestaurantsWithRatings(restaurantsData.restaurants);
            if (isMounted) {
              setFilteredRestaurants(allRestaurants);
            }
          }
        } catch (error) {
          console.error("Error updating restaurants with live ratings:", error);
          
          // Fall back to local data on error
          if (isMounted) {
            const fallbackRestaurants = restaurantsData.restaurants.slice(0, 5);
            setSortedRestaurants(fallbackRestaurants);
            setFilteredRestaurants(restaurantsData.restaurants);
          }
        }
      };
      
      loadRestaurants();
      
      // Cleanup function to prevent state updates if component unmounts
      return () => {
        isMounted = false;
      };
    }, [userLocation]);

    const handleRestaurantPress = (restaurants) => {
      console.log('Restaurant pressed, navigation:', !!navigation);
      if (navigation) {
        navigation.navigate('ResturantScreen', { restaurants });
      } else {
        console.error('Navigation prop is undefined');
      }
    };

    // Fallback message when no restaurants are available
    const renderEmptyRestaurantsMessage = () => (
      <View style={styles.emptyMessageContainer}>
        <Text style={styles.emptyMessageText}>
          No restaurants available in {mainArea || 'your area'}.
        </Text>
      </View>
    );

  return (    
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Categories */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Image source={item.icon} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>{item.name}</Text>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />

      {/* Promotion Banner */}
      <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
            // pagingEnabled={true}
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
        >
            {adBanners.map((item) => (
                <TouchableOpacity key={item.id}>
                    <View style={[styles.imageContainer, { width }]}>
                        <Image 
                            source={item.image} 
                            style={[styles.image, { width }]} 
                            resizeMode={"cover"}
                        />
                    </View>
                </TouchableOpacity>
            ))}
      </ScrollView>
      <CarouselIndicator 
          scrollX={scrollX} 
          data={adBanners} 
          itemWidth={width}
      />

      {/* Top Rated Restaurants */}
      <View style={styles.RatedRestaurant}>
        <Text style={styles.sectionTitle}>
          Top Rated Restaurants {mainArea ? `in ${mainArea}` : ''}
        </Text>
        {sortedRestaurants.length > 0 ? (
          <FlatList
              horizontal
              data={sortedRestaurants}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.restaurantContainer} onPress={() => handleRestaurantPress(item)}>
                  <Image source={{ uri: item.details.logo }} style={styles.restaurantImage} />
                    <Text style={styles.restaurantName}>{item.name}</Text>
                    <Text style={styles.restaurantDetails}>Japanese | Seafood | Sushi</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>⭐ {formatRating(item.details.rating)}</Text>
                    <Text style={styles.ratingLocation} numberOfLines={1} ellipsizeMode="tail"> | {item.details.location}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topRatedListContainer}
            />
        ) : (
          renderEmptyRestaurantsMessage()
        )}
      </View>
      

      {/* Restaurants To Explore */}
      <View style={styles.exploreContainer}>
        <Text style={styles.sectionTitle}>
          Restaurants To Explore {mainArea ? `in ${mainArea}` : ''}
        </Text>
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
            <TouchableOpacity key={restaurant.id} style={styles.restaurantExploreCard} onPress={() => handleRestaurantPress(restaurant)}>
                {/* Restaurant Image */}
                <Image 
                    source={{ uri: restaurant.details.menu[0].image }} 
                    style={styles.exploreRestaurantImage} 
                />
                {/* Restaurant Details */}
                <View style={styles.restaurantDetailsContainer}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    <Text style={styles.restaurantDetails}>
                    {restaurant.details.description || 'Cuisine not available'}
                    </Text>
                    <View style={styles.ratingAndLocation}>
                        <Text style={styles.restaurantRating}>⭐ {formatRating(restaurant.details.rating)}</Text>
                        <Text style={styles.restaurantDistance}>
                            {restaurant.details.distance} | {restaurant.details.deliveryTime}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
          ))
        ) : (
          renderEmptyRestaurantsMessage()
        )}
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
container: {
  flex: 1,
  paddingTop: verticalScale(20),
//   backgroundColor: '#fff',
  // padding: 15,
},
    
categoryItem: {
  alignItems: 'center',
  marginHorizontal: horizontalScale(10),
  paddingTop: horizontalScale(10),
  paddingBottom: verticalScale(30),
},
categoryIcon: {
  width: horizontalScale(60),
  height: verticalScale(60),
  borderRadius: moderateScale(30),
  marginBottom: horizontalScale(5),
},
categoryText: {
  fontSize: moderateScale(12),
  fontFamily: fonts.bold,
  fontWeight: 'bold',
  // color: '#555',
  textAlign: 'center',
},

scrollViewContent: {
  flexDirection: 'row', // Horizontal scroll
  flexWrap: 'wrap', // Wrap items to next line if needed
  alignItems: 'center', // Center items horizontally
  paddingVertical: verticalScale(17), // Add vertical padding
  
},
imageContainer: {
    // margin: 10, 
    // marginHorizontal: 5,// Add margin around each image
},
image: {
    width: horizontalScale(220), // Set image width
    height: verticalScale(120), // Set image height
},

RatedRestaurant: {
  paddingTop: verticalScale(18),
},

restaurantContainer: {
  width: horizontalScale(140),  // Ensure fixed width
  marginHorizontal: horizontalScale(10),  // Add even spacing
  borderRadius: moderateScale(15),
  
},

sectionTitle: {
  fontSize: moderateScale(23),
  fontFamily: fonts.bold,
  fontWeight: 'bold',
  marginBottom: horizontalScale(10),
},

restaurantImage: {
  width: horizontalScale(150),
  height: verticalScale(150),
  borderRadius: 10,
  marginBottom: 5,
},

restaurantName: {
  fontFamily: fonts.bold,
  fontSize:moderateScale(17),
  fontWeight: "700",
},


ratingContainer: {
  flexDirection: 'row',
  alignItems:"center"

},


exploreContainer: {
    paddingTop: horizontalScale(25),
    marginTop: horizontalScale(20),
    // borderWidth: 1,
    // borderColor: "#000",
    
},
restaurantExploreCard: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: moderateScale(15),
  padding: moderateScale(10),
  marginBottom: verticalScale(15),
 // Shadow for Android
//  shadowColor: '#000',
//   shadowOffset: { width: 0, height: 1 },
//   shadowOpacity: 0.2,
//   shadowRadius: 1.5,
//   elevation: 1,
},

exploreRestaurantImage: {
  width: horizontalScale(100),
  height: verticalScale(100),
  borderRadius: moderateScale(10),
  marginRight: horizontalScale(10),
},

restaurantDetailsContainer: {
  flex: 1,
  justifyContent: 'center',
},

restaurantName: {
  fontSize: moderateScale(16),
  fontWeight: 'bold',
  marginBottom: verticalScale(5),
  color: '#333',
},

restaurantDetails: {
  fontSize: moderateScale(13),
  color: '#777',
  marginBottom: verticalScale(5),
},

ratingAndLocation: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

restaurantRating: {
  fontSize: moderateScale(13),
  color: '#FFA500', // Star color
  fontWeight: '600',
},

restaurantDistance: {
  fontSize: moderateScale(12),
  color: '#888',
},

emptyMessageContainer: {
  padding: 20,
  alignItems: 'center',
  justifyContent: 'center',
  height: 150,
},
emptyMessageText: {
  fontSize: 16,
  color: '#666',
  textAlign: 'center',
},

ratingText: {
  fontSize: 17,
  color: "#8b8c89",
},

ratingLocation: {
  fontSize: 17,
  color: "#8b8c89",
  marginLeft: 10,
  flexShrink: 1,
  maxWidth: "70%" 
},
});

