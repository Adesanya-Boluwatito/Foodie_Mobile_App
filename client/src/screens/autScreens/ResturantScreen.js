import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  PanResponder,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import ChatModal from '../../components/chatModal';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { auth, db } from '../../../firebaseconfi';
import { doc, getDoc, deleteDoc, setDoc } from "firebase/firestore";

const { width, height } = Dimensions.get('window');

// Modern accent color
const ACCENT_COLOR = '#FF4D4F';

const CartBanner = ({ itemCount, total, cartItems, restaurants, message, fromCart, existingPacks }) => {
  const navigation = useNavigation();

  const handleCheckout = () => {
    console.log("Current message:", message);
    if (fromCart) {
      // If we came from cart, navigate back with the new pack
      // The global state will handle preserving existing packs
      navigation.navigate('Cart', { 
        cartItems,
        restaurants, 
        message,
        newPack: true, // Flag that this is a new pack being added to existing cart
        packName: `Pack ${existingPacks + 1}` // Suggest a name based on count
      });
    } else {
      // Regular checkout flow
      navigation.navigate('Cart', { cartItems, restaurants, message });
    }
  };
  
  return (
    <View style={styles.banner}>
      <View style={styles.bannerLeftContent}>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerText}>{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</Text>
          <Text style={styles.bannerAmount}>₦ {total.toFixed(2)}</Text>
        </View>
        <Text style={styles.bannerSubText}>
          {fromCart ? `Adding to Pack ${existingPacks + 1}` : "Extra charges may apply"}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.checkoutButton} 
        onPress={handleCheckout}
        activeOpacity={0.8}
      >
        <Text style={styles.checkoutButtonText}>
          {fromCart ? "Add to Cart" : "Checkout"}
        </Text>
        <MaterialIcons name="arrow-forward-ios" size={16} color="white" style={{ marginLeft: 5 }} />
      </TouchableOpacity>
    </View>
  );
};

