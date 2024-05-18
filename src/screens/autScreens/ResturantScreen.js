// screens/HomeScreen.js
import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Icon } from 'react-native-elements';

export default function ResturantScreen() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  const addItemToCart = (item) => {
    setCartItems([...cartItems, item]);
    setTotal(total + item.price);
  };
  const removeItemFromCart= (item) => {
    
    setTotal(total - item.price);
  }

  return (
    <ScrollView style={styles.container}>

        <Image
        source={{ uri: 'https://thewomenleaders.com/wp-content/uploads/2023/04/McDonalds-is-squeezing-the-formulae-for-its-iconic-burgers-including-the-Big-Mac-and-McDouble.png' }} // Change the source to your actual image source
        style={{ width: '100%', height: 300, resizeMode: 'cover' }}
         />

      <View style={styles.header}>
        <Text style={styles.title}>McDonald's</Text>
        <Text style={styles.location}>New York, USA</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" type="font-awesome" color="#FFD700" />
          <Text style={styles.ratingText}>4.1 Ratings • 500+</Text>
        </View>
        <Text style={styles.deliveryTime}>45 Minutes (Delivery time)</Text>
        <Text style={styles.offer}>OFFER - 10% OFF ON ALL BEVERAGES</Text>
      </View>

      <View style={styles.menuItem}>
        <Image source={{ uri: 'https://wildflourskitchen.com/wp-content/uploads/2017/06/Chicken-Big-Mac-2.png.webp' }} style={styles.image} />
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>Creamy nachos</Text>
          <Text style={styles.menuDescription}>with mexican salad</Text>
          <Text style={styles.menuPrice}>€ 15.20</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
            style={[styles.button, { backgroundColor: 'red' }]}
            onPress={() => addItemToCart({ name: 'Maharaja mac', price: 15.20 })}
            >
            <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={[styles.button, { backgroundColor: 'red' }]}
            onPress={() => removeItemFromCart({ name: 'Maharaja mac', price: 10.10 })}
            >
            <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuItem}>
        <Image source={{ uri: 'https://wildflourskitchen.com/wp-content/uploads/2017/06/Chicken-Big-Mac-2.png.webp' }} style={styles.image} />
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>Maharaja mac</Text>
          <Text style={styles.menuDescription}>with fresh fries</Text>
          <Text style={styles.menuPrice}>€ 10.10</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
            style={[styles.button, { backgroundColor: 'red' }]}
            onPress={() => addItemToCart({ name: 'Maharaja mac', price: 10.10 })}
            >
            <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={[styles.button, { backgroundColor: 'red' }]}
            onPress={() => removeItemFromCart({ name: 'Maharaja mac', price: 10.10 })}
            >
            <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cart}>
        <Text style={styles.cartText}>1 Item | € {total.toFixed(2)}</Text>
        <Button title="CHECKOUT" onPress={() => console.log('Checkout')} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    
  },
  header: {
    padding: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 16,
    color: 'gray',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
  },
  deliveryTime: {
    fontSize: 14,
    color: 'gray',
  },
  offer: {
    fontSize: 14,
    color: 'red',
    marginVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  menuText: {
    flex: 1,
    marginLeft: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuDescription: {
    fontSize: 14,
    color: 'gray',
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  cart: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartText: {
    fontSize: 18,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});


