import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Platform,
  Image,
  SafeAreaView,
  Animated,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { Paystack } from 'react-native-paystack-webview';
import { Ionicons, MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAddress } from '../../components/AddressContext';
import EmptyCartScreen from './emptyCartScreen';
import { auth, db } from '../../../firebaseconfi';
import {addDoc, collection, serverTimestamp, getDocs, query, where, setDoc, doc} from "firebase/firestore";
import { horizontalScale, verticalScale, moderateScale } from '../../theme/Metrics';
import { fonts } from '../../global/styles/theme';

const { width, height } = Dimensions.get('window');

// Calculate responsive dimensions
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const isSmallDevice = SCREEN_WIDTH < 375;
const isLargeDevice = SCREEN_WIDTH >= 768; // Tablet or larger

// Modern accent color - matching the restaurant screen
const ACCENT_COLOR = '#FF4D4F';
const BACKGROUND_COLOR = '#F8F9FA';
const CARD_COLOR = '#FFFFFF';
const TEXT_PRIMARY = '#222222';
const TEXT_SECONDARY = '#666666';

// Create a global variable to preserve packs across navigations
// This ensures we don't lose state during navigation
let globalPacksStore = [];

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CartScreen({ route, navigation }) {
  const { cartItems = {}, restaurants = {}, packs: packsFromRoute = [], message = '' } = route.params || {};
  const [updatedCartItems, setUpdatedCartItems] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const {defaultAddress} = useAddress();
  
  // Initialize packs from global store if it exists, otherwise from route
  const [packs, setPacks] = useState(() => {
    console.log('Initializing packs - Global store has:', globalPacksStore.length, 'packs');
    if (globalPacksStore.length > 0) {
      return [...globalPacksStore];
    } else if (packsFromRoute.length > 0) {
      // Set global store from route if it's the first time
      globalPacksStore = [...packsFromRoute];
      return [...packsFromRoute];
    }
    return [];
  });
  
  const [isEmpty, setIsEmpty] = useState(globalPacksStore.length === 0 && packsFromRoute.length === 0);
  
  // Get restaurant ID from the first pack if available
  const [currentRestaurantId, setCurrentRestaurantId] = useState(() => {
    if (globalPacksStore.length > 0) {
      return Object.keys(globalPacksStore[0])[0] || restaurants?.id || null;
    } else if (packsFromRoute.length > 0) {
      return Object.keys(packsFromRoute[0])[0] || restaurants?.id || null;
    }
    return restaurants?.id || null;
  });
  
  const [collapsedPacks, setCollapsedPacks] = useState([]);
  const [packNames, setPackNames] = useState([]);
  const [editingPackIndex, setEditingPackIndex] = useState(null);
  const paystackWebViewRef = useRef(null);
  const userId = auth.currentUser.uid;
  const restaurantId = restaurants.id;
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  
  useEffect(() => {
    console.log('Received message:', message);
  }, [message]);
  
  useEffect(() => {
    // Set the initial packs and pack names
    if (packs.length > 0) {
      // Initialize collapsed state for each pack
      setCollapsedPacks(packs.map(() => false)); 
      
      // Initialize pack names - preserve any existing ones
      setPackNames(prevNames => {
        if (prevNames.length === packs.length) {
          return prevNames; // Keep existing names if count matches
        }
        return packs.map((_, index) => `Pack ${index + 1}`); // Otherwise create new ones
      });
    }
  }, [packs.length]);

  useEffect(() => {
    const restaurantId = Object.keys(cartItems)[0];
      
    if (!restaurantId || Object.keys(cartItems).length === 0) {
      return; // If cartItems is empty, return early to avoid unnecessary updates
    }
    
    console.log('Processing cartItems:', JSON.stringify(cartItems));
    console.log('Current packs:', JSON.stringify(packs));
  
    // Only add to packs if we don't have a newPack flag in route params
    // This prevents double-adding when returning from restaurant screen
    if (!route.params?.newPack) {
      // Check if this cartItems already exists in any pack
      const cartItemsStr = JSON.stringify(cartItems);
      const packExists = packs.some(pack => JSON.stringify(pack) === cartItemsStr);
      
      if (!packExists) {
        console.log('Adding cartItems as a new pack');
        // Make a deep copy of cartItems to avoid reference issues
        const newPack = JSON.parse(JSON.stringify(cartItems));
        
        setPacks(prevPacks => [...prevPacks, newPack]);
        setCollapsedPacks(prev => [...prev, false]);
        setPackNames(prevNames => [...prevNames, `Pack ${prevNames.length + 1}`]);
        
        if (!currentRestaurantId) {
          setCurrentRestaurantId(restaurantId);
        }
      } else {
        console.log('Pack already exists, not adding');
      }
    } else {
      console.log('Skipping cartItems processing because newPack flag is present');
    }
  }, [cartItems]);

  // Add initial logging of packs on component mount
  useEffect(() => {
    console.log('Initial packs from global store:', JSON.stringify(globalPacksStore));
    console.log('Current packs state:', JSON.stringify(packs));
  }, []);

  // Whenever packs state changes, update our global store
  useEffect(() => {
    if (packs.length > 0) {
      globalPacksStore = [...packs];
      console.log('Updated global store with packs:', globalPacksStore.length);
    }
  }, [packs]);

  const handleChangeAddress = () => {
    navigation.navigate('Manage Add');
  };

  // Toggle pack collapse with animation
  const toggleCollapse = useCallback((index) => {
    setCollapsedPacks(prevState => {
      const updatedState = [...prevState];
      updatedState[index] = !updatedState[index];
      return updatedState;
    });
  }, []);
  
  const handleAddNewPack = () => {
    // Save current restaurant information
    const currentRestaurantInfo = JSON.parse(JSON.stringify(restaurants));
    
    // Generate a unique key for navigation to force component remount
    const uniqueKey = `ResturantScreen_${Date.now()}`;
    
    // First reset the navigation stack to Food screen
    // This ensures we don't build up a large navigation stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'Food' }],
    });
    
    // Then navigate to the restaurant screen with a slight delay
    setTimeout(() => {
      navigation.navigate({
        name: 'ResturantScreen',
        params: { 
          restaurants: currentRestaurantInfo,
          fromCart: true,
          existingPacks: packs.length,
        },
        key: uniqueKey
      });
    }, 50);
  };

  const clearCart = () => {
    setPacks([]);
    globalPacksStore = []; // Also clear the global store
    setUpdatedCartItems({});
    setCollapsedPacks([]);
    setPackNames([]);
  };
  
  const generateUniqueId = async () => {
    let uniqueId;
    let exists = true;
  
    while (exists) {
      // Generate a random 6-digit number
      uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
  
      // Check if the ID already exists in the 'orders' collection
      const orderSnapshot = await getDocs(query(collection(db, 'orders'), where('orderId', '==', uniqueId)));
      exists = !orderSnapshot.empty; // If the snapshot is not empty, the ID exists
    }
  
    return uniqueId;
  };

  const handleDeletePack = (packIndex) => {
    setPacks(prevPacks => {
      const updatedPacks = prevPacks.filter((_, index) => index !== packIndex);
      // Update the global store to match
      globalPacksStore = [...updatedPacks];
      
      setCollapsedPacks(prevState => prevState.filter((_, index) => index !== packIndex));
      setPackNames(prevNames => prevNames.filter((_, index) => index !== packIndex));
      
      if (updatedPacks.length === 0) {
        setCurrentRestaurantId(null); // Reset currentRestaurantId to null
        setUpdatedCartItems({}); // Clear cartItems to reflect an empty cart
        route.params.cartItems = {}; // Clear the cartItems from route params if they come from there
        // Ensure the global store is empty
        globalPacksStore = [];
      }
      return updatedPacks;
    });
  };

  const handleDuplicatePack = (packIndex) => {
    // Clone the selected pack
    const duplicatedPack = { ...packs[packIndex] };
  
    // Add the cloned pack to the packs array
    setPacks(prevPacks => [...prevPacks, duplicatedPack]);
  
    // Add a new name for the duplicated pack
    setPackNames(prevNames => [...prevNames, `${packNames[packIndex]} (Copy)`]);
  
    // Add default collapsed state for the new pack
    setCollapsedPacks(prev => [...prev, false]);
  };

  useEffect(() => {
    if (JSON.stringify(updatedCartItems) !== JSON.stringify(cartItems)) {
      setUpdatedCartItems(cartItems);
    }
    calculateTotal;
  }, [cartItems, packs]);

  const calculateTotal = useMemo(() => {
    let newTotal = 0;
    packs.forEach(pack => {
      Object.values(pack).forEach(restaurantCart => {
        Object.values(restaurantCart).forEach(item => {
          newTotal += (item.price || 0) * (item.quantity || 0);
        });
      });
    });
    return newTotal;
  }, [packs]);
  
  useEffect(() => {
    setTotal(calculateTotal);
  }, [calculateTotal]);
  
  const increaseQuantity = (packIndex, restaurantId, item) => {
    setPacks(prevPacks => {
      const updatedPacks = [...prevPacks];
      if (updatedPacks[packIndex] && updatedPacks[packIndex][restaurantId] && updatedPacks[packIndex][restaurantId][item.name]) {
        updatedPacks[packIndex][restaurantId][item.name].quantity += 1;
      }
      return updatedPacks;
    });
  };

  const decreaseQuantity = (packIndex, restaurantId, item) => {
    setPacks(prevPacks => {
      const updatedPacks = [...prevPacks];
      if (updatedPacks[packIndex] && updatedPacks[packIndex][restaurantId] && updatedPacks[packIndex][restaurantId][item.name]) {
        updatedPacks[packIndex][restaurantId][item.name].quantity -= 1;
        if (updatedPacks[packIndex][restaurantId][item.name].quantity === 0) {
          delete updatedPacks[packIndex][restaurantId][item.name];
        }
      }
      return updatedPacks;
    });
  };
  
  const removeItem = (packIndex, restaurantId, item) => {
    setPacks(prevPacks => {
      const updatedPacks = [...prevPacks];
      
      if (updatedPacks[packIndex] && updatedPacks[packIndex][restaurantId]) {
        // Delete the item
        delete updatedPacks[packIndex][restaurantId][item.name];
        
        // Check if the restaurant cart is now empty
        if (Object.keys(updatedPacks[packIndex][restaurantId]).length === 0) {
          // If restaurant cart is empty, delete it
          delete updatedPacks[packIndex][restaurantId];
          
          // If the whole pack is now empty (no restaurants), remove the pack
          if (Object.keys(updatedPacks[packIndex]).length === 0) {
            // Remove this pack entirely
            updatedPacks.splice(packIndex, 1);
            // Also update collapsed states and pack names
            setCollapsedPacks(prev => prev.filter((_, i) => i !== packIndex));
            setPackNames(prev => prev.filter((_, i) => i !== packIndex));
          }
        }
      }
      
      // Update the global store
      globalPacksStore = [...updatedPacks];
      
      // If all packs are gone, reset restaurant ID
      if (updatedPacks.length === 0) {
        setCurrentRestaurantId(null);
        setUpdatedCartItems({});
      }
      
      return updatedPacks;
    });
  };
  
  const getTotal = () => {
    let total = 0;
  
    packs.forEach(pack => {
      Object.values(pack).forEach(restaurantCart => {
        Object.values(restaurantCart).forEach(item => {
          total += (item.price || 0) * (item.quantity || 0);
        });
      });
    });
  
    return total;
  };
  
  const calculateTotalItems = () => {
    return Object.values(updatedCartItems).reduce((sum, item) => sum + item.quantity, 0);
  };

  const totalPrice = () => {
    const subtotal = calculateTotal;
    return subtotal + restaurants.details.restaurantCharges + restaurants.details.deliveryFee - subtotal * restaurants.details.discount;
  };
  
  const handleMakePayment = () => {
    const totalItems = calculateTotalItems();

    // Configure Paystack
    const paymentConfig = {
      amount: totalPrice() * 100, // Convert to kobo
      billingEmail: 'paystackwebview@something.com', // Replace with user email or default
      onCancel: (e) => {
        console.log('Transaction cancelled:', e);
      },
      onSuccess: async (res) => {
        try {
          console.log('Calling saveOrderToFirebase...');
          await saveOrderToFirebase();
          clearCart();
          console.log('Order saved successfully after payment');
        } catch (error) {
          console.error('Error saving order after payment:', error);
          Alert.alert('Error', 'There was an issue saving your order. Please try again.');
        } finally {
        }
      },
    };

    if (paystackWebViewRef.current) {
      console.log('Starting Paystack transaction...');
      paystackWebViewRef.current.startTransaction(paymentConfig);
    } else {
      console.error('Paystack WebView reference is null.');
    }
  };

  const saveOrderToFirebase = async () => {
    try {
      // Generate a unique order ID
      console.log('Starting to save order to Firebase...');
      const orderId = await generateUniqueId();

      // Structure order data
      const orderData = {
        orderId,
        userId,
        restaurantId,
        message,
        restaurantName: restaurants.name,
        packs,
        restaurant: restaurants,
        totalAmount: totalPrice(),
        address: defaultAddress,
        timestamp: serverTimestamp(),
        status: 'pending',
      };

      //  Save order to the centralized orders collection
      const orderRef = await setDoc(doc(db, 'orders', orderId), orderData);
      console.log("Orders added succesfully. Order ID:", orderId);

      //  Create a reference in the user's orders
      await setDoc(doc(collection(db, 'users', userId, 'orders'), orderId), {
        timestamp: serverTimestamp(),
      });
      console.log('Order reference added to user\'s orders.');

      // Create a reference in the restaurant's orders
      await setDoc(doc(collection(db, 'restaurants', restaurantId, 'orders'), orderId), {
        timestamp: serverTimestamp(),
      });
      console.log('Order reference added to restaurant\'s orders.');

      navigation.navigate('MyOrdersScreen', { orderId });
      Alert.alert('Order Success', 'Your order has been placed successfully!');
    } catch (error) {
      console.error('Error saving order to Firebase:', error);
      Alert.alert('Error', 'There was an issue saving your order. Please try again.');
    }
  };

  const handlePackNameChange = (index, newName) => {
    setPackNames(prevNames => {
      const updatedNames = [...prevNames];
      updatedNames[index] = newName;
      return updatedNames;
    });
  };

  const handlePackNameSubmit = (index) => {
    setEditingPackIndex(null); // Stop editing once the user submits
  };

  // Update useEffect to handle new cart items when returning from restaurant screen
  useEffect(() => {
    // Only process if we have route params with cartItems and newPack flag
    if (route.params?.cartItems && Object.keys(route.params.cartItems).length > 0 && route.params?.newPack) {
      console.log('Processing new pack from restaurant screen');
      const restaurantId = Object.keys(route.params.cartItems)[0];
      
      // Check if this is a new pack from the same restaurant
      if (restaurantId === currentRestaurantId || !currentRestaurantId) {
        // Check if the cartItems has any items in it
        const hasItems = Object.values(route.params.cartItems[restaurantId]).length > 0;
        console.log('Has items in new pack:', hasItems);
        
        if (hasItems) {
          // Create a deep copy of the current packs and the new pack
          const newPack = JSON.parse(JSON.stringify(route.params.cartItems));
          console.log('New pack to add:', JSON.stringify(newPack));
          console.log('Current global store packs:', JSON.stringify(globalPacksStore));
          console.log('Current component packs:', JSON.stringify(packs));
          
          // Get the suggested pack name or generate a new one
          const newPackName = route.params.packName || `Pack ${packNames.length + 1}`;
          
          // Important: Use functional updates to ensure we're working with the latest state
          setPacks(prevPacks => {
            const newPacks = [...prevPacks, newPack];
            console.log('Updated packs array:', JSON.stringify(newPacks));
            // Also update global store
            globalPacksStore = newPacks;
            return newPacks;
          });
          
          setCollapsedPacks(prev => [...prev, false]);
          setPackNames(prev => [...prev, newPackName]);
          
          if (!currentRestaurantId) {
            setCurrentRestaurantId(restaurantId);
          }
          
          // Show confirmation to user
          Alert.alert(
            "Pack Added",
            `${newPackName} has been added to your cart!`
          );
        }
      } else {
        Alert.alert("Invalid Restaurant", "You can only add packs from the same restaurant.");
      }
    }
  }, [route.params?.cartItems, route.params?.newPack]);

  const renderPackCard = useCallback((pack, packIndex) => {
    // Calculate the number of items in this pack
    const itemCount = Object.values(pack).reduce((count, restaurantCart) => {
      return count + Object.values(restaurantCart).length;
    }, 0);
    
    // Calculate the total price of this pack
    const packTotal = Object.values(pack).reduce((sum, restaurantCart) => {
      return sum + Object.values(restaurantCart).reduce(
        (itemSum, item) => itemSum + (item.price || 0) * (item.quantity || 0), 0
      );
    }, 0);
    
    // Configure collapsing animation
    const toggleThisPack = () => {
      // Use a more reliable animation preset
      LayoutAnimation.configureNext({
        duration: 300,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
        delete: {
          duration: 100,
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        create: {
          duration: 200,
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        }
      });
      
      toggleCollapse(packIndex);
    };
    
    const isCollapsed = collapsedPacks[packIndex];
    
    return (
      <View 
        key={packIndex} 
        style={[
          styles.packContainerCard,
          isCollapsed && styles.packContainerCardCollapsed
        ]}
      >
        <TouchableOpacity 
          activeOpacity={0.7}
          style={styles.packHeaderContainer}
          onPress={toggleThisPack}
        >
          <View style={styles.packNameContainer}>
            {editingPackIndex === packIndex ? (
              <TextInput
                style={styles.packNameInput}
                value={packNames[packIndex]}
                onChangeText={(text) => handlePackNameChange(packIndex, text)}
                onBlur={() => handlePackNameSubmit(packIndex)}
                autoFocus={true}
              />
            ) : (
              <>
                <Text style={styles.packHeader}>
                  {packNames[packIndex] || `Pack ${packIndex + 1}`}
                </Text>
                
                {/* Always show item count */}
                <Text style={[
                  styles.packItemCount,
                  isCollapsed && styles.packItemCountCollapsed
                ]}>
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Text>
              </>
            )}
          </View>
          
          <View style={styles.packHeaderRight}>
            {/* Show price always */}
            <Text style={styles.packTotalPrice}>₦ {packTotal.toFixed(2)}</Text>
            
            <View style={styles.collapseButtonContainer}>
              <Ionicons 
                name={isCollapsed ? 'chevron-down' : 'chevron-up'} 
                size={18} 
                color="#555"
              />
            </View>
          </View>
        </TouchableOpacity>
        
        {!isCollapsed && (
          <View style={styles.packItemsContainer}>
            {Object.entries(pack).map(([restaurantId, cartItems]) => (
              <View key={restaurantId}>
                {Object.values(cartItems).map((item, index) => (
                  <View key={`${packIndex}-${item.id || index}-${index}`}>
                    {renderCartItem({ packIndex, restaurantId, item })}
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.packActionsContainer}>
          <TouchableOpacity 
            onPress={() => handleDuplicatePack(packIndex)} 
            style={styles.packActionButton}
          >
            <Ionicons name="copy-outline" size={14} color="#FFFFFF" />
            <Text style={styles.packActionButtonText}>Duplicate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleDeletePack(packIndex)} 
            style={[styles.packActionButton, styles.deleteButton]}
          >
            <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
            <Text style={styles.packActionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [collapsedPacks, editingPackIndex, packNames, handlePackNameChange, handlePackNameSubmit, handleDuplicatePack, handleDeletePack, toggleCollapse]);

  if (packs.length === 0) {
    // Ensure the global store is cleared when showing empty cart
    if (globalPacksStore.length > 0) {
      globalPacksStore = [];
    }
    return <EmptyCartScreen onContinueShopping={() => {
      // Clear all state related to cart when continuing shopping
      globalPacksStore = [];
      setCurrentRestaurantId(null);
      navigation.navigate('Food');
    }} />;
  }

  const renderCartItem = ({ packIndex, restaurantId, item }) => {
    return (
      <View style={styles.cartItem} key={`${packIndex}-${restaurantId}-${item.name}`}>
        <View style={styles.cartItemContent}>
          {item.image && (
            <Image 
              source={{ uri: item.image }}
              style={styles.itemImage}
            />
          )}
          <View style={styles.itemDetailsContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>₦ {item.price.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.itemActions}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              onPress={() => decreaseQuantity(packIndex, restaurantId, item)} 
              style={styles.quantityButton}
            >
              <Feather name="minus" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity 
              onPress={() => increaseQuantity(packIndex, restaurantId, item)} 
              style={styles.quantityButton}
            >
              <Feather name="plus" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            onPress={() => removeItem(packIndex, restaurantId, item)} 
            style={styles.removeButton}
          >
            <Feather name="trash-2" size={14} color={ACCENT_COLOR} />
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={BACKGROUND_COLOR}
        translucent={Platform.OS === 'android'}
      />
      
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ACCENT_COLOR} />
            <Text style={styles.loadingText}>Processing your order...</Text>
          </View>
        ) : (
          <>
            {/* Header */}
            <View style={[styles.header, isLargeDevice && styles.headerLarge]}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
              >
                <Ionicons 
                  name="arrow-back" 
                  size={isSmallDevice ? 18 : 22} 
                  color="#333" 
                />
              </TouchableOpacity>
              
              <View style={styles.restaurantInfo}>
                {restaurants?.name && (
                  <Text 
                    style={[styles.restaurantName, isLargeDevice && styles.restaurantNameLarge]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {restaurants.name}
                  </Text>
                )}
                {restaurants.details?.location && (
                  <View style={styles.locationContainer}>
                    <Ionicons 
                      name="location-outline" 
                      size={isSmallDevice ? 12 : 14} 
                      color="#666" 
                    />
                    <Text 
                      style={[styles.restaurantLocation, isLargeDevice && styles.restaurantLocationLarge]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {restaurants.details.location}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.contentContainer}>
              <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Packs Section with Summary Cards */}
                <View style={styles.packsHeaderContainer}>
                  <Text style={styles.sectionTitle}>Your Order ({packs.length} {packs.length === 1 ? 'Pack' : 'Packs'})</Text>
                  <TouchableOpacity 
                    style={styles.addNewPackButton} 
                    onPress={handleAddNewPack}
                  >
                    <Ionicons name="add-circle-outline" size={16} color={ACCENT_COLOR} />
                    <Text style={styles.addNewPackText}>Add Pack</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Packs List with Horizontal Scroll */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.packsScrollContainer}
                  snapToAlignment="start"
                  decelerationRate="fast"
                  snapToInterval={SCREEN_WIDTH * 0.85 + 16}
                >
                  {packs.map((pack, packIndex) => renderPackCard(pack, packIndex))}
                </ScrollView>
                
                {/* Pack Summary Section */}
                <View style={styles.packsSummaryContainer}>
                  <Text style={styles.sectionTitle}>Order Summary</Text>
                  <View style={styles.packageSummaryCard}>
                    {packs.map((pack, index) => {
                      const packTotal = Object.values(pack).reduce((sum, restaurantCart) => {
                        return sum + Object.values(restaurantCart).reduce(
                          (itemSum, item) => itemSum + (item.price || 0) * (item.quantity || 0), 0
                        );
                      }, 0);
                      
                      return (
                        <View key={index} style={styles.summaryRow}>
                          <Text style={styles.summaryPackName}>{packNames[index]}</Text>
                          <Text style={styles.summaryPackPrice}>₦ {packTotal.toFixed(2)}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
                
                {/* Delivery Address */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Delivery Address</Text>
                  {defaultAddress ? (
                    <View style={styles.addressCard}>
                      <View style={styles.addressHeader}>
                        <View style={styles.addressTypeContainer}>
                          <View style={styles.addressTypeIcon}>
                            <Ionicons 
                              name={defaultAddress.type === 'Home' ? 'home' : 'briefcase'} 
                              size={16} 
                              color="#FFFFFF" 
                            />
                          </View>
                          <Text style={styles.addressType}>{defaultAddress.type}</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.changeAddressButton}
                          onPress={handleChangeAddress}
                        >
                          <Feather name="edit-2" size={16} color={ACCENT_COLOR} />
                          <Text style={styles.changeAddressText}>Change</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.addressDetails}>{defaultAddress.details}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.addAddressButton}
                      onPress={handleChangeAddress}
                    >
                      <Ionicons name="add-circle" size={20} color={ACCENT_COLOR} />
                      <Text style={styles.addAddressText}>Add a delivery address</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {/* Promo Code */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Promo Code</Text>
                  <View style={styles.promoContainer}>
                    <TextInput 
                      style={styles.promoInput} 
                      placeholder="Enter promo code" 
                      value={promoCode}
                      onChangeText={setPromoCode}
                    />
                    <TouchableOpacity 
                      style={[
                        styles.promoButton,
                        promoCode.length > 0 ? styles.promoButtonActive : {}
                      ]}
                      disabled={promoCode.length === 0}
                    >
                      <Text style={styles.promoButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Bill Details */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Bill Details</Text>
                  <View style={styles.billCard}>
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>Item Total</Text>
                      <Text style={styles.billValue}>₦ {getTotal().toFixed(2)}</Text>
                    </View>
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>Restaurant Charges</Text>
                      <Text style={styles.billValue}>₦ {restaurants.details.restaurantCharges.toFixed(2)}</Text>
                    </View>
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>Delivery Fee</Text>
                      <Text style={styles.billValue}>₦ {restaurants.details.deliveryFee.toFixed(2)}</Text>
                    </View>
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>Discount ({restaurants.details.discount * 100}% OFF)</Text>
                      <Text style={styles.billValue}>-₦ {(getTotal() * restaurants.details.discount).toFixed(2)}</Text>
                    </View>
                    <View style={styles.billDivider}></View>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Amount</Text>
                      <Text style={styles.totalValue}>₦ {totalPrice().toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.bottomPadding}></View>
              </ScrollView>
              
              {/* Payment Button */}
              <View style={styles.paymentButtonContainer}>
                <TouchableOpacity 
                  style={styles.paymentButton}
                  onPress={handleMakePayment}
                >
                  <Text style={styles.paymentButtonText}>Proceed to Payment</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            
            <Paystack
              paystackKey="pk_test_58253816127400d5a706afa7347a6be34107a93d"
              billingEmail="adesanyaboluwatito225@gmail.com"
              amount={totalPrice()}
              onCancel={(e) => {
                console.log('Transaction cancelled:', e);
              }}
              onSuccess={async (res) => {
                setIsLoading(true)
                await saveOrderToFirebase()
                console.log('Transaction successful:', res);
                setIsLoading(false)
              }}
              ref={paystackWebViewRef}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: TEXT_PRIMARY,
    fontFamily: fonts.MEDIUM,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(isSmallDevice ? 12 : 16),
    paddingVertical: verticalScale(isSmallDevice ? 10 : 12),
    minHeight: verticalScale(isSmallDevice ? 50 : 60),
    backgroundColor: CARD_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerLarge: {
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(16),
    minHeight: verticalScale(70),
  },
  backButton: {
    width: isSmallDevice ? 36 : 40,
    height: isSmallDevice ? 36 : 40,
    borderRadius: isSmallDevice ? 18 : 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginRight: horizontalScale(isSmallDevice ? 8 : 12),
  },
  restaurantInfo: {
    flex: 1,
    paddingRight: horizontalScale(8),
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: Math.min(isSmallDevice ? 16 : 18, SCREEN_WIDTH / 25),
    fontFamily: fonts.BOLD,
    color: TEXT_PRIMARY,
    marginBottom: isSmallDevice ? 1 : 2,
  },
  restaurantNameLarge: {
    fontSize: 22,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  restaurantLocation: {
    fontSize: Math.min(isSmallDevice ? 11 : 13, SCREEN_WIDTH / 35),
    color: TEXT_SECONDARY,
    fontFamily: fonts.REGULAR,
    marginLeft: 4,
    flex: 1,
  },
  restaurantLocationLarge: {
    fontSize: 15,
  },
  scrollContainer: {
    flex: 1,
  },
  packsContainer: {
    padding: horizontalScale(16),
  },
  packContainer: {
    backgroundColor: CARD_COLOR,
    borderRadius: 12,
    marginBottom: verticalScale(16),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  packHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: horizontalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  packHeader: {
    fontSize: 16,
    fontFamily: fonts.MEDIUM,
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  packNameInput: {
    fontSize: 16,
    fontFamily: fonts.MEDIUM,
    color: TEXT_PRIMARY,
    borderBottomWidth: 1,
    borderBottomColor: ACCENT_COLOR,
    padding: 4,
    minWidth: 150,
  },
  collapseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  packItemsContainer: {
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(8),
  },
  packActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  packActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_COLOR,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(8),
    borderRadius: 8,
    marginLeft: horizontalScale(8),
  },
  deleteButton: {
    backgroundColor: '#666',
  },
  packActionButtonText: {
    marginLeft: 6,
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.MEDIUM,
  },
  cartItem: {
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
    paddingVertical: verticalScale(12),
  },
  cartItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: horizontalScale(12),
  },
  itemDetailsContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontFamily: fonts.MEDIUM,
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: fonts.BOLD,
    color: ACCENT_COLOR,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ACCENT_COLOR,
  },
  quantityText: {
    paddingHorizontal: horizontalScale(12),
    fontSize: 14,
    fontFamily: fonts.MEDIUM,
    color: TEXT_PRIMARY,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  removeButtonText: {
    fontSize: 12,
    fontFamily: fonts.MEDIUM,
    color: ACCENT_COLOR,
    marginLeft: 4,
  },
  addNewPackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(6),
    paddingHorizontal: horizontalScale(12),
    backgroundColor: 'rgba(255,77,79,0.1)',
    borderRadius: 20,
  },
  addNewPackText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: fonts.MEDIUM,
    color: ACCENT_COLOR,
  },
  sectionContainer: {
    padding: horizontalScale(16),
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.BOLD,
    color: TEXT_PRIMARY,
    marginBottom: verticalScale(12),
  },
  addressCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 12,
    padding: horizontalScale(16),
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTypeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: ACCENT_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addressType: {
    fontSize: 15,
    fontFamily: fonts.MEDIUM,
    color: TEXT_PRIMARY,
  },
  changeAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeAddressText: {
    fontSize: 13,
    fontFamily: fonts.MEDIUM,
    color: ACCENT_COLOR,
    marginLeft: 4,
  },
  addressDetails: {
    fontSize: 14,
    fontFamily: fonts.REGULAR,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD_COLOR,
    borderRadius: 12,
    padding: horizontalScale(16),
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  addAddressText: {
    fontSize: 14,
    fontFamily: fonts.MEDIUM,
    color: ACCENT_COLOR,
    marginLeft: 8,
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_COLOR,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  promoInput: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(14),
    fontFamily: fonts.REGULAR,
    fontSize: 14,
    color: TEXT_PRIMARY,
  },
  promoButton: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(14),
    backgroundColor: '#ccc',
  },
  promoButtonActive: {
    backgroundColor: ACCENT_COLOR,
  },
  promoButtonText: {
    fontSize: 14,
    fontFamily: fonts.MEDIUM,
    color: '#FFFFFF',
  },
  billCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 12,
    padding: horizontalScale(16),
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  billLabel: {
    fontSize: 14,
    fontFamily: fonts.REGULAR,
    color: TEXT_SECONDARY,
  },
  billValue: {
    fontSize: 14,
    fontFamily: fonts.MEDIUM,
    color: TEXT_PRIMARY,
  },
  billDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: verticalScale(12),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: fonts.BOLD,
    color: TEXT_PRIMARY,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: fonts.BOLD,
    color: ACCENT_COLOR,
  },
  paymentButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ACCENT_COLOR,
    borderRadius: isSmallDevice ? 10 : 12,
    marginHorizontal: horizontalScale(16),
    marginTop: verticalScale(16),
    marginBottom: verticalScale(10),
    paddingVertical: verticalScale(isSmallDevice ? 14 : 16),
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(255,77,79,0.4)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  paymentButtonText: {
    fontSize: isSmallDevice ? 14 : 16,
    fontFamily: fonts.BOLD,
    color: '#FFFFFF',
    marginRight: 8,
  },
  bottomPadding: {
    height: isSmallDevice ? 30 : 40,
  },
  contentContainer: {
    flex: 1,
  },
  packsHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: horizontalScale(16),
  },
  packsScrollContainer: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: horizontalScale(8),
  },
  packContainerCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 12,
    marginRight: horizontalScale(16),
    width: SCREEN_WIDTH * 0.85,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  packContainerCardCollapsed: {
    minHeight: 100, // Minimum height when collapsed
  },
  packNameContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  packItemCount: {
    fontSize: 12,
    fontFamily: fonts.REGULAR,
    color: TEXT_SECONDARY,
  },
  packItemCountCollapsed: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  packsSummaryContainer: {
    padding: horizontalScale(16),
  },
  packageSummaryCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 12,
    padding: horizontalScale(16),
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  summaryPackName: {
    fontSize: 16,
    fontFamily: fonts.MEDIUM,
    color: TEXT_PRIMARY,
  },
  summaryPackPrice: {
    fontSize: 16,
    fontFamily: fonts.BOLD,
    color: ACCENT_COLOR,
  },
  paymentButtonContainer: {
    padding: horizontalScale(16),
  },
  packHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packTotalPrice: {
    fontSize: 14,
    fontFamily: fonts.BOLD,
    color: ACCENT_COLOR,
    marginRight: 8,
  },
  collapseButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
});
