import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import restaurantsData from '../../components/data/restaurants_feed.json';

export default function AllRestaurantsScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);

    useEffect(() => {
        const sorted = [...restaurantsData.restaurants]
            .sort((a, b) => b.details.rating - a.details.rating);
        setFilteredRestaurants(sorted);
    }, []);

    const handleSearch = (text) => {
        setSearchQuery(text);

        const filtered = restaurantsData.restaurants
            .filter(restaurant => 
                restaurant.name.toLowerCase().includes(text.toLowerCase()) ||
                restaurant.details.location.toLowerCase().includes(text.toLowerCase())
            )
            .sort((a, b) => b.details.rating - a.details.rating);

        setFilteredRestaurants(filtered);
    };

    const handleRestaurantPress = (restaurants) => {
        navigation.navigate('ResturantScreen', { restaurants });
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                value={searchQuery}
                placeholder="Search restaurants..."
                onChangeText={handleSearch}
            />
            <ScrollView>
                {filteredRestaurants.map((restaurants) => (
                    <TouchableOpacity
                        key={restaurants.id}
                        style={styles.restaurantContainer}
                        onPress={() => handleRestaurantPress(restaurants)}
                    >
                        <Image source={{ uri: restaurants.details.logo }} style={styles.restaurantImage} />
                        <View style={styles.restaurantInfo}>
                            <Text style={styles.restaurantName}>{restaurants.name}</Text>
                            <Text style={styles.restaurantLocation}>{restaurants.details.location}</Text>
                            <Text style={styles.restaurantRating}>Rating: {restaurants.details.rating}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffbf8',
        paddingTop: 50,
        paddingHorizontal:20,
    },
    searchBar: {
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 18,
        borderRadius:20,
        elevation:3,
    },
    restaurantContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 10,
    },
    restaurantImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 10,
    },
    restaurantInfo: {
        justifyContent: 'center',
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    restaurantLocation: {
        fontSize: 16,
        color: '#555',
    },
    restaurantRating: {
        fontSize: 14,
        color: '#888',
    },
});
