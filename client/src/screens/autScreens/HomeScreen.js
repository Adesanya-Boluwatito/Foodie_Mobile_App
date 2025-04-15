import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Animated, Dimensions } from 'react-native';
import restaurantsData from "../../components/data/restaurants_feed.json";
import CarouselIndicator from "../../components/CarouselIndicator";
import readableLocation from "./LocationAccess/LocationAccess1";
import { useToast } from "react-native-toast-notifications";
import { horizontalScale, verticalScale, moderateScale } from '../../theme/Metrics';
import { globalStyles, fonts } from '../../global/styles/theme';
import { useLocation } from '../../context/LocationContext';
import { formatRating, updateRestaurantWithLiveRating } from '../../utils/RatingUtils';

const { width } = Dimensions.get('window');

const adBanners = [
  {
    id: 1,
    image: require("../../../assets/ima/Ad Banneer.png"),
  },
  {
    id: 2,
    image: require("../../../assets/ima/ad-banner3.png"),
  },
];


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

export default function HomeScreen({ route, navigation }) {
  const [userLocation, setUserLocation] = useState('');
  const [mainArea, setMainArea] = useState('');
  const [sortedRestaurants, setSortedRestaurants] = useState([]);
  const [sortedPharmacy, setSortedPharmacy] = useState([]);
  const [nearbyVendors, setNearbyVendors] = useState([]);
  const toast = useToast();
  const scrollX = useRef(new Animated.Value(0)).current;
  const { locationData } = useLocation();


  console.log("locationData", locationData);
  // Update user location from route params or context
  useEffect(() => {
    // First check route params (these take precedence if provided)
    if (route?.params?.readableLocation) {
      const location = route.params.readableLocation;
      console.log("Setting user location from route params:", location);
      setUserLocation(location);
      
      // Extract and set the main area (e.g., "Ikorodu" from "Ikorodu, Lagos, Nigeria")
      const area = extractMainArea(location);
      console.log("Main area extracted from route params:", area);
      setMainArea(area);
    } 
    // If no route params, check location context
    else if (locationData?.readableLocation) {
      const location = locationData.readableLocation;
      console.log("Setting user location from context:", location);
      setUserLocation(location);
      
      // Extract and set the main area (e.g., "Ikorodu" from "Ikorodu, Lagos, Nigeria")
      const area = extractMainArea(location);
      console.log("Main area extracted from context:", area);
      setMainArea(area);
    }
  }, [locationData, route?.params]);

  // Filter and sort vendors based on location
  useEffect(() => {
    // Skip excessive logging to improve performance
    // console.log("Filtering vendors for location:", userLocation);
    
    if (!userLocation) {
      // console.log("No user location set, skipping filtering");
      return;
    }

    // Keep track of component mount state to prevent updates after unmount
    let isMounted = true;

    // Helper function to update restaurants with live ratings in batch for better performance
    const loadRestaurants = async () => {
      try {
        // Filter restaurants by location match
        const matchingRestaurants = restaurantsData.restaurants.filter(restaurant => 
          isLocationMatch(userLocation, restaurant.details.location)
        );
        
        // Skip logging for performance
        // console.log(`Found ${matchingRestaurants.length} matching restaurants`);
        
        // Update restaurants with live ratings from Firebase using batch processing
        const updatedMatchingRestaurants = await batchUpdateRestaurantsWithRatings(matchingRestaurants);
        
        // Check if component is still mounted before updating state
        if (!isMounted) return;
        
        // Sort restaurants by rating and take top 5
        const topRestaurants = [...updatedMatchingRestaurants]
          .sort((a, b) => b.details.rating - a.details.rating)
          .slice(0, 5);
          
        setSortedRestaurants(topRestaurants);
        
        // Filter and sort pharmacies by location match
        const matchingPharmacies = restaurantsData.pharmacy.filter(pharmacy => 
          isLocationMatch(userLocation, pharmacy.details.location)
        );
        
        // Skip logging for performance
        // console.log(`Found ${matchingPharmacies.length} matching pharmacies`);
        
        // Update pharmacies with live ratings in batch
        const updatedMatchingPharmacies = await batchUpdateRestaurantsWithRatings(matchingPharmacies);
        
        // Check if component is still mounted before updating state
        if (!isMounted) return;
        
        const topPharmacies = [...updatedMatchingPharmacies]
          .sort((a, b) => b.details.rating - a.details.rating)
          .slice(0, 5);
          
        setSortedPharmacy(topPharmacies);
      } catch (error) {
        console.error("Error updating restaurants with live ratings:", error);
        
        // Fallback to raw data in case of error
        if (isMounted) {
          // Use existing data as fallback
          const fallbackRestaurants = restaurantsData.restaurants
            .filter(restaurant => isLocationMatch(userLocation, restaurant.details.location))
            .slice(0, 5);
          setSortedRestaurants(fallbackRestaurants);
          
          const fallbackPharmacies = restaurantsData.pharmacy
            .filter(pharmacy => isLocationMatch(userLocation, pharmacy.details.location))
            .slice(0, 5);
          setSortedPharmacy(fallbackPharmacies);
        }
      }
    };
    
    loadRestaurants();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [userLocation]);

  const handleFoodSearch = (category) => {
    navigation.navigate('CategoryRestaurantsScreen', { category });
    console.log('Food Found');
  };

  const handleRestaurantPress = (restaurant) => {
    // Ensure restaurant has all required properties before navigating
    if (!restaurant || !restaurant.id || !restaurant.details) {
      console.error('Invalid restaurant data:', restaurant);
      alert('Restaurant information is not available. Please try again.');
      return;
    }
    
    // Ensure restaurant details includes required properties
    if (!restaurant.details.menu) {
      console.error('Restaurant has no menu data:', restaurant);
      alert('Restaurant menu is not available. Please try again.');
      return;
    }
    
    // Deep clone the restaurant data to avoid reference issues
    const restaurantData = JSON.parse(JSON.stringify(restaurant));
    
    // Navigate with the validated restaurant data
    navigation.navigate('ResturantScreen', { restaurants: restaurantData });
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
    <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
      {/* Offered-Services Container */}
      <View style={styles.offeredServicesContainer}>
        {/* Food */}
        <TouchableOpacity style={styles.serviceItem}>
          <Image
            source={require('../../../assets/ima/food-service.png')}
            style={styles.serviceIcon}
            resizeMode="contain"
          />
          <Text style={styles.serviceTitle}>Food</Text>
          <Text style={styles.serviceTime}>25 mins</Text>
        </TouchableOpacity>

        {/* Mart */}
        <TouchableOpacity style={styles.serviceItem}>
          <Image
            source={require('../../../assets/ima/grocery.png')}
            style={styles.serviceIcon}
            resizeMode="contain"
          />
          <Text style={styles.serviceTitle}>Mart</Text>
          <Text style={styles.serviceTime}>20 mins</Text>
        </TouchableOpacity>

        {/* Pharmacy */}
        <TouchableOpacity style={styles.serviceItem}>
          <Image
            source={require('../../../assets/ima/pharmacy.png')}
            style={styles.serviceIcon}
            resizeMode="contain"
          />
          <Text style={styles.serviceTitle}>Pharmacy</Text>
          <Text style={styles.serviceTime}>30 mins</Text>
        </TouchableOpacity>

        {/* Courier */}
        <TouchableOpacity style={[styles.serviceItem, { marginTop: 10 }, styles.dineInItem]}>
          <Image
            source={require('../../../assets/ima/courier.png')}
            style={styles.serviceIcon}
            resizeMode="contain"
          />
          <Text style={styles.serviceTitle}>Courier</Text>
          <Text style={styles.serviceTime}>No waiting</Text>
        </TouchableOpacity>

        {/* Farmers Market */}
        <TouchableOpacity style={[styles.serviceItem, { marginTop: 10 }, styles.goldMembershipItem]}>
          <Image
            source={require('../../../assets/ima/farm-markt.png')}
            style={styles.serviceIcon}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.serviceTitle}>Farmers Market</Text>
            <Text style={[styles.serviceTime, { padding: 5 }]}>Fresh Farm Produce</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Advertisement Banners */}
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
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

      {/* Popular Restaurants */}
      <View style={styles.popularRestaurantContainer}>
        <View style={{ flexDirection: "row" }}>
          <Text style={[styles.topCatText, styles.topCategoryContainer]}>
            Popular Restaurants {mainArea ? `in ${mainArea}` : ''}
          </Text>
        </View>

        <View style={styles.scrollViewContent}>
          {sortedRestaurants.length > 0 ? (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.shadowProp}>
              {sortedRestaurants.map((restaurant) => (
                <TouchableOpacity key={restaurant.id} onPress={() => handleRestaurantPress(restaurant)}>
                  <View style={styles.restaurantContainer}>
                    <Image source={{ uri: restaurant.details.logo }} style={styles.resturantImage} />
                    <Text style={styles.restaurantname}>{restaurant.name}</Text>
                    <Text style={styles.restaurantDetails}>Japanese | Seafood | Sushi</Text>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingText}>⭐{formatRating(restaurant.details.rating)}</Text>
                      <Text style={styles.explorelocation} numberOfLines={1} ellipsizeMode="tail">
                        | {restaurant.details.location}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            renderEmptyRestaurantsMessage()
          )}
        </View>
      </View>

      {/* Pharmacy Near Me */}
      <View style={styles.popularRestaurantContainer}>
        <View style={{ flexDirection: "row" }}>
          <Text style={[styles.topCatText, styles.topCategoryContainer]}>
            Pharmacy Near {mainArea || 'Me'}
          </Text>
        </View>

        <View style={styles.scrollViewContent}>
          {sortedPharmacy.length > 0 ? (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.shadowProp}>
              {sortedPharmacy.map((pharmacy) => (
                <TouchableOpacity key={pharmacy.id} onPress={() => handleRestaurantPress(pharmacy)}>
                  <View style={styles.restaurantContainer}>
                    <Image source={{ uri: pharmacy.details.logo }} style={styles.resturantImage} />
                    <Text style={styles.restaurantname}>{pharmacy.name}</Text>
                    <Text style={styles.restaurantDetails}>Pharmacy | Medical | Health</Text>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingText}>⭐{formatRating(pharmacy.details.rating)}</Text>
                      <Text style={styles.explorelocation} numberOfLines={1} ellipsizeMode="tail">
                        | {pharmacy.details.location}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyMessageContainer}>
              <Text style={styles.emptyMessageText}>
                No pharmacies available in {mainArea || 'your area'}.
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Empty container style for messages */}
      {!styles.emptyMessageContainer && (
        <View>
          {/* This will be replaced by the actual styles you define */}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation:10
  },
  topCategoryContainer: {
    paddingTop: 15,
    borderColor: "#000",
  },
  topCatText:{
    fontSize: 25,
    fontWeight:"bold"
  },
  scrollViewContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingVertical: 17,
  },
  imageContainer: {
    // Styles for image container
  },
  image: {
    width: horizontalScale(250),
    height: verticalScale(150),
  },
  popularRestaurantContainer:{
    marginVertical:10
  },
  restaurantContainer: {
    marginHorizontal: 8,
    borderRadius: 20,
    width: horizontalScale(160),
  },
  resturantImage: {
    width: horizontalScale(160),
    height: verticalScale(160),
    borderRadius: 20,
    alignSelf:"center"
  },
  restaurantname: {
    fontFamily: fonts.bold,
    fontSize:18,
    fontWeight: "700",
  },
  restaurantDetails: {
    // Styles for restaurant details
  },
  ratingText: {
    fontSize: 17,
    color: "#8b8c89",
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems:"center"
  },
  explorelocation: {
    fontSize: 17,
    color: "#8b8c89",
    marginLeft: 10,
    flexShrink: 1,
    maxWidth: "70%" 
  },
  offeredServicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(6),
    marginTop: verticalScale(20),
  },
  serviceItem: {
    width: '30%',
    backgroundColor: '#F8F8F8',
    borderRadius: moderateScale(10),
    padding: moderateScale(10),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dineInItem: {
    width: '30%',
  },
  goldMembershipItem: {
    width: '65%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: moderateScale(15),
  },
  serviceIcon: {
    width: horizontalScale(50),
    height: verticalScale(50),
    marginBottom: verticalScale(5),
  },
  serviceTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginVertical: verticalScale(2),
  },
  serviceTime: {
    fontSize: moderateScale(12),
    color: '#666',
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
  }
});

const emptyMessageStyles = {
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
  }
};