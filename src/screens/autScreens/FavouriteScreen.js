import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Image, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { getDocs, collection } from "firebase/firestore";
import { auth, db } from '../../../firebaseconfi';

const FavouritesScreen = () => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavourites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = auth.currentUser.uid;
      const favsCollectionRef = collection(db, "users", userId, "favourites");
      const favsSnapshot = await getDocs(favsCollectionRef);

      const favsList = favsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setFavourites(favsList);
    } catch (error) {
      setError("Error fetching favorites: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  const renderFavouriteItem = ({ item }) => (
    <View style={styles.favouriteItem}>
      <Image source={{ uri: item.details.logo }} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.location}>{item.details.location}</Text>
        <Text style={styles.rating}>Rating: {item.details.rating}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4D4D" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favourites}
      keyExtractor={(item) => item.id}
      renderItem={renderFavouriteItem}
      ListEmptyComponent={<Text>No favorites added yet.</Text>}
      contentContainerStyle={favourites.length === 0 ? styles.emptyContainer : {}}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
};

const styles = StyleSheet.create({
  favouriteItem: {
    flexDirection: "row",
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  info: {
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  location: {
    fontSize: 14,
    color: "#555",
  },
  rating: {
    fontSize: 14,
    color: "#777",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});

export default FavouritesScreen;
