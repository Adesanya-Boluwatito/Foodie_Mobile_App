import React, {useState, useEffect, useRef, useMemo} from 'react';
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
  SafeAreaView
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

export default function CartScreen({ route, navigation }) {
  const { cartItems = {}, restaurants = {}, packs: packsFromRoute = [], message = '' } = route.params || {};
  const [updatedCartItems, setUpdatedCartItems] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const {defaultAddress} = useAddress();
  const [packs, setPacks] = useState(packsFromRoute);
  const [isEmpty, setIsEmpty] = useState(packsFromRoute.length === 0);
  const [currentRestaurantId, setCurrentRestaurantId] = useState(restaurants?.id || null);
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
    if (packsFromRoute.length > 0) {
      setPacks(packsFromRoute); // Initialize packs from navigation
      setCollapsedPacks(packsFromRoute.map(() => false)); // Initialize collapsed state
      setPackNames(packsFromRoute.map((_, index) => `Pack ${index + 1}`)); // Initialize pack names
    }
  }, [packsFromRoute]);

  useEffect(() => {
    const restaurantId = Object.keys(cartItems)[0];
      
    if (!restaurantId || Object.keys(cartItems).length === 0) {
      return; // If cartItems is empty, return early to avoid unnecessary updates
    }
  
    if (!packs.some(pack => pack === cartItems)) {
      // Avoid deep comparison with JSON.stringify(), just check if the pack exists
      setPacks(prevPacks => [...prevPacks, cartItems]);
      setCollapsedPacks(prev => [...prev, false]);
      setPackNames(prevNames => [...prevNames, `Pack ${prevNames.length + 1}`]);
    }
  }, [cartItems]);

  const handleChangeAddress = () => {
    navigation.navigate('Manage Add');
  };

  const toggleCollapse = (index) => {
    setCollapsedPacks(prevState => {
      const updatedState = [...prevState];
      updatedState[index] = !updatedState[index];
      return updatedState;
    });
  };
  
  const handleAddNewPack = () => {
    if (Object.keys(updatedCartItems).length > 0) {
      const restaurantId = Object.keys(updatedCartItems)[0];
      if (restaurantId === currentRestaurantId) {
        const packExists = packs.some(pack => JSON.stringify(pack) === JSON.stringify(updatedCartItems));
        if (!packExists) {
          setPacks(prevPacks => [...prevPacks, updatedCartItems]);
          setCollapsedPacks(prev => [...prev, false]);
          setPackNames(prev => [...prev, `Pack ${prev.length + 1}`]);
        }
      } else {
        Alert.alert("Invalid Restaurants", "You can only add packs from the same restaurant.");
      }
    }
    setUpdatedCartItems({});
    navigation.navigate('Explore');
  };

  const clearCart = () => {
    setPacks([]);               // Clear packs
    setUpdatedCartItems({});     // Clear cart items
    setCollapsedPacks([]);       // Reset collapsed packs
    setPackNames([]);            // Reset pack names
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
      setCollapsedPacks(prevState => prevState.filter((_, index) => index !== packIndex));
      setPackNames(prevNames => prevNames.filter((_, index) => index !== packIndex));
      
      if (updatedPacks.length === 0) {
        setCurrentRestaurantId(null); // Reset currentRestaurantId to null
        setUpdatedCartItems({}); // Clear cartItems to reflect an empty cart
        route.params.cartItems = {}; // Clear the cartItems from route params if they come from there
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
        delete updatedPacks[packIndex][restaurantId][item.name];
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

  if (packs.length === 0) {
    return <EmptyCartScreen />;
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
            
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {/* Packs */}
              <View style={styles.packsContainer}>
                {packs.map((pack, packIndex) => (
                  <View key={packIndex} style={styles.packContainer}>
                    <View style={styles.packHeaderContainer}>
                      {editingPackIndex === packIndex ? (
                        <TextInput
                          style={styles.packNameInput}
                          value={packNames[packIndex]}
                          onChangeText={(text) => handlePackNameChange(packIndex, text)}
                          onBlur={() => handlePackNameSubmit(packIndex)}
                          autoFocus={true}
                        />
                      ) : (
                        <TouchableOpacity onPress={() => setEditingPackIndex(packIndex)}>
                          <Text style={styles.packHeader}>{packNames[packIndex] || `Pack ${packIndex + 1}`}</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity 
                        style={styles.collapseButton}
                        onPress={() => toggleCollapse(packIndex)}
                      >
                        <Ionicons 
                          name={collapsedPacks[packIndex] ? 'chevron-down' : 'chevron-up'} 
                          size={22} 
                          color="#555"
                        />
                      </TouchableOpacity>
                    </View>
                    
                    {!collapsedPacks[packIndex] && (
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
                        <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.packActionButtonText}>Duplicate</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={() => handleDeletePack(packIndex)} 
                        style={[styles.packActionButton, styles.deleteButton]}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.packActionButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
              
              {/* Add New Pack Button */}
              <TouchableOpacity 
                style={styles.addNewPackButton} 
                onPress={handleAddNewPack}
              >
                <Ionicons name="add-circle-outline" size={20} color={ACCENT_COLOR} />
                <Text style={styles.addNewPackText}>Add Another Pack</Text>
              </TouchableOpacity>
              
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
              
              {/* Payment Button */}
              <TouchableOpacity 
                style={styles.paymentButton}
                onPress={handleMakePayment}
              >
                <Text style={styles.paymentButtonText}>Proceed to Payment</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View style={styles.bottomPadding}></View>
            </ScrollView>
            
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
    justifyContent: 'center',
    marginHorizontal: horizontalScale(16),
    marginBottom: verticalScale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: 'rgba(255,77,79,0.1)',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
  },
  addNewPackText: {
    marginLeft: 8,
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
  }
});
