import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, FlatList } from "react-native";
import { getDocs, collection } from "firebase/firestore";
import { auth, db } from '../../../firebaseconfi';

export default function FavouritesScreen() {
  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
    const fetchFavourites = async () => {
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
        console.error("Error fetching favorites: ", error);
      }
    };

    fetchFavourites();
  }, []);

  const renderFavouriteItem = ({ item }) => (
    <View style={styles.favouriteItem}>
      <Image source={{ uri: item.details.coverImage }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.location}>{item.details.location}</Text>
        <Text style={styles.rating}>Rating: {item.details.rating}</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={favourites}
      keyExtractor={(item) => item.id}
      renderItem={renderFavouriteItem}
      ListEmptyComponent={<Text>No favorites added yet.</Text>}
      contentContainerStyle={favourites.length === 0 && styles.emptyContainer} // Center the empty message
    />
  );
}

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
});
