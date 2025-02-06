import React, { useState,useEffect, useRef } from 'react';
import { View, Text, StyleSheet,TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, SafeAreaView, Alert, Animated, Dimensions} from 'react-native';
import restaurantsData from "../../components/data/restaurants_feed.json"
import CarouselIndicator from "../../components/CarouselIndicator"
import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons';
import {Icon } from 'react-native-elements';
import * as Location from 'expo-location';
import { useToast } from "react-native-toast-notifications"
import { horizontalScale, verticalScale, moderateScale } from '../../theme/Metrics';
import { globalStyles, fonts } from '../../global/styles/theme';
import { ProfileIcon } from '../../global/styles/icons/TabIcons';


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





export default function HomeScreen({route, navigation}) {
    
    
    const [address, setAddress] = useState('Set Location')
    const [sortedRestaurants, setSortedRestaurants] = useState([]);
    const [sortedPharmacy, setSortedPharmacy] = useState([]);
    const [sortById, setSortById] = useState([])
    const toast = useToast();
    const scrollX = useRef(new Animated.Value(0)).current;
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

        const fetchSortedPharmacy = async () => {
            const sorted = [...restaurantsData.pharmacy]
                .sort((a, b) => b.details.rating - a.details.rating)
                .slice(0, 5);
            setSortedPharmacy(sorted);
        };

        // const  fetchSortById = async () => {
        //     const sorted = [...restaurantsData.restaurants]
        //     .sort((a, b) => a.id - b.id)
        //     .slice(0, 6);
        //     setSortById(sorted);
        //     }

        

        fetchSortById()
        fetchSortedPharmacy()
        fetchSortedRestaurants();
        // fetchSortedPharmacy()
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
  const redirectSearchScreen = () => {
    navigation.navigate('AllRestaurants')
  }
    

    return( 
        <SafeAreaView style={[globalStyles.container, {paddingBottom:0}]}>

                        {/* Top Container for Location */}
            <View style={styles.TopContainer}>
                <View style={styles.locationContainer}>
    
                    <View style={styles.address}>
                        <Text style={styles.HeadText}>Deliver Now</Text>
                        <View style={styles.addressContainer}>
                            <Text style = {styles.addressText}>{address}</Text>
                            <TouchableOpacity style={styles.emoji} onPress={handleLocationSearch}>
                                <Ionicons name="chevron-down" size={20} color="black"/>
                            </TouchableOpacity>

                        </View>
                        
                    </View>

                </View>
                <View>
                    <TouchableOpacity style={styles.ProfileIcon} onPress={() => navigation.navigate('User')}>
                        <ProfileIcon size={32} color="black" />
                    </TouchableOpacity>
                </View>
            </View>


                                {/* Search Bar Design */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBarContainer} onPress={redirectSearchScreen}>
                    <TextInput
                        style={styles.searchBar}
                        value=""
                        placeholder="Search restaurants, pharmacy, farmers market..."
                        // onChangeText={handleSearch}
                        onPress={redirectSearchScreen}
                    />
                    <View style={styles.searchIcon} >
                        <AntDesign name="search1" size={24} color="black" />
                    </View>
                </View>
            </View>





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

                    {/* Courier */}
                    <TouchableOpacity style={styles.serviceItem}>
                        <Image 
                            source={require('../../../assets/ima/pharmacy.png')} 
                            style={styles.serviceIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.serviceTitle}>Pharmacy</Text>
                        <Text style={styles.serviceTime}>30 mins</Text>
                    </TouchableOpacity>

                    {/* Dine in */}
                    <TouchableOpacity style={[styles.serviceItem, { marginTop: 10 }, styles.dineInItem]}>
                        <Image 
                            source={require('../../../assets/ima/courier.png')} 
                            style={styles.serviceIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.serviceTitle}>Courier</Text>
                        <Text style={styles.serviceTime}>No waiting</Text>
                    </TouchableOpacity>

                    {/* Gold Membership */}
                    <TouchableOpacity style={[styles.serviceItem, { marginTop: 10 }, styles.goldMembershipItem]}>
                        <Image 
                            source={require('../../../assets/ima/farm-markt.png')} 
                            style={styles.serviceIcon}
                            resizeMode="contain"
                        />
                        <View>
                        <Text style={styles.serviceTitle}>Farmers Market</Text>
                        <Text style={[styles.serviceTime, {padding:5}]}>Fresh Farm Produce</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            
                                    {/* Advertisment Banners */}

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

            
           
                            {/* Popular Restaurants    */}
                <View style={styles.popularRestaurantContainer}>
                    <View style={{flexDirection:"row"}}>
                        <Text style={[styles.topCatText, styles.topCategoryContainer]} > Popular Resturants</Text>
                        {/* <TouchableOpacity style ={styles.viewallContainer} onPress={() => navigation.navigate('AllRestaurants')}>
                            <Text style={styles.viewallText}> View all</Text>
                        </TouchableOpacity> */}
                    </View>

                    <View style={styles.scrollViewContent}>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.shadowProp}>
                        {sortedRestaurants.map((restaurants, index) => (
                            <TouchableOpacity key={restaurants.id} onPress={() => handleRestaurantPress(restaurants)}>
                                
                            <View style={styles.restaurantContainer}>
                                <Image source={{ uri: restaurants.details.logo}} style={styles.resturantImage} />
                                <Text style={styles.restaurantname}>{restaurants.name} </Text>
                                <Text style={styles.restaurantDetails}>Japanese | Seafood | Sushi</Text>
                                <View  style={styles.ratingContainer}>
                                    <Text style={styles.ratingText}>⭐{restaurants.details.rating}</Text>
                                    <Text style={styles.explorelocation} numberOfLines={1} ellipsizeMode="tail">| {restaurants.details.location}</Text>
                                </View>
                            </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    </View>
                </View>
                

                                    {/* Restaurants to Explore */}
                <View style={styles.popularRestaurantContainer}>
                    <View style={{flexDirection:"row"}}>
                        <Text style={[styles.topCatText, styles.topCategoryContainer]} > Pharmacy Near Me</Text>
                        {/* <TouchableOpacity style ={styles.viewallContainer} onPress={() => navigation.navigate('AllRestaurants')}>
                            <Text style={styles.viewallText}> View all</Text>
                        </TouchableOpacity> */}
                    </View>

                    <View style={styles.scrollViewContent}>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.shadowProp}>
                        {sortedPharmacy.map((pharmacy, index) => (
                            <TouchableOpacity key={pharmacy.id} onPress={() => handleRestaurantPress(restaurants)}>
                                
                            <View style={styles.restaurantContainer}>
                                <Image source={{ uri: pharmacy.details.logo}} style={styles.resturantImage} />
                                <Text style={styles.restaurantname}>{pharmacy.name} </Text>
                                <Text style={styles.restaurantDetails}>Abuja | Seafood | Sushi</Text>
                                <View  style={styles.ratingContainer}>
                                    <Text style={styles.ratingText}>⭐{pharmacy.details.rating}</Text>
                                    <Text style={styles.explorelocation} numberOfLines={1} ellipsizeMode="tail">| {pharmacy.details.location}</Text>
                                </View>
                            </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    </View>
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
TopContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop:verticalScale(35),
    // width: '100%',
    borderColor: "#000",
    // borderWidth: 1,
},
locationContainer: {
    flexDirection:'column',
    alignItems:'center',

},
HeadText: {
    fontFamily:fonts.bold,
    fontWeight: "700",
    fontSize: moderateScale(20),
    color: "#898A8D",
},
addressContainer: {
    flexDirection: 'row',
    // borderWidth: 1,
    // borderColor: "#000",
},
addressText: {
    flexGrow:1,
    fontSize: moderateScale(40),
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: "#000",

},
emoji: {
marginTop: moderateScale(3),
},
ProfileIcon: {
    // position: 'absolute',
    alignSelf:'center',
    alignContent:'center',
    marginTop: verticalScale(9),
    borderColor: "#000",
    
},
searchContainer: {
    marginTop: verticalScale(20)
},
searchBarContainer: {
    flexDirection: "row",
    position: "relative",

},
searchIcon: {
    position:"absolute",
    right: horizontalScale(15),
    top: verticalScale(10),
    zIndex:1,

},
searchBar: {
    backgroundColor: '#F3F2F2',
    padding: moderateScale(15),
    borderRadius: moderateScale(15),
    fontSize: moderateScale(15),
    // borderRadius:20,
    elevation:3,
    width: '100%'
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
    width:horizontalScale(280),
    // height:50,
},
   

input: {
    fontSize: 20,
    marginLeft: 10,
    width: "90%",
},

topCategoryContainer: {
    paddingTop: 15,
    // borderWidth:1,
    borderColor: "#000",
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
    // margin: 10, 
    // marginHorizontal: 5,// Add margin around each image
},
image: {
    width: horizontalScale(250), // Set image width
    height: verticalScale(150), // Set image height
    // borderRadius: 20, // Add border radius for rounded corners
    // overflow: 'hidden'
},
popularRestaurantContainer:{
    // borderWidth:1,
    marginVertical:10
    
},
restaurantContainer: {
    // flex: 1,
    marginHorizontal: 8,
    // borderWidth:1,
    // padding: verticalScale(10),
    // backgroundColor: "#000",
    borderRadius: 20,
    width: horizontalScale(160),
    // height:verticalScale(223),
    // gap: moderateScale(5)
    
},
resturantImage: {
    width: horizontalScale(160), // Set image width
    height: verticalScale(160), // Set image height
    borderRadius: 20, // Add border radius for rounded corners
    alignSelf:"center"
},
restaurantname: {
    fontFamily: fonts.bold,
    fontSize:18,
    fontWeight: "700",
},
restaurantDetails: {
    // padding: horizontalScale(10),
},
ratingIcon: {
    marginRight: 5, // Add spacing between the star icon and the rating text
    width: horizontalScale(15),
    height:verticalScale(15) // Set icon width()
},
ratingText: {
    fontSize: 17,
    color: "#8b8c89", // Adjust color as needed
    // fontWeight: "bold",
},
ratingContainer: {
    flexDirection: 'row',
    alignItems:"center"

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
    width: horizontalScale(350),
    height:verticalScale(170),
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
explorelocation: {
    fontSize: 17,
    color: "#8b8c89",
    marginLeft: 10, // Add spacing from the rating text
    flexShrink: 1,  // Prevent text from expanding beyond container
    maxWidth: "70%" 
    // fontWeight: "bold",
},

address: {
    alignContent:"center",
    justifyContent:"center",
    marginRight:24
  },
  addressText: {
    fontSize: 20,
    fontWeight:'bold',

  },
  offeredServicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(6),
    marginTop: verticalScale(20),
    // gap: moderateScale(10),
},
serviceItem: {
    width: '30%', // Approximately one-third of container width
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
    width: '30%', // Same width as top row items
},
goldMembershipItem: {
    width: '65%', // Takes up remaining space minus gap
    flexDirection: 'row', // Aligns content horizontally
    justifyContent: 'flex-start', // Aligns content to the left
    paddingHorizontal: moderateScale(15),
},
farmText: {

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
      
})