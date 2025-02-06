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
  SafeAreaView
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import restaurantsData from "../../components/data/restaurants_feed.json"
import CarouselIndicator from "../../components/CarouselIndicator"
import Icon from 'react-native-vector-icons/Ionicons';
import { horizontalScale, verticalScale, moderateScale } from '../../theme/Metrics';
import { globalStyles, fonts } from '../../global/styles/theme';

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


export default function FoodScreen  ({restaurants}) {


    const [sortedRestaurants, setSortedRestaurants] = useState([]);
    const scrollX = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation();


    useEffect(() => {
        const fetchSortedRestaurants = async () => {
            const sorted = [...restaurantsData.restaurants]
                .sort((a, b) => b.details.rating - a.details.rating)
                .slice(0, 5);
            setSortedRestaurants(sorted);
        };
      fetchSortedRestaurants();
    }, [restaurantsData]);

    const handleRestaurantPress = (restaurants) => {
      navigation.navigate('ResturantScreen', { restaurants });
    }


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
        <Text style={styles.sectionTitle}>Top Rated Restaurants</Text>
        <FlatList
            horizontal
            data={sortedRestaurants}  // Ensure `sortedRestaurants` is the array you're mapping over
            keyExtractor={(item) => item.id.toString()}  // Ensure each item has a unique key
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.restaurantContainer} onPress={() => handleRestaurantPress(item)}>
                <Image source={{ uri: item.details.logo }} style={styles.restaurantImage} />
                  <Text style={styles.restaurantName}>{item.name}</Text>
                  <Text style={styles.restaurantDetails}>Japanese | Seafood | Sushi</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>⭐ {item.details.rating}</Text>
                  <Text style={styles.ratingLocation} numberOfLines={1} ellipsizeMode="tail"> | {item.details.location}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}  // This removes the scrollbar
            contentContainerStyle={styles.topRatedListContainer}
          />

      </View>
      

      {/* Restaurants To Explore */}
      <View style={styles.exploreContainer}>
    <Text style={styles.sectionTitle}>Restaurants To Explore</Text>
    {restaurantsData.restaurants.map((restaurant) => (
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
                    <Text style={styles.restaurantRating}>⭐ {restaurant.details.rating}</Text>
                    <Text style={styles.restaurantDistance}>
                        {restaurant.details.distance} | {restaurant.details.deliveryTime}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    ))}
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
    


});

