import React, { useState,useEffect } from 'react';
import { View, Text, StyleSheet,TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, SafeAreaView, Alert} from 'react-native';
import restaurantsData from "../../components/data/restaurants_feed.json"
import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useToast } from "react-native-toast-notifications"



const images = [
    {
        id: 1,
        url: "https://i.pinimg.com/564x/b8/b5/d7/b8b5d7b7bb12ba423afc38d3401025c1.jpg",
        name: "Jollof Rice"
    },
    {
        id: 2,
        url: "https://i.pinimg.com/564x/a9/b8/a2/a9b8a266a4c061ca6ab6af63cf2e7caa.jpg",
        name: "Ice cream"
    },
    {
        id: 3,
        url: "https://i.pinimg.com/564x/1e/65/4f/1e654fac595d426d7ffffccd754b5977.jpg",
        name:"Burger"
    },
    {
        id: 4,
        url: "https://i.pinimg.com/564x/bf/97/51/bf9751c3245329ba2c05457d264418bb.jpg",
        name: "Shawarma"
    },
    {
        id: 5,
        url: "https://i.pinimg.com/564x/4c/c7/9f/4cc79f76b53e00505c9facf01811f952.jpg",
        name: "Fried rice"
    },
    {
        id: 6,
        url: "https://i.pinimg.com/564x/b1/4e/96/b14e967be4d2d4d121ec19d6de13ea7c.jpg",
        name: "Pizza"
    }
];



