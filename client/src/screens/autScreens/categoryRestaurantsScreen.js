import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import restaurantsData from '../../components/data/restaurants_feed.json'; // Your restaurant data
import { formatRating } from '../../utils/RatingUtils';

export default function CategoryRestaurantsScreen({ route, navigation }) {
    const { category } = route.params;
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);

    useEffect(() => {
        const filtered = restaurantsData.restaurants.filter(restaurant =>
            restaurant.details.menu.some(item => item.name.toLowerCase().includes(category.toLowerCase()))
        );
        setFilteredRestaurants(filtered);
    }, [category]);

    const handleRestaurantPress = (restaurants) => {
        navigation.navigate('ResturantScreen', { restaurants });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.categoryTitle}>Restaurants Offering {category}</Text>
            <ScrollView>
                {filteredRestaurants.length > 0 ? (
                    filteredRestaurants.map((restaurants) => (
                        <TouchableOpacity key={restaurants.id} onPress={() => handleRestaurantPress(restaurants)} style={styles.restaurantContainer}>
                            <Image source={{ uri: restaurants.details.logo }} style={styles.restaurantImage} />
                            <View style={styles.restaurantInfo}>
                                <Text style={styles.restaurantName}>{restaurants.name}</Text>
                                <Text style={styles.restaurantLocation}>{restaurants.details.location}</Text>
                                <Text style={styles.restaurantRating}>Rating: ⭐ {formatRating(restaurants.details.rating)}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text>No restaurants found for {category}.</Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffbf8',
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    categoryTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
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
