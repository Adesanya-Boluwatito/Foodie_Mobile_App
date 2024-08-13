import React, { useState } from 'react';
import { View, Text, StyleSheet,TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, SafeAreaView} from 'react-native';
// Check the import statement for colors and parameters
import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons';



const images = [
    {
        id: 1,
        url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        name: "Jollof Rice"
    },
    {
        id: 2,
        url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        name: "Ice cream"
    },
    {
        id: 3,
        url: "https://images.unsplash.com/photo-1481070555726-e2fe8357725c?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        name:"Burger"
    },
    {
        id: 4,
        url: "https://images.unsplash.com/photo-1699728088600-6d684acbeada?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        name: "Shawarma"
    },
    {
        id: 5,
        url: "https://www.wholesomeyum.com/wp-content/uploads/2023/02/wholesomeyum-Easy-Fried-Rice-Recipe-1.jpg",
        name: "Fried rice"
    },
    {
        id: 6,
        url: "https://www.allrecipes.com/thmb/fFW1o307WSqFFYQ3-QXYVpnFj6E=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/48727-Mikes-homemade-pizza-DDMFS-beauty-4x3-BG-2974-a7a9842c14e34ca699f3b7d7143256cf.jpg",
        name: "Pizza"
    }
];

const restaurants = [
    {
        id: 7,
        name: "KFC",
        image: "https://i.pinimg.com/originals/ae/39/f9/ae39f93b866896fd60da58cdd50f8f4e.jpg",
        location: "Ikorodu, Lagos"
    },
    {
        id: 8,
        name: "Cold Stone Creamery",
        image: "https://nigeria.tortoisepath.com/wp-content/uploads/2023/10/Cold-Stone-Creamery-Surulere-Lagos-Ghana-TortoisePathcom-3-jpeg.webp",
        
        location: "Ikorodu, Lagos"
    },
    {
        id: 9,
        name: "Chicken Republic",
        image: "https://cdn.businessday.ng/wp-content/uploads/2024/04/0DDB85E1-624B-42A2-AE42-B5FC494AB507.png",
        location: "Ikorodu, Lagos"
    },
    // Add more restaurants as needed
];


export default function HomeScreen({navigation}) {
    

    const [search, setSearch] = useState('');
    


    const handleFoodSearch = () => {
        // Add your logic for handling food search here
        console.log('Food Found');
    }
    const handleLocationSearch = () => {
        console.log('Location Found')
    }

    const handleRestaurantPress = (restaurant) => {
    navigation.navigate('ResturantScreen', { restaurant });
  }
    
    const limitedRestaurants = restaurants.slice(0, 5);

      
    

    return( 
        <SafeAreaView style={styles.container}>

            <View style={styles.searchBarContainer}>


                <View style={[styles.locationContainer, styles.shadowProp]}>
                    <TouchableOpacity style={styles.emoji} onPress={handleLocationSearch}>
                    <Ionicons name="location-outline" size={26} color="black"/>
                    </TouchableOpacity>

                </View>

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
                <TouchableOpacity onPress={handleFoodSearch}>
                <View key={item.id} style={styles.imageContainer}>
                    <Image source={{ uri: item.url }} style={styles.image} />
                    <Text style={styles.imageName}>{item.name}</Text>
                </View>
                </TouchableOpacity>
            ))}
            </ScrollView>
            
            </View>

            <View>
                <Text style={[styles.topCatText, styles.topCategoryContainer]} > Popular Resturants</Text>
            </View>

            <View style={styles.scrollViewContent}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.shadowProp}>
                {limitedRestaurants.map((restaurant) => (
                    <TouchableOpacity key={restaurant.id} onPress={() => handleRestaurantPress(restaurant)}>
                        
                    <View key={restaurant.id} style={styles.restaurantContainer}>
                        <Image source={{ uri: restaurant.image }} style={styles.resturantImage} />
                        <View style={styles.restaurantNameContainer}>
                        <Text style={styles.name}>{restaurant.name} </Text>
                        </View>
                        <Text style={styles.price}>{restaurant.price}</Text>
                        <Text style={styles.location}>{restaurant.location}</Text>
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
            </View>

            <View style={styles.scrollViewContent}>
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
            </View>

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
    paddingVertical: 10, // Add vertical padding
    
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
    borderRadius: 10,
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

      
})