import React, {useState, useEffect} from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign'
import { useAddress } from '../../components/AddressContext';
import EmptyCartScreen from './emptyCartScreen';


export default function CartScreen({ route, navigation }) {
  const { cartItems = {}, restaurants = {} } = route.params || {};
  const [updatedCartItems, setUpdatedCartItems] = useState(cartItems);
  const [total, setTotal] = useState(0);
  const {defaultAddress} = useAddress();
  const [packs, setPacks] = useState([])
  const [isEmpty, setIsEmpty] = useState(false);


  useEffect(() => {
    if (Object.keys(cartItems).length > 0) {
      // Only add to packs if cartItems are not already included
      const packExists = packs.some(pack => JSON.stringify(pack) === JSON.stringify(cartItems));
      if (!packExists) {
        setPacks(prevPacks => [...prevPacks, cartItems]);
      }
    }
  }, [cartItems]);

  const handleChangeAddress = () => {
      navigation.navigate('Manage Add')
  }
  const handleAddNewPack = () => {
    if (Object.keys(updatedCartItems).length > 0) {
      // Ensure only new packs are added
      const packExists = packs.some(pack => JSON.stringify(pack) === JSON.stringify(updatedCartItems));
      if (!packExists) {
        const newPacks = [...packs, updatedCartItems];
        if (newPacks.length > 3) {
          newPacks.shift(); // Keep only the last 3 packs
        }
        setPacks(newPacks);
      }
    }
  
    // Reset the cart for new items
    setUpdatedCartItems({});
    navigation.navigate('Explore');
  };

  useEffect(() => {
    console.log("Current cartItems:", cartItems);
    console.log("Current packs:", packs);
  }, [cartItems, packs]);
  
    const handleDeletePack = (packIndex) => {
      setPacks(prevPacks => {
        const updatedPacks = prevPacks.filter((_, index) => index !== packIndex);
  
        // Remove items from updatedCartItems related to the deleted pack
        const updatedItems = { ...updatedCartItems };
        delete updatedItems[packIndex];
  
        // Re-map the keys if needed, e.g., after removing pack 1 from packs [0, 1, 2]
        setUpdatedCartItems(updatedItems);

        setIsEmpty(updatedPacks.length === 0);
  
        return updatedPacks;
      });
    };

  useEffect(() => {
    setUpdatedCartItems(cartItems);
    calculateTotal(); // Update cart items when route.params changes
  }, [cartItems]);


  useEffect(() => {
    calculateTotal();
  }, [updatedCartItems]);

  

  const calculateTotal = () => {
    const newTotal = Object.values(updatedCartItems).reduce((sum, restaurantCart) => {
      return sum + Object.values(restaurantCart || {}).reduce(
        (subSum, item) => subSum + item.price * item.quantity,
        0
      );
    }, 0);
    setTotal(newTotal);
  };

  const increaseQuantity = (packIndex,restaurantId, item) => {
    setPacks(prevPacks => {
      const updatedPacks = [...prevPacks];
      if (updatedPacks[packIndex] && updatedPacks[packIndex][restaurantId] && updatedPacks[packIndex][restaurantId][item.name]) {
        updatedPacks[packIndex][restaurantId][item.name].quantity += 1;
      }
      return updatedPacks;
    });
  };

  const decreaseQuantity = (packIndex,restaurantId, item) => {
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
    return Object.values(updatedCartItems).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };
  const calculateTotalItems = () => {
    return Object.values(updatedCartItems).reduce((sum, item) => sum + item.quantity, 0);
  };
  
  const handleMakePayment = () => {
    const totalItems = calculateTotalItems();
    const totalPrice = getTotal() + restaurants.details.restaurantCharges + restaurants.details.deliveryFee - getTotal() * restaurants.details.discount;
  
    navigation.navigate('Payment Option', {
      totalItems,
      totalPrice: totalPrice.toFixed(2),
    });
  };

  if (Object.keys(updatedCartItems).length === 0 || packs.length===0) {
    return <EmptyCartScreen />; // Render EmptyCartScreen if cart is empty
  }
  


  const renderCartItem = ({ packIndex, restaurantId, item }) => (
    <View style={styles.cartItem} key={item.name}>
      <View style={styles.itemDetailsContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
      </View>
      {/* <Text style={styles.itemPrice}>₦ {item.price.toFixed(2)}</Text> */}
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => decreaseQuantity(packIndex, restaurantId, item)} style={styles.quantityButton}>
          <Text style={{fontSize: 20, fontWeight: "bold", color:"white",}}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => increaseQuantity(packIndex, restaurantId, item)} style={styles.quantityButton}>
          <Text style={{fontSize: 20, fontWeight: "bold", color:"white",}}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => removeItem(packIndex, restaurantId, item)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <AntDesign name="left" size={20} color="#8b8c89" onPress={() => navigation.goBack()} />
        </TouchableOpacity>
        
        {/* {restaurantDetails.logo && <Image source={{ uri: restaurantDetails.logo }} style={styles.logo} />} */}
        <View style={styles.restaurantInfo}>
          {/* {restaurants?.name && <Text style={styles.restaurantName}>{restaurants.name}</Text>} */}
          {/* {restaurants.details.location && <Text style={styles.restaurantLocation}>{restaurants.details.location}</Text>} */}
        </View>
      </View>
      
      <ScrollView style={styles.cartList}>
        {/* Multiple orders layout */}
        {packs.map((pack, index) => (
          <View key={index} style={styles.packContainer}>
            <Text style={styles.packHeader}>Pack {index + 1}</Text>
            <TouchableOpacity onPress={() => handleDeletePack(index)} style={styles.deletePackButton}>
            <Text style={styles.deletePackButtonText}>Delete Pack</Text>
          </TouchableOpacity>
            {Object.entries(pack).map(([restaurantId, cartItems]) => (
              <View key={restaurantId}>
                <Text style={styles.restaurantNameHeader}>{restaurantId}</Text>
                {Object.values(cartItems).map(item => renderCartItem({ packIndex: index, restaurantId, item }))}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      <View style={styles.billDetails}>
        <Text style={styles.billHeader}>Bill Details</Text>
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
          <Text style={styles.billLabel}>Offer {restaurants.details.discount * 100}% OFF</Text>
          <Text style={styles.billValue}>₦ {(-getTotal() * restaurants.details.discount).toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>To Pay</Text>
          <Text style={styles.totalValue}>₦ {(getTotal() + restaurants.details.restaurantCharges + restaurants.details.deliveryFee - getTotal() * restaurants.details.discount).toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.discountContainer}>
        <TextInput style={styles.discountInput} placeholder="Enter discount code" />
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>APPLY</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.deliveryDetails}>
      {defaultAddress ? (
          <View style={styles.addressContainer}>
            <View style={styles.addressDesign}>
              <FontAwesome name={defaultAddress.type === 'Home' ? 'home' : 'briefcase'} size={24} color="gray" />
            <Text style={styles.addressHeader}>Deliver To {defaultAddress.type}</Text>

            <TouchableOpacity onPress={handleChangeAddress} style={styles.changeButton}>
            <FontAwesome name="edit" size={24} color="black" />
            </TouchableOpacity>
            </View>
            <Text style={styles.addressDetails}>{defaultAddress.details}</Text>
            
          </View>
        ) : (
          <Text>No default address set</Text>
          
        )}
      </View>
      
        <View>
          <TouchableOpacity style={styles.newPack} onPress={handleAddNewPack}> 
           <Text style={styles.newPackText}>Add Another pack</Text> 
            </TouchableOpacity>
        </View>

      <TouchableOpacity style={styles.paymentButton} onPress={handleMakePayment}>
        <Text style={styles.paymentButtonText}>MAKE PAYMENT</Text>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    width: 55,
    height: 60,
    left: 15,
    borderRadius:10,
  },
  restaurantInfo: {
    marginLeft: 20,
    alignItems:"center",
    justifyContent: "center",
    flex: 0.8, 
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: "center"
    
  },
  restaurantLocation: {
    fontSize: 14,
    color: 'gray',
    // left:90,
    textAlign: "center"
  },
  cartList: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDetailsContainer: {
    flex: 1, // Takes up the available space
    paddingRight: 10, // Space between the item name and quantity buttons
  },
  itemDetails: {
    fontSize: 14,
    color: 'gray',
  },
  customizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customizeText: {
    fontSize: 14,
    color: 'gray',
    marginRight: 5,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    width: 100,
    // padding:
  },
  quantityButton: {
    width: 25,
    height: 25,
    borderRadius: 20,
    backgroundColor: '#bf0603',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    marginRight: 5,
    fontSize: "bold",
    fontSize: 20,
  },
  quantityInput: {
    width: 30,
    height: 30,
    borderColor: '#ccc',
    borderWidth: 1,
    textAlign: 'center',
    marginRight: 10,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  // quantityButton: {
  //   fontSize: 15,
  //   fontWeight: "bold",
  // },
  itemPrice: {
    fontSize: 16,
  },
  billDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    
  },
  billHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  billLabel: {
    fontSize: 16,
    fontWeight: "400",
    color: 'gray',
  },
  billValue: {
    fontSize: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  discountContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  discountInput: {
    flex: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
  },
  applyButtonText: {
    color: '#fff',
  },
  deliveryDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: "row",
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  addressContainer: {
    // fontSize: 14,
    color: 'gray',
  },
  addressDesign: {
    flexDirection: "row",
  },
  addressHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      left: 10,
      marginBottom: 10,
  },
  addressDetails: {
      fontSize: 17,
      color: "grey",
      // marginTop: 9,
      // left: 34,
  },
  changeButton: {
      left: 200,
  },
  paymentButton: {
    backgroundColor: '#bf0603',
    padding: 15,
    alignItems: 'center',
    margin: 16,
    borderRadius: 5,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  backButton:{
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    // position: "absolute",
    // zIndex: 10,
    // bottom:180,
    // left: 18,
    width: 45,
    height:40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
   },
   newPack: {
      padding:10,
      alignContent: "center",
      alignSelf: "center",
   },
   newPackText: {
      color: "#bf0603"
   },
   restaurantNameHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  packContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  packHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  deletePackButton: {
    alignSelf: 'flex-end',
    padding: 10,
    backgroundColor: '#bf0603',
    borderRadius: 5,
  },
  deletePackButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