export default function ResturantScreen({}) {
  // Initialize cartItems as empty object to ensure we always start clean
  const [cartItems, setCartItems] = useState({});
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isFavouriteButtonDisabled, setIsFavouriteButtonDisabled] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const route = useRoute();
  
  // Get params but with defaults to handle null cases
  const { 
    restaurants = {}, 
    fromCart = false, 
    existingPacks = 0, 
    clearCart = false
  } = route.params || {};
  
  const restaurantId = restaurants.id;

  // Check if we're coming from the cart screen
  const isFromCart = route.params?.fromCart || false;
  const existingPacksCount = route.params?.existingPacks || 0;
  
  // Replace multiple useEffects with one consolidated effect that runs once on mount
  // This prevents dependency cycles and infinite rendering
  useEffect(() => {
    console.log('Restaurant screen mounted');
    
    // ALWAYS start with an empty cart regardless of where we came from
    setCartItems({});
    setTotal(0);
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    // Only populate from route.params if NOT coming from cart
    if (route.params?.cartItems && !isFromCart) {
      console.log('Loading cart items from params');
      setCartItems(route.params.cartItems);
      
      if (route.params.cartItems[restaurantId]) {
        const newTotal = Object.values(route.params.cartItems[restaurantId] || {})
          .reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotal(newTotal);
      }
    }
    
    // Cleanup function to ensure we don't leave lingering state
    return () => {
      console.log('Restaurant screen unmounting');
    };
  }, []); // Empty dependency array - runs only once on mount

  const handleMessageSubmit = (msg) => {
    setMessage(msg); 
    console.log("Message submitted:", msg);
  };

  const toggleFavourites = async () => {
    setIsFavourite(prevState => !prevState);
    setIsFavouriteButtonDisabled(true);

    try {
      const userId = auth.currentUser.uid;
      const favRef = doc(db, "users", userId, "favourites", restaurantId);

      if (isFavourite) {
        await deleteDoc(favRef);
      } else {
        await setDoc(favRef, {
          id: restaurantId,
          name: restaurants.name,
          details: restaurants.details,
        });
      }
    } catch (error) {
      console.error("Error updating favorites: ", error);
      setIsFavourite(prevState => !prevState);
    } finally {
      setIsFavouriteButtonDisabled(false);
    }
  };

  useEffect(() => {
    const fetchFavouriteStatus = async () => {
      try {
        const userId = auth.currentUser.uid;
        const favRef = doc(db, "users", userId, "favourites", restaurantId);
        const favDoc = await getDoc(favRef);

        if (favDoc.exists()) {
          setIsFavourite(true);
        } else {
          setIsFavourite(false);
        }
      } catch (error) {
        if (error.code === 'unavailable') {
          console.error('Network error, retrying in 5 seconds...');
          setTimeout(fetchFavouriteStatus, 5000);
        } else {
          console.error('Error fetching document:', error);
        }
      }
    };

    fetchFavouriteStatus();
  }, [restaurants]);

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
      setTotal((prevTotal) => prevTotal + item.price);
      return updatedCartItems;
    });
  };

  const removeItemFromCart = (item) => {
    setCartItems((prevCartItems) => {
      const updatedCartItems = { ...prevCartItems };
  
      if (updatedCartItems[restaurantId] && updatedCartItems[restaurantId][item.name]) {
        updatedCartItems[restaurantId][item.name].quantity -= 1;
  
        if (updatedCartItems[restaurantId][item.name].quantity === 0) {
          delete updatedCartItems[restaurantId][item.name];
        }
  
        setTotal((prevTotal) => (prevTotal - item.price >= 0 ? prevTotal - item.price : 0));
      }
  
      return updatedCartItems;
    });
  };

  const getItemCount = () => {
    // Safely handle the case where cartItems or restaurantId might be undefined
    if (!cartItems || !restaurantId || !cartItems[restaurantId]) {
      return 0;
    }
    return Object.values(cartItems[restaurantId] || {}).reduce((count, item) => count + item.quantity, 0);
  };

  const renderItemButtons = (item) => {
    // Safely handle case where cartItems might be empty
    if (!cartItems || !cartItems[restaurantId]) {
      return (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addItemToCart(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>Add</Text>
          <AntDesign name="plus" size={16} color="white" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      );
    }
    
    const itemInCart = cartItems[restaurantId]?.[item.name];
    if (itemInCart) {
      return (
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => removeItemFromCart(item)}
          >
            <AntDesign name="minus" size={16} color="white" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{itemInCart.quantity}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => addItemToCart(item)}
          >
            <AntDesign name="plus" size={16} color="white" />
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addItemToCart(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>Add</Text>
          <AntDesign name="plus" size={16} color="white" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      );
    }
  };

  // Animation for header fade effect
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  // Animation for title appearing in header
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [100, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const pan = useRef(new Animated.ValueXY({ x: width - 70, y: height - 150 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;

  const fallbackImageUri = 'https://thewomenleaders.com/wp-content/uploads/2023/04/McDonalds-is-squeezing-the-formulae-for-its-iconic-burgers-including-the-Big-Mac-and-McDouble.png';

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Animated Header Bar */}
      <Animated.View 
        style={[
          styles.animatedHeader, 
          { opacity: headerTitleOpacity }
        ]}
      >
        <TouchableOpacity 
          style={styles.headerBackButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{restaurants.name}</Text>
        <TouchableOpacity 
          style={styles.headerFavButton}
          onPress={toggleFavourites} 
          disabled={isFavouriteButtonDisabled}
        >
          <AntDesign 
            name={isFavourite ? "heart" : "hearto"} 
            size={22} 
            color={ACCENT_COLOR} 
          />
        </TouchableOpacity>
      </Animated.View>
      
      <Animated.ScrollView 
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Restaurant Cover Image */}
        <View style={styles.coverImageContainer}>
          <Image
            source={{ uri: restaurants.details.coverImage || fallbackImageUri }}
            style={styles.coverImage}
          />
          <View style={styles.coverOverlay} />
          
          {/* Back Button on Cover */}
          <Animated.View style={[styles.coverBackButton, { opacity: headerOpacity }]}>
            <TouchableOpacity 
              style={styles.backButtonInner} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
          
          {/* Restaurant Basic Info Card */}
          <View style={styles.restaurantInfoCard}>
            <View style={styles.restaurantBasicInfo}>
              <View>
                <Text style={styles.title}>{restaurants.name}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.location}>{restaurants.details.location}</Text>
                </View>
                
                <View style={styles.restaurantMetrics}>
                  <View style={styles.metricItem}>
                    <View style={styles.ratingBadge}>
                      <AntDesign name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>{restaurants.details.rating}</Text>
                    </View>
                    <Text style={styles.metricLabel}>Rating</Text>
                  </View>
                  
                  <View style={styles.metricDivider} />
                  
                  <View style={styles.metricItem}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.metricValue}>{restaurants.details.deliveryTime}</Text>
                    <Text style={styles.metricLabel}>Delivery</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.favouriteButton} 
                onPress={toggleFavourites} 
                disabled={isFavouriteButtonDisabled}
              >
                <AntDesign 
                  name={isFavourite ? "heart" : "hearto"} 
                  size={24} 
                  color={ACCENT_COLOR} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Promotion Banner */}
            <View style={styles.offerContainer}>
              <MaterialIcons name="local-offer" size={18} color={ACCENT_COLOR} />
              <Text style={styles.offer}>10% OFF ON ALL BEVERAGES</Text>
            </View>
          </View>
        </View>
        
        {/* Menu Title */}
        <View style={styles.menuSectionHeader}>
          <Text style={styles.menuSectionTitle}>Menu</Text>
          <View style={styles.menuSectionDivider} />
        </View>
        
        {/* Menu Items */}
        <View style={styles.menuItemsContainer}>
          {restaurants.details.menu.map((item) => (
            <View style={styles.menuItem} key={item.id}>
              <View style={styles.menuItemMain}>
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>{item.name}</Text>
                  <Text style={styles.menuDescription} numberOfLines={2}>
                    {item.description || "Delicious dish prepared with fresh ingredients"}
                  </Text>
                  <Text style={styles.menuPrice}>₦ {item.price.toFixed(2)}</Text>
                </View>
                <Image source={{ uri: item.image }} style={styles.menuImage} />
              </View>
              <View style={styles.menuItemActions}>
                {renderItemButtons(item)}
              </View>
            </View>
          ))}
        </View>
      </Animated.ScrollView>

      {/* Chat Modal */}
      <ChatModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleMessageSubmit}
        message={message}
      />
      
      {/* Floating Chat Button */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[pan.getLayout(), styles.chatButton]}
      >
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.chatButtonInner}>
          <Ionicons name="chatbubble-ellipses" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Cart Banner */}
      {getItemCount() > 0 && (
        <CartBanner 
          itemCount={getItemCount()} 
          total={total} 
          cartItems={cartItems} 
          restaurants={restaurants} 
          message={message}
          fromCart={isFromCart}
          existingPacks={existingPacksCount}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 25,
    paddingHorizontal: 15,
    zIndex: 100,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: 15,
  },
  headerFavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
  },
  coverImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  coverImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  coverBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 15,
    zIndex: 5,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantInfoCard: {
    margin: 15,
    marginTop: -50,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  restaurantBasicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  restaurantMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  metricItem: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#EEE',
    marginHorizontal: 15,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFAEB',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  favouriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
  },
  offer: {
    fontSize: 14,
    color: ACCENT_COLOR,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuSectionHeader: {
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 15,
  },
  menuSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  menuSectionDivider: {
    height: 3,
    width: 40,
    backgroundColor: ACCENT_COLOR,
    marginTop: 8,
    borderRadius: 2,
  },
  menuItemsContainer: {
    padding: 15,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItemMain: {
    flexDirection: 'row',
  },
  menuText: {
    flex: 1,
    marginRight: 15,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  menuDescription: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
    lineHeight: 20,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ACCENT_COLOR,
    marginTop: 8,
  },
  menuImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  menuItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
    marginTop: 12,
    paddingTop: 12,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  counterButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ACCENT_COLOR,
  },
  quantityText: {
    width: 36,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  chatButton: {
    position: 'absolute',
    zIndex: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT_COLOR,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  chatButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  bannerLeftContent: {
    flex: 1,
  },
  bannerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 14,
    color: '#666',
  },
  bannerAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  bannerSubText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