export default function HomeScreen({navigation}) {
    

    const [search, setSearch] = useState('');
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [address, setAddress] = useState(null);
    const [sortedRestaurants, setSortedRestaurants] = useState([]);
    const toast = useToast();
    


    useEffect(() => {
        const sorted = [...restaurantsData.restaurants]
          .sort((a, b) => b.details.rating - a.details.rating)
          .slice(0, 5);
        setSortedRestaurants(sorted);
      }, []);
    // const sortedRestauarnts = restaurantsData.restaurants.sort((a,b) => b.details.rating - a.details.rating).slice(0,5);

    const handleFoodSearch = () => {
        // Add your logic for handling food search here
        console.log('Food Found');
    }
    const handleLocationSearch = async () => {
    //     const { status } = await Location.requestForegroundPermissionsAsync();
    //     navigation.navigate("Map")
    // if (status !== 'granted') {
    //   setErrorMsg('Permission to access location was denied');
    //   Alert.alert('Permission denied', 'You need to enable location permissions to use this feature.');
    //   return;
    // }

    // try {
    //   // Get the current location
    //   const location = await Location.getCurrentPositionAsync({});
    //   setLocation(location);

    //   if (location) {
    //     // Reverse geocode the coordinates to get a human-readable address
    //     const [reverseGeocodeResult] = await Location.reverseGeocodeAsync({
    //       latitude: location.coords.latitude,
    //       longitude: location.coords.longitude,
    //     });

    //     // Format the address (landmark or key location)
    //     if (reverseGeocodeResult) {
    //       const formattedAddress = `${reverseGeocodeResult.name || ''} ${reverseGeocodeResult.street || ''}, ${reverseGeocodeResult.city || ''}, ${reverseGeocodeResult.region || ''}`;
    //       setAddress(formattedAddress);
    //       toast.show("Location Found", {
    //         type: "success",
    //         placement: "top",
    //         duration: 4000,
    //         offsetTop: 30,
    //         animationType:'zoom-in'
    //       })
    //     }
    //   }
    // } catch (error) {
    //   Alert.alert('Error', 'Failed to get location information. Please try again.');
    // }
        navigation.navigate("Map")
        console.log('Location Found')
    };

    const handleRestaurantPress = (restaurants) => {
    navigation.navigate('ResturantScreen', { restaurants });
  }
    
    // const limitedRestaurants = restaurants.slice(0, 5);

      
    

    return( 
        <SafeAreaView style={styles.container}>

            <View style={styles.searchBarContainer}>


                <View style={[styles.locationContainer, styles.shadowProp]}>
                    <TouchableOpacity style={styles.emoji} onPress={handleLocationSearch}>
                    <Ionicons name="location-outline" size={26} color="black"/>
                    </TouchableOpacity>

                </View>
                {/* {address && (
          <Text style={styles.addressText}>
            {address}
          </Text>
        )} */}

                <View style={[styles.TextInput1, styles.shadowProp]}>
                    <TextInput
                     style={styles.input}
                     value={search}
                     placeholder='Search for meals or area'
                     onChangeText={setSearch}
                    />
                    <TouchableOpacity onPress={handleFoodSearch}>
                    <Ionicons name="search-outline" size={24} color="black" style={styles.searchIcon} />
                    </TouchableOpacity>

                </View>

            </View>
        <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
            <View style={styles.topCategoryContainer}>
                <Text style={styles.topCatText}> Top Categories</Text> 
            </View>

            <View contentContainerStyle={styles.scrollViewContent}>
            
            <ScrollView  horizontal={true} showsHorizontalScrollIndicator={false}>
            {images.map((item) => (
                <TouchableOpacity key={item.id} onPress={handleFoodSearch}>
                <View  style={styles.imageContainer}>
                    <Image source={{ uri: item.url }} style={styles.image} />
                    <Text style={styles.imageName}>{item.name}</Text>
                </View>
                </TouchableOpacity>
            ))}
            </ScrollView>
            
            </View>

            <View style={{flexDirection:"row"}}>
                <Text style={[styles.topCatText, styles.topCategoryContainer]} > Popular Resturants</Text>
                <TouchableOpacity style ={styles.viewallContainer} onPress={() => navigation.navigate('AllRestaurants')}>
                    <Text style={styles.viewallText}> View all</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.scrollViewContent}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.shadowProp}>
                {sortedRestaurants.map((restaurants, index) => (
                    <TouchableOpacity key={restaurants.id} onPress={() => handleRestaurantPress(restaurants)}>
                        
                    <View style={styles.restaurantContainer}>
                        <Image source={{ uri: restaurants.details.logo}} style={styles.resturantImage} />
                        <View style={styles.restaurantNameContainer}>
                        <Text style={styles.name}>{restaurants.name} </Text>
                        </View>
                        {/* <Text style={styles.price}>{restaurant.price}</Text> */}
                        <Text style={styles.location}>{restaurants.details.location}</Text>
                    </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            </View>


            <View>
                <Text style={[styles.topCatText, styles.topCategoryContainer]} > Nearby Deal</Text>
            </View>

            <View style={styles.scrollViewContent}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.shadowProp}>
                {sortedRestaurants.map((restaurants, index) => (
                    <TouchableOpacity key={restaurants.id} onPress={() => navigation.navigate('Restaurant')}>
                    <View style={styles.restaurantContainer}>
                        <Image source={{ uri: restaurants.details.logo }} style={styles.resturantImage} />
                        <View style={styles.restaurantNameContainer}>
                        <Text style={styles.name}>{restaurants.name}</Text>
                        </View>
                        {/* <Text style={styles.price}>{restaurant.price}</Text> */}
                        <Text style={styles.location}>{restaurants.details.location}</Text>
                    </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            </View>

            {/* <View style={styles.scrollViewContent}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.shadowProp}>
                {limitedRestaurants.map((restaurant) => (
                    <TouchableOpacity onPress={() => navigation.navigate('Restaurant')}>
                    <View key={restaurant.id} style={styles.restaurantContainer}>
                        <Image source={{ uri: restaurant.image }} style={styles.resturantImage} />
                        <View style={styles.restaurantNameContainer}>
                        <Text style={styles.name}>{restaurant.name}</Text>
                        </View>
                        <Text style={styles.price}>{restaurant.price}</Text>
                        <Text style={styles.location}>{restaurant.location}</Text>
                    </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            </View> */}

            </ScrollView>


            















            
        </SafeAreaView>
    )

    
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        
        // justifyContent: 'center', // You can change this to 'flex-end' to move the button to the bottom
        // alignItems: 'center',
        backgroundColor: "#fffbf8",
        padding: 20, // Optional padding for the container
        paddingTop:70,
        // minHeight: 1000, // Adjust this value as needed (e.g., minHeight: 700)
        // height:"100vh",
        paddingBottom: 0,
      }, 
      locationContainer: {
        backgroundColor: "white",
        borderColor:"black",
        borderRadius:7,
        width: 40,
        height:45,
        alignItems:'center',
        // marginTop:25,

        // paddingTop:,
      },
      emoji: {
        paddingTop: 10,
      },
      shadowProp: {
        shadowColor: '#171717',
        shadowOffset: {width: -2, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation:10
    },
    TextInput1: {
        backgroundColor:"white",
        paddingRight: 27 ,
        paddingLeft:10,
        
        paddingVertical: 10,
        marginHorizontal: 20,
        borderRadius:7,
        // marginBottom:30,
        // marginTop: 60,
        // marginStart: 10,
        width:280,
        // height:50,
      },
      searchBarContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    input: {
    fontSize: 20,
    marginLeft: 10,
    width: "90%",
  },
  searchIcon: {
    position: 'absolute',
    right: -10,
    top: -24,
    zIndex: 1,
},
topCategoryContainer: {
    paddingTop: 25,
},
topCatText:{
    fontSize: 25,
    fontWeight:"bold"
},
scrollViewContent: {
    flexDirection: 'row', // Horizontal scroll
    flexWrap: 'wrap', // Wrap items to next line if needed
    padding: 10, // Add padding between images
    alignItems: 'center', // Center items horizontally
    paddingVertical: 17, // Add vertical padding
    
},
imageContainer: {
    margin: 20, 
    marginHorizontal: 5,// Add margin around each image
},
image: {
    width: 100, // Set image width
    height: 100, // Set image height
    borderRadius: 20, // Add border radius for rounded corners
},
imageName: {
    marginTop: 5,
    fontSize: 16,
    textAlign:"center",
    fontWeight: "500",
},
name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
},
price: {
    fontSize: 14,
    marginBottom: 5,
},
location: {
    fontSize: 17,
    color: "#555555",
    position: "absolute",
    padding:100,
    paddingLeft:170,
    paddingRight:12,
    fontWeight: "bold",
},
restaurantContainer: {
    marginRight: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    width: 300,
    height:170,
    
},
restaurantNameContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
},
restaurantDetails: {
    padding: 10,
},
resturantImage: {
    width: 150, // Set image width
    height: 150, // Set image height
    borderRadius: 20, // Add border radius for rounded corners
},
viewallContainer: {
    left:120,
    top:32,
    
},
viewallText: {
    color: "gray",
    fontWeight: '600',
    fontSize: 15,
    textAlign:"center"
},

      
})