import React, { useState,useEffect } from 'react';
import { View, Text, StyleSheet,TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, SafeAreaView, Alert} from 'react-native';
import restaurantsData from "../../components/data/restaurants_feed.json"
import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons';
import {Icon } from 'react-native-elements';
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



export default function HomeScreen({route, navigation}) {
    
    
    const [address, setAddress] = useState('Set Location')
    const [sortedRestaurants, setSortedRestaurants] = useState([]);
    const [sortById, setSortById] = useState([])
    const toast = useToast();
    // const { readableLocation } = route.params || { readableLocation: 'Unknown' };
    

    // console.log("Location recieved after navigation:",readableLocation)

    
    useEffect(() => {
        if (route.params?.readableLocation) {
            // Log the updated location
            console.log("Location updated after navigation:", route.params.readableLocation);
            setAddress(route.params.readableLocation);
        }
    

        const fetchSortedRestaurants = async () => {
            const sorted = [...restaurantsData.restaurants]
                .sort((a, b) => b.details.rating - a.details.rating)
                .slice(0, 5);
            setSortedRestaurants(sorted);
        };

        const  fetchSortById = async () => {
            const sorted = [...restaurantsData.restaurants]
            .sort((a, b) => a.id - b.id)
            .slice(0, 6);
            setSortById(sorted);
            }

        fetchSortById()
        fetchSortedRestaurants();
    }, [route.params?.readableLocation]);
    // const sortedRestauarnts = restaurantsData.restaurants.sort((a,b) => b.details.rating - a.details.rating).slice(0,5);

    const handleFoodSearch = (category) => {
        navigation.navigate('CategoryRestaurantsScreen', { category });
        console.log('Food Found');
    }
    const handleLocationSearch = async () => {
        navigation.navigate("Map")
        console.log('Location Found')
    };

    const handleRestaurantPress = (restaurants) => {
    navigation.navigate('ResturantScreen', { restaurants });
  }
    

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
        <View style={styles.address}>
            <Text style = {styles.addressText}>🎯 {address}</Text>
        </View>

                <View>
                    
                    <TouchableOpacity onPress={() => navigation.navigate('AllRestaurants')}>
                    <Ionicons name="search" size={32} color="black" style={styles.searchIcon} />
                    </TouchableOpacity>

                </View>

            </View>
            
        <ScrollView vertical={true} showsVerticalScrollIndicator={false}>
                                {/* Top Categories */}
            <View style={styles.topCategoryContainer}>
                <Text style={styles.topCatText}> Top Categories</Text> 
            </View>

            <View contentContainerStyle={styles.scrollViewContent}>
            
            <ScrollView  horizontal={true} showsHorizontalScrollIndicator={false}>
            {images.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => handleFoodSearch(item.name)}>
                <View  style={styles.imageContainer}>
                    <Image source={{ uri: item.url }} style={styles.image} />
                    <Text style={styles.imageName}>{item.name}</Text>
                </View>
                </TouchableOpacity>
            ))}
            </ScrollView>
            
            </View>
                            {/* Popular Restaurants    */}
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

                {/* Restaurants to Explore */}
            <View>
                <Text style={[styles.topCatText, styles.topCategoryContainer]} > Restaurant To Explore</Text>
            </View>

            <View style={styles.scrollViewContent}>
            <ScrollView vertical={true} showsVerticalScrollIndicator={false} style={styles.shadowProp}>
                {sortById.map((restaurants, index) => (
                    <TouchableOpacity key={restaurants.id} onPress={() => handleRestaurantPress(restaurants)}>
                    <View style={styles.restaurantContainers}>
                        <Image source={{ uri: restaurants.details.logo }} style={styles.resturantImage} />
                        <View style={styles.restaurantNameContainer}>
                        <Text style={styles.name}>{restaurants.name}</Text>
                        </View>
                        <View  style={styles.ratingContainer}>

                            <Icon name="star" type="font-awesome" color="#FFD700" style={styles.ratingIcon}/>
                            <Text style={styles.ratingText}>{restaurants.details.rating}</Text>
                            <Text style={styles.explorelocation}>| {restaurants.details.location}</Text>
                        </View>
                        

                        <Text style={styles.descriptions}>{restaurants.details.description}</Text>
                    
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
right: 9,
top: 10,
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
    // padding: 10, // Add padding between images
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
    padding:85,
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
// Explored Restaurant
restaurantContainers: {
    // marginRight: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    width: 350,
    height:170,
    marginBottom:15
    
},
descriptions: {
    fontSize: 12,
    color: "#8b8c89",
    position: "absolute",
    zIndex:1,
    top:15,
    padding:100,
    paddingLeft:180,
    paddingRight:9,
    fontWeight: "bold",
},
ratingText: {
    fontSize: 16,
    color: "#555555", // Adjust color as needed
    fontWeight: "bold",
},
ratingContainer: {
    position: 'absolute',
    flexDirection: 'row',
    top: 85, // Adjust this value to place the container as needed
    left: 170,
    zIndex: 10,

},
explorelocation: {
    fontSize: 17,
    color: "#555555",
    marginLeft: 10, // Add spacing from the rating text
    fontWeight: "bold",
},
ratingIcon: {
    zIndex: 11, // Ensure the icon appears above other elements
    marginRight: 5, // Add spacing between the star icon and the rating text
},
address: {
    alignContent:"center",
    justifyContent:"center",
    marginRight:24
  },
  addressText: {
    fontSize: 20,
    fontWeight:'bold',

  }

      
})