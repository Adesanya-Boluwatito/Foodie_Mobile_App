import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';

const CartBanner = ({ itemCount, total, cartItems}) => {
  const navigation = useNavigation();  // Use the hook here

  const handleCheckout = () => {
    navigation.navigate('Cart', { cartItems});
  };
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>{itemCount} {itemCount === 1 ? 'Item' : 'Items'} | ₦ {total.toFixed(2)}</Text>
      <Text style={styles.bannerSubText}>Extra charges may apply</Text>
      <Button 
        title="CHECKOUT" 
        onPress={handleCheckout}
        buttonStyle={styles.checkoutButton} 
        titleStyle={styles.checkoutButtonText} 
      />
    </View>
  );
};

export default function ResturantScreen() {

  
  const [cartItems, setCartItems] = useState({});
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  
  const route = useRoute();


  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);

  if (route.params?.cartItems) {
    setCartItems(route.params.cartItems);
    const newTotal = Object.values(route.params.cartItems).reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(newTotal);
  }
}, [route.params?.cartItems]);

  const addItemToCart = (item) => {
    setCartItems((prevCartItems) => {
      const updatedCartItems = { ...prevCartItems };
      if (updatedCartItems[item.name]) {
        updatedCartItems[item.name].quantity += 1;
      } else {
        updatedCartItems[item.name] = { ...item, quantity: 1 };
      }
      return updatedCartItems;
    });
    setTotal((prevTotal) => prevTotal + item.price);
  };

  const removeItemFromCart = (item) => {
    setCartItems((prevCartItems) => {
      const updatedCartItems = { ...prevCartItems };
      if (updatedCartItems[item.name]) {
        updatedCartItems[item.name].quantity -= 1;
        if (updatedCartItems[item.name].quantity === 0) {
          delete updatedCartItems[item.name];
        }
        setTotal((prevTotal) => (prevTotal - item.price >= 0 ? prevTotal - item.price : 0));
      }
      return updatedCartItems;
    });
  };

  const getItemCount = () => {
    return Object.keys(cartItems).length;
  };

  const renderItemButtons = (item) => {
    const itemInCart = cartItems[item.name];
    if (itemInCart) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF4D4D' }]}
            onPress={() => removeItemFromCart(item)}
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{itemInCart.quantity}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF4D4D' }]}
            onPress={() => addItemToCart(item)}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addItemToCart(item)}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      );
    }
  };
  const updateCart = (updatedCartItems) => {
    setCartItems(updatedCartItems);
  };

  const restaurantDetails = {
    name: 'McDonald\'s',
    logo: 'https://thewomenleaders.com/wp-content/uploads/2023/04/McDonalds-is-squeezing-the-formulae-for-its-iconic-burgers-including-the-Big-Mac-and-McDouble.png',
    location: 'New York, USA',
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <Image
          source={{ uri: 'https://thewomenleaders.com/wp-content/uploads/2023/04/McDonalds-is-squeezing-the-formulae-for-its-iconic-burgers-including-the-Big-Mac-and-McDouble.png' }}
          style={{ width: '100%', height: 200, resizeMode: 'cover' }}
        />

        <View style={styles.header}>
          <Text style={styles.title}>{restaurantDetails.name}</Text>
          <Text style={styles.location}>{restaurantDetails.location}</Text>
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
            <Text style={styles.menuPrice}>₦ 1520</Text>
          </View>
          {renderItemButtons({ name: 'Creamy nachos', price: 1520 })}
        </View>

        <View style={styles.menuItem}>
          <Image source={{ uri: 'https://wildflourskitchen.com/wp-content/uploads/2017/06/Chicken-Big-Mac-2.png.webp' }} style={styles.image} />
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>Maharaja mac</Text>
            <Text style={styles.menuDescription}>with fresh fries</Text>
            <Text style={styles.menuPrice}>₦ 1010</Text>
          </View>
          {renderItemButtons({ name: 'Maharaja mac', price: 1010 })}
        </View>

        <View style={styles.menuItem}>
          <Image source={{ uri: 'https://wildflourskitchen.com/wp-content/uploads/2017/06/Chicken-Big-Mac-2.png.webp' }} style={styles.image} />
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>Mc Veggie mac</Text>
            <Text style={styles.menuDescription}>free fresh fries</Text>
            <Text style={styles.menuPrice}>₦ 1200</Text>
          </View>
          {renderItemButtons({ name: 'Mc Veggie mac', price: 1200 })}
        </View>

      </ScrollView>
      <CartBanner itemCount={getItemCount()} total={total} cartItems={cartItems} restaurantDetails={restaurantDetails}/>
    </View>
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
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#F9F9F9',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
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
    backgroundColor: '#FF4D4D',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    marginRight: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#FF4D4D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  banner: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  bannerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bannerSubText: {
    fontSize: 12,
    color: 'gray',
  },
  checkoutButton: {
    backgroundColor: '#FF4D4D',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
});
