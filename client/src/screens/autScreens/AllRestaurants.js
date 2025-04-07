import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import restaurantsData from '../../components/data/restaurants_feed.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { horizontalScale, verticalScale, moderateScale } from '../../theme/Metrics';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingDishes, setTrendingDishes] = useState([]);
  const [matchingDishes, setMatchingDishes ] = useState([]);
  
  // Categories with proper food icons and names from your data
  const categories = [
    { 
      name: 'Grill', 
      icon: '🥩', 
      type: 'Grill',
      keywords: ['steak', 'grilled', 'bbq', 'barbecue', 'beef']
    },
    { 
      name: 'Chicken', 
      icon: '🍗', 
      type: 'Chicken',
      keywords: ['wings', 'chicken', 'fried chicken', 'poultry']
    },
    { 
      name: 'Jollof Rice', 
      icon: '🍚', 
      type: 'Nigerian',
      keywords: ['jollof', 'rice', 'Nigerian', 'spicy rice', 'tomato rice', 'party jollof']
    },
    { 
      name: 'Amala', 
      icon: '🫓', 
      type: 'Nigerian',
      keywords: ['amala', 'yam flour', 'ewedu', 'gbegiri', 'soup', 'swallow']
    },
    { 
      name: 'Burger', 
      icon: '🍔', 
      type: 'Burger',
      keywords: ['hamburger', 'cheeseburger', 'beef', 'patty']
    },
    { 
      name: 'Sides', 
      icon: '🍟', 
      type: 'Sides',
      keywords: ['fries', 'mashed potatoes', 'salad', 'coleslaw']
    }
  ];

  // Load recent searches on component mount
  useEffect(() => {
    loadRecentSearches();
    const fetchTrendingDishes = async () => {
        const trending = await getTrendingDishes();
        setTrendingDishes(trending);
      };
    
      fetchTrendingDishes();
  }, []);

  // Load recent searches from AsyncStorage
  const loadRecentSearches = async () => {
    try {
      const savedSearches = await AsyncStorage.getItem('recentSearches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  // Save recent searches to AsyncStorage
  const saveRecentSearches = async (searches) => {
    try {
      await AsyncStorage.setItem('recentSearches', JSON.stringify(searches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };

  // Log search to AsyncStorage
  const logSearch = async (query) => {
    try {
      const searches = await AsyncStorage.getItem('dishSearches');
      const searchData = searches ? JSON.parse(searches) : {};
      
      if (searchData[query]) {
        searchData[query] += 1;
      } else {
        searchData[query] = 1;
      }
      
      await AsyncStorage.setItem('dishSearches', JSON.stringify(searchData));
    } catch (error) {
      console.error('Error logging search:', error);
    }
  };

  // Get trending dishes from AsyncStorage
  const getTrendingDishes = async () => {
    try {
      // Load the current database
      const database = restaurantsData;
  
      // Flatten all dishes into a single array
      const allDishes = database.restaurants.flatMap((restaurant) => 
        restaurant.details.menu.map((dish) => ({
          ...dish, // Include dish properties
          restaurantId: restaurant.id,
          restaurantName: restaurant.name, // Add restaurant name for context
        }))
      );
  
      // Sort dishes by clicks in descending order
      const sortedDishes = allDishes.sort((a, b) => b.clicks - a.clicks);
  
      // Return the top 5 dishes
      return sortedDishes.slice(0, 5);
    } catch (error) {
      console.error('Error fetching trending dishes:', error);
      return [];
    }
  };
  ;

  // Fetch trending dishes
  const fetchTrendingDishes = async () => {
    const dishes = await getTrendingDishes();
    setTrendingDishes(dishes);
  };

  // Handle search input
  const handleSearch = (text) => {
    setSearchQuery(text);
  
    if (text.trim()) {
      // Filter restaurants that match the search query
      const filtered = restaurantsData.restaurants.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(text.toLowerCase()) ||
        restaurant.details.menu.some((item) =>
          item.name.toLowerCase().includes(text.toLowerCase())
        )
      );
  
      // Find matching dishes and include full restaurant data
      const dishes = [];
      filtered.forEach((restaurant) => {
        const matchingDishes = restaurant.details.menu
          .filter((dish) =>
            dish.name.toLowerCase().includes(text.toLowerCase())
          )
          .map((dish) => ({
            ...dish,
            restaurant: restaurant, // Include the full restaurant object
            restaurantName: restaurant.name,
            restaurantId: restaurant.id,
          }));
        dishes.push(...matchingDishes);
      });
  
      setFilteredRestaurants(filtered);
      setMatchingDishes(dishes);
    } else {
      setFilteredRestaurants([]);
      setMatchingDishes([]);
    }
  };

  
//   const updateDishClicks = async (dishId) => {
//     try {
//       // Load the current database
//       database = restaurantsData
  
//       // Iterate through restaurants to find the dish
//       database.restaurants.forEach((restaurant) => {
//         restaurant.details.menu.forEach((dish) => {
//           if (dish.id === dishId) {
//             dish.clicks += 1; // Increment the clicks count
//           }
//         });
//       });
  
//       // Save the updated database back to the file (if applicable)
//       const fs = require('fs');
//       fs.writeFileSync('../../components/data/restaurants_feed.json', JSON.stringify(database, null, 2));
  
//       console.log(`Dish with ID ${dishId} has been clicked. Click count updated.`);
//     } catch (error) {
//       console.error('Error updating dish clicks:', error);
//     }
//   };

  
  
  // Handle search submission
  const handleSearchSubmit = async () => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const updatedSearches = [
        searchQuery,
        ...recentSearches.filter(search => search !== searchQuery)
      ].slice(0, 5); // Keep only last 5 searches
      
      setRecentSearches(updatedSearches);
      await saveRecentSearches(updatedSearches);
      
      // Log the search
      await logSearch(searchQuery);
      
      // Navigate to results
      setFilteredRestaurants(filteredRestaurants)
    }
  };

  // Clear single recent search
  const clearSearch = (index) => {
    const newSearches = [...recentSearches];
    newSearches.splice(index, 1);
    setRecentSearches(newSearches);
    saveRecentSearches(newSearches);
  };

  // Clear all recent searches
  const clearAllSearches = () => {
    setRecentSearches([]);
    saveRecentSearches([]);
  };

  // Handle category selection
  const handleCategoryPress = (category) => {
    setSearchQuery(category.name);
    
    // Find restaurants that have menu items matching the category
    const filtered = restaurantsData.restaurants.filter(restaurant =>
      restaurant.details.menu.some(item =>
        // Check if the dish name or description includes any of the category keywords
        item.name.toLowerCase().includes(category.name.toLowerCase()) ||
        item.description?.toLowerCase().includes(category.name.toLowerCase()) ||
        category.keywords.some(keyword => 
          item.name.toLowerCase().includes(keyword.toLowerCase()) ||
          item.description?.toLowerCase().includes(keyword.toLowerCase())
        )
      )
    );
  
    // Find matching dishes from the filtered restaurants
    const dishes = [];
    filtered.forEach((restaurant) => {
      const matchingDishes = restaurant.details.menu
        .filter((dish) =>
          dish.name.toLowerCase().includes(category.name.toLowerCase()) ||
          dish.description?.toLowerCase().includes(category.name.toLowerCase()) ||
          category.keywords.some(keyword => 
            dish.name.toLowerCase().includes(keyword.toLowerCase()) ||
            dish.description?.toLowerCase().includes(keyword.toLowerCase())
          )
        )
        .map((dish) => ({
          ...dish,
          restaurant: restaurant,
          restaurantName: restaurant.name,
          restaurantId: restaurant.id,
        }));
      dishes.push(...matchingDishes);
    });
  
    setFilteredRestaurants(filtered);
    setMatchingDishes(dishes);
  };


  
  const handleTrendingDishSelect = (dish) => {
    setSearchQuery(dish.name);
    
    // Find the restaurant that contains this dish
    const restaurant = restaurantsData.restaurants.find((r) => 
      r.details.menu.some((menuItem) => menuItem.name === dish.name)
    );

    if (restaurant) {
      // Filter restaurants and dishes based on the selection
      const filtered = [restaurant];
      const matchingDish = restaurant.details.menu
        .filter((menuItem) => menuItem.name === dish.name)
        .map((menuItem) => ({
          ...menuItem,
          restaurant: restaurant,
          restaurantName: restaurant.name,
          restaurantId: restaurant.id,
        }));

      setFilteredRestaurants(filtered);
      setMatchingDishes(matchingDish);
    }
  };

  const CategoriesSection = () => {
    const getCategoryItemCount = (category) => {
      let count = 0;
      restaurantsData.restaurants.forEach(restaurant => {
        restaurant.details.menu.forEach(item => {
          if (
            item.name.toLowerCase().includes(category.name.toLowerCase()) ||
            item.description?.toLowerCase().includes(category.name.toLowerCase()) ||
            category.keywords.some(keyword => 
              item.name.toLowerCase().includes(keyword.toLowerCase()) ||
              item.description?.toLowerCase().includes(keyword.toLowerCase())
            )
          ) {
            count++;
          }
        });
      });
      return count;
    }};

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food, grocery, meat etc."
            value={searchQuery}
            onChangeText={handleSearch}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Results */}
        {searchQuery.length > 0 && (filteredRestaurants.length > 0 || matchingDishes.length > 0) && (
            <View style={styles.resultsContainer}>

        {/* 🔥 Display Matching Dishes */}
        {matchingDishes.length > 0 && (
        <View>

        <Text style={styles.sectionTitle}>Matching Dishes</Text>
        {matchingDishes.map((dish, index) => (
          <TouchableOpacity
          key={`${dish.id}-${index}`}
            style={styles.resultItem}
            onPress={() => {
                const restaurant = dish.restaurant; 
      if (restaurant) {
        navigation.navigate('ResturantScreen', { restaurants: restaurant });
      } else {
        console.error('Restaurant not found for dish:', dish);
      }
    }}
            >
            <Image 
              source={{ uri: dish.image }} 
              style={styles.resultImage}
            />
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{dish.name}</Text>
              <Text style={styles.resultLocation}>From {dish.restaurantName}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    )}

    {/* 🍽 Display Matching Restaurants */}
    {filteredRestaurants.length > 0 && (
      <View>
        <Text style={styles.sectionTitle}>Matching Restaurants</Text>
        {filteredRestaurants.map((restaurant) => (
          <TouchableOpacity
            key={restaurant.id} 
            style={styles.resultItem}
            onPress={() => navigation.navigate('ResturantScreen', { restaurants: restaurant })}
          >
            <Image 
              source={{ uri: restaurant.details.logo }} 
              style={styles.resultImage}
            />
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{restaurant.name}</Text>
              <Text style={styles.resultLocation}>{restaurant.details.location}</Text>
              <Text style={styles.resultRating}>⭐ {restaurant.details.rating}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    )}

  </View>
)}




        {/* Categories */}
        <View style={styles.section}>
  <Text style={styles.sectionTitle}>Top Categories</Text>
  <ScrollView 
    horizontal 
    showsHorizontalScrollIndicator={false}
    style={styles.categoriesScrollView}
  >
    <View style={styles.categoriesContainer}>
      {categories.map((category, index) => {
        // Calculate count for this category
        let count = 0;
        restaurantsData.restaurants.forEach(restaurant => {
          restaurant.details.menu.forEach(item => {
            if (
              item.name.toLowerCase().includes(category.name.toLowerCase()) ||
              item.description?.toLowerCase().includes(category.name.toLowerCase()) ||
              category.keywords.some(keyword => 
                item.name.toLowerCase().includes(keyword.toLowerCase()) ||
                item.description?.toLowerCase().includes(keyword.toLowerCase())
              )
            ) {
              count++;
            }
          });
        });

        return (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.categoryItem,
              searchQuery === category.name && styles.categoryItemActive
            ]}
            onPress={() => handleCategoryPress(category)}
          >
            <View style={[
              styles.categoryIcon,
              searchQuery === category.name && styles.categoryIconActive
            ]}>
              <Text style={styles.categoryEmoji}>{category.icon}</Text>
            </View>
            <Text style={[
              styles.categoryName,
              searchQuery === category.name && styles.categoryNameActive
            ]}>{category.name}</Text>
            {/* <Text style={styles.categoryCount}>
              {count} items
            </Text> */}
          </TouchableOpacity>
        );
      })}
    </View>
  </ScrollView>
</View>
  


        {/* Trending Dishes */}
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Dishes</Text>
        {trendingDishes.slice(0, 5).map((dish, index) => (
          <TouchableOpacity 
            key={dish.id}
            style={styles.trendingItem}
            onPress={() => handleTrendingDishSelect(dish)}
          >
            <Ionicons name="search" size={20} color="gray" />
            <Text style={styles.trendingText}>{dish.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={clearAllSearches}>
                <Text style={styles.clearAll}>Clear all</Text>
              </TouchableOpacity>
            </View>
            {recentSearches.map((search, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.recentItem}
                onPress={() => {
                  setSearchQuery(search);
                  handleSearch(search);
                }}
              >
                <View style={styles.recentLeft}>
                  <Ionicons name="time-outline" size={20} color="gray" />
                  <Text style={styles.recentText}>{search}</Text>
                </View>
                <TouchableOpacity onPress={() => clearSearch(index)}>
                  <Ionicons name="close" size={20} color="gray" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: verticalScale(50),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(20),
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginLeft: horizontalScale(12),
    borderRadius: moderateScale(25),
    paddingHorizontal: horizontalScale(12),
    height: verticalScale(40),
    elevation: 2,
  },
  searchIcon: {
    marginRight: horizontalScale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
  },
  resultsContainer: {
    padding: moderateScale(16),
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    marginBottom: verticalScale(12),
    elevation: 2,
  },
  resultImage: {
    width: horizontalScale(60),
    height: verticalScale(60),
    borderRadius: moderateScale(8),
    marginRight: horizontalScale(12),
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
  resultLocation: {
    fontSize: moderateScale(14),
    color: 'gray',
    marginTop: verticalScale(4),
  },
  resultRating: {
    fontSize: moderateScale(14),
    color: '#FFD700',
    marginTop: verticalScale(4),
  },
  section: {
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    marginBottom: verticalScale(16),
  },
  categoriesScrollView: {
    marginTop: verticalScale(10),
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: horizontalScale(4),
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    borderRadius: moderateScale(12),
    backgroundColor: '#fff',
    minWidth: 100,
  },
  categoryItemActive: {
    backgroundColor: '#fff',
  },
  categoryIcon: {
    width: horizontalScale(36),
    height: verticalScale(36),
    borderRadius: moderateScale(28),
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIconActive: {
    backgroundColor: '#f0f0f0',
  },
  categoryEmoji: {
    fontSize: moderateScale(28),
  },
  categoryName: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#333',
    marginBottom: verticalScale(4),
  },
  categoryNameActive: {
    color: '#000',
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: moderateScale(12),
    color: '#666',
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
  },
  trendingText: {
    marginLeft: horizontalScale(12),
    fontSize: moderateScale(16),
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  clearAll: {
    color: '#4CAF50',
    fontSize: moderateScale(14),
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(12),
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentText: {
    marginLeft: horizontalScale(12),
    fontSize: moderateScale(16),
  },
});

export default SearchScreen;