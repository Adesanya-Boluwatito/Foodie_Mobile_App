import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import TabSelector from '../../components/TabSelector';
import restaurantsData from "../../components/data/restaurants_feed.json"




export default function OffersScreen({navigation}) {

const [sortedRestauarnts, setSortedRestaurants] = useState([])
const [filteredRestaurants, setFilteredResturant] = useState([])

useEffect(() => {
  // console.log('restaurantsData:', restaurantsData);
  if (restaurantsData && restaurantsData.restaurants) {
    const sorted = [...restaurantsData.restaurants]
      .sort((a, b) => b.details.discount - a.details.discount)
      .slice(0, 7);
    setSortedRestaurants(sorted);
  } else {
    console.error("restaurantsData or restaurantsData.restaurants is undefined");
  }
}, []);

useEffect(() => {
  if (restaurantsData && restaurantsData.restaurants) {
    const freeDeliveryRestaurants = restaurantsData.restaurants
      .filter((restaurants) => restaurants.details.freeDelivery)  // Filter by free delivery
      .sort((a, b) => b.details.discount - a.details.discount)
      .slice(0,7); // Sort by discount if needed

    setFilteredResturant(freeDeliveryRestaurants);
  } else {
    console.error("restaurantsData or restaurantsData.restaurants is undefined");
  }
}, []);

const handleRestaurantPress = (restaurants) => {
  navigation.navigate('ResturantScreen', { restaurants });  // Navigate to RestaurantScreen
};

  




  const renderOfferItem = ({ item }) => (
    <TouchableOpacity style={styles.offerCard} onPress={() => handleRestaurantPress(item)}>
      <Image source={{ uri: item.details.logo }} style={styles.offerImage} />
      <View style={styles.offerTextContainer}>
        <Text style={styles.offerTitle}>{item.name}</Text>
        <Text style={styles.offerInfo}>{item.details.offerData} • {item.price}</Text>
        <Text style={styles.offerDiscount}>{item.details.discount * 100}% OFF</Text>

      </View>
    </TouchableOpacity>
  );

  const renderFreeDeliveryItem = ({ item }) => (
    <TouchableOpacity style={styles.freeDeliveryCard} onPress={() => handleRestaurantPress(item)}>
      <Image source={{ uri: item.details.logo }} style={styles.freeDeliveryImage} />
      <View style={styles.freeDeliveryTextContainer}>
        <Text style={styles.freeDeliveryTitle}>{item.name}</Text>
        {/* <Text style={styles.freeDeliveryCategory}>{item.details.description}</Text> */}
        {/* <Text style={styles.freeDeliveryInfo}>{item.time} • {item.price}</Text> */}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.navigationcontainer}>
        <TabSelector selectedTab="restaurants" />
      </View>
      

      {/* Banners */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bannerContainer}>
        <View style={styles.bannerCard}>
          <Text style={styles.bannerDiscount}>20% DISCOUNT</Text>
          <Text style={styles.bannerInfo}>Up to $25 discount on Foodie Fridays</Text>
          <Text style={styles.bannerValidity}>Valid till 30th September 2019</Text>
        </View>
        {/* Add more banner cards as needed */}
      </ScrollView>

      {/* Today's Offers */}
      <Text style={styles.sectionTitle}>Today's Offers</Text>
      {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bannerContainer}> */}
      <FlatList
        horizontal
        data={sortedRestauarnts}
        renderItem={renderOfferItem}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        
      />
      {/* </ScrollView> */}

      {/* Free Delivery */}
      <View style={styles.freeDeliveryHeader}>
        <Text style={styles.sectionTitle}>Free Delivery *</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={filteredRestaurants}
        renderItem={renderFreeDeliveryItem}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
      />

      {/* All Offers */}
      <View style={styles.freeDeliveryHeader}>
        <Text style={styles.sectionTitle}>All offers</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>
      {/* Add more cards for all offers similar to above sections */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbf8', paddingHorizontal: 16, paddingTop:80, },
  // navigationcontainer:{ borderBlockColor:"#bf0603", borderWidth:1, height:120,padding:0,} ,
  headerContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 16, paddingTop:35, borderBlockColor:"#bf0603",borderWidth:1 },
  headerButton: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 0, borderBlockColor:"#bf0603", },
  activeHeaderButton: { backgroundColor: '#bf0603' },
  headerText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  bannerContainer: { marginVertical: 16 },
  bannerCard: { backgroundColor: '#f96d15', padding: 16, borderRadius: 8, marginRight: 16 },
  bannerDiscount: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  bannerInfo: { fontSize: 14, color: '#fff', marginVertical: 4 },
  bannerValidity: { fontSize: 12, color: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
  offerCard: { marginRight: 16, width: 150 },
  offerImage: { width: '100%', height: 100, borderRadius: 8 },
  offerTextContainer: { marginTop: 8 },
  offerTitle: { fontSize: 14, fontWeight: 'bold' },
  offerInfo: { fontSize: 12, color: '#777' },
  offerDiscount: { fontSize: 12, color: '#bf0603', fontWeight: 'bold' },
  freeDeliveryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  viewAllText: { color: '#bf0603', fontSize: 14, fontWeight: 'bold' },
  freeDeliveryCard: { marginRight: 16, width: 150, marginBottom: 16 },
  freeDeliveryImage: { width: '100%', height: 80, borderRadius: 8 },
  freeDeliveryTextContainer: { marginTop: 8 },
  freeDeliveryTitle: { fontSize: 14, fontWeight: 'bold' },
  freeDeliveryCategory: { fontSize: 12, color: '#777' },
  freeDeliveryInfo: { fontSize: 12, color: '#777' },
});
