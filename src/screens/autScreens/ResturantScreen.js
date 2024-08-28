import React, { useState, useEffect,useRef } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign'
import { auth, db } from '../../../firebaseconfi';
import { doc,  getDoc, deleteDoc, setDoc } from "firebase/firestore"


const CartBanner = ({ itemCount, total, cartItems, restaurants}) => {
  const navigation = useNavigation();  // Use the hook here
  

  const handleCheckout = () => {
    const newPack = [cartItems];
    navigation.navigate('Cart', { cartItems, restaurants});
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

export default function ResturantScreen({}) {

  
  const [cartItems, setCartItems] = useState({});
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const [isFavourite, setIsFavourite] = useState(false)
  const [isFavouriteButtonDisabled, setIsFavouriteButtonDisabled] = useState(false);
  const route = useRoute();
  const { restaurants } = route.params
  const restaurantId = restaurants.id;
  

  const handleChatService = () => {
    navigation.navigate('Chat', {  userId: UserId });
}

const toggleFavourites = async () => {
  setIsFavourite(prevState => !prevState); // Immediate toggle
  setIsFavouriteButtonDisabled(true);

  try {
    const userId = auth.currentUser.uid;
    // const restaurantId = restaurants.id;

    const favRef = doc(db, "users", userId, "favourites", restaurantId);

    if (isFavourite) {
      // The user has unfavored, so remove from Firestore
      await deleteDoc(favRef);
    } else {
      // The user has favored, so add to Firestore
      await setDoc(favRef, {
        id: restaurantId,
        name: restaurants.name,
        details: restaurants.details,
      });
    }
  } catch (error) {
    console.error("Error updating favorites: ", error);
    // Revert the toggle in case of error
    setIsFavourite(prevState => !prevState);
  } finally {
    setIsFavouriteButtonDisabled(false);
  }
};

useEffect(() => {
  const fetchFavouriteStatus = async () => {
    try {
      const userId = auth.currentUser.uid;
      // const restaurantId = restaurants.id;
      const favRef = doc(db, "users", userId, "favourites", restaurantId);
      const favDoc = await getDoc(favRef);

      if (favDoc.exists()) {
        setIsFavourite(true);
      } else {
        setIsFavourite(false);
      }
    } catch (error) {
      console.error("Error checking favorite status: ", error);
    }
  };

  fetchFavouriteStatus();
}, [restaurants]);



const handlebackPree = () => {
    navigation.goBack()
}

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);

  if (route.params?.cartItems) {
    setCartItems(route.params.cartItems);
    const newTotal = Object.values(route.params.cartItems[restaurantId] || {}).reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(newTotal);
  }
}, [route.params?.cartItems]);

  const addItemToCart = (item) => {
    setCartItems((prevCartItems) => {
      const updatedCartItems = { ...prevCartItems };
      if (!updatedCartItems[restaurantId]) {
        updatedCartItems[restaurantId] = {};
      }
      if (updatedCartItems[restaurantId][item.name]) {
        updatedCartItems[restaurantId][item.name].quantity += 1;
      } else {
        updatedCartItems[restaurantId][item.name] = { ...item, quantity: 1 };
      }
      setTotal((prevTotal) => prevTotal + item.price)
      return updatedCartItems;
    });
    
  };

  const removeItemFromCart = (item) => {
    setCartItems((prevCartItems) => {
      const updatedCartItems = { ...prevCartItems };
      if (updatedCartItems[restaurantId]  && updatedCartItems[restaurantId][item.name]) {

        updatedCartItems[item.name].quantity -= 1;
        if (updatedCartItems[restaurantId][item.name].quantity === 0) {
          delete updatedCartItems[restaurantId][item.name];
        }
        setTotal((prevTotal) => (prevTotal - item.price >= 0 ? prevTotal - item.price : 0));
      }
      return updatedCartItems;
    });
  };

  const getItemCount = () => {
    return Object.keys(cartItems[restaurantId] || {}).length;
  };

  const renderItemButtons = (item) => {
    const itemInCart = cartItems[restaurantId]?.[item.name];
    if (itemInCart) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#bf0603' }]}
            onPress={() => removeItemFromCart(item)}
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{itemInCart.quantity}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#bf0603' }]}
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
 
  

  const pan = useRef(new Animated.ValueXY({ x: 310, y: 300})).current;

  const currentUser  = auth.currentUser
  const UserId  = currentUser.uid

  const panResponder = useRef (
    PanResponder.create({
      onMoveShouldSetPanResponder:() => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y:0});
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y}
        ],
        { useNativeDriver: false}
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;

  const fallbackImageUri = 'https://thewomenleaders.com/wp-content/uploads/2023/04/McDonalds-is-squeezing-the-formulae-for-its-iconic-burgers-including-the-Big-Mac-and-McDouble.png';

  return (
    <View style={{ flex: 1 }}>

       <View style={styles.header}>

        <View style={styles.backContainer}>

            <Image
          source={{ uri: restaurants.details.coverImage || fallbackImageUri }}
          style={{ width: '100%', height: 300, resizeMode: 'cover' }}
        />
            <TouchableOpacity style={styles.backButton} onPress={handlebackPree}>
            <AntDesign name="left" size={20} color="#8b8c89" />
            </TouchableOpacity>
          </View>
        <View style = {styles.headerCard}>
          <Text style={styles.title}>{restaurants.name}</Text>
          <Text style={styles.location}>{restaurants.details.location}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" type="font-awesome" color="#FFD700" />
            <Text style={styles.ratingText}>{restaurants.details.rating}</Text>

            <TouchableOpacity style={styles.favouriteButton} onPress={toggleFavourites} disabled={isFavouriteButtonDisabled} >
            <AntDesign name={isFavourite ? "heart": "hearto" } size={24} color="#bf0603" />
            </TouchableOpacity> 
          </View>
          <Text style={styles.deliveryTime}>45 Minutes (Delivery time)</Text>
          <Text style={styles.offer}>OFFER - 10% OFF ON ALL BEVERAGES</Text>
        </View>
          
        </View>




      
        

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>   
        {restaurants.details.menu.map((item) =>(
          <View style={styles.menuItem} key={item.id}>
          <Image source={{ uri: item.image}} style={styles.image} />
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>{item.name}</Text>
            <Text style={styles.menuDescription}>{item.description}</Text>
            <Text style={styles.menuPrice}>₦ {item.price.toFixed(2)}</Text>
          </View>
          {renderItemButtons(item)}
        </View>
        ))} 
      </ScrollView>
      
      <Animated.View

        {...panResponder.panHandlers}
        style={[pan.getLayout(), styles.floaterStyle]}
      ><TouchableOpacity  onPress={handleChatService}>
        <AntDesign name="message1" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
      
      {getItemCount() > 0 && (
      <CartBanner itemCount={getItemCount()} total={total} cartItems={cartItems} restaurants={restaurants}/>)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: '#fff',
  },
  header: {
    
    backgroundColor: '#ffff',
    alignItems: 'center',
    position:"relative",
    // flexDirection: "row",
    zIndex:20,
  },
  headerCard: {
  
    backgroundColor: "#F9F9F9",
    borderBlockColor: "#bf0603",
    // elevation: 5,
    borderRadius:10,
    width:365,
    padding: 20,
    position: "absolute",
    zIndex: 10,
    bottom: -110,

  },
  favouriteButton: {
      left:250,
      bottom: 50,
      // flexDirection: "row",
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
    top: 115, 
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
    backgroundColor: '#bf0603',
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
    backgroundColor: '#bf0603',
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
    backgroundColor: '#bf0603',
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
  floaterStyle: {
    //Here is the trick
    position: 'absolute',
    zIndex: 20,
    width: 50,
    borderRadius:10 ,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
    backgroundColor:'#bf0603',
 },
 backContainer: {
  flexDirection: "row",
    
 },
 backButton:{
  backgroundColor: "#fff",
  borderRadius: 10,
  position: "absolute",
  zIndex: 10,
  bottom:180,
  left: 18,
  width: 45,
  height:40,
  alignItems: "center",
  justifyContent: "center",
 },
 scrollViewContainer: {
  flex: 1,
  paddingTop: 20, // Adjust to add spacing under the header card
  paddingHorizontal: 10,
},
});
