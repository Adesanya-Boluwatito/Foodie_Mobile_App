import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen({ route, navigation }) {
  const { cartItems = {}, restaurantDetails = {} } = route.params || {};

  const getTotal = () => {
    let total = 0;
    Object.values(cartItems).forEach(item => {
      total += item.price * item.quantity;
    });
    return total;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={24} color="black" onPress={() => navigation.goBack()} />
        {restaurantDetails.logo && <Image source={{ uri: restaurantDetails.logo }} style={styles.logo} />}
        <View style={styles.restaurantInfo}>
          {restaurantDetails.name && <Text style={styles.restaurantName}>{restaurantDetails.name}</Text>}
          {restaurantDetails.location && <Text style={styles.restaurantLocation}>{restaurantDetails.location}</Text>}
        </View>
      </View>
      <ScrollView style={styles.cartList}>
        {Object.keys(cartItems).map((key) => {
          const item = cartItems[key];
          return (
            <View key={key} style={styles.cartItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetails}>Regular</Text>
                <TouchableOpacity style={styles.customizeButton}>
                  <Text style={styles.customizeText}>Customize</Text>
                  <Ionicons name="chevron-down" size={16} color="gray" />
                </TouchableOpacity>
              </View>
              <View style={styles.itemControls}>
                <TextInput style={styles.quantityInput} value={`${item.quantity}`} keyboardType="numeric" />
                <Text style={styles.itemPrice}>₦ {item.price.toFixed(2)}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.billDetails}>
        <Text style={styles.billHeader}>Bill Details</Text>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Item Total</Text>
          <Text style={styles.billValue}>₦ {getTotal().toFixed(2)}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Restaurant Charges</Text>
          <Text style={styles.billValue}>₦ {3.00.toFixed(2)}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Delivery Fee</Text>
          <Text style={styles.billValue}>₦ {1.00.toFixed(2)}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Offer 10% OFF</Text>
          <Text style={styles.billValue}>₦ {-getTotal() * 0.1.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>To Pay</Text>
          <Text style={styles.totalValue}>₦ {(getTotal() + 3.00 + 1.00 - getTotal() * 0.1).toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.discountContainer}>
        <TextInput style={styles.discountInput} placeholder="Enter discount code" />
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>APPLY</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.deliveryDetails}>
        <Text style={styles.deliveryLabel}>Deliver to Work</Text>
        <TouchableOpacity>
          <Text style={styles.changeText}>CHANGE</Text>
        </TouchableOpacity>
        <Text style={styles.deliveryAddress}>201, Dev mall, near iskon cross roads...</Text>
      </View>
      <TouchableOpacity style={styles.paymentButton} onPress={() => navigation.navigate('Checkout')}>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    width: 50,
    height: 50,
  },
  restaurantInfo: {
    marginLeft: 10,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  restaurantLocation: {
    fontSize: 14,
    color: 'gray',
  },
  cartList: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
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
  quantityInput: {
    width: 30,
    height: 30,
    borderColor: '#ccc',
    borderWidth: 1,
    textAlign: 'center',
    marginRight: 10,
  },
  itemPrice: {
    fontSize: 16,
  },
  billDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  billHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  billLabel: {
    fontSize: 14,
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
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  changeText: {
    fontSize: 14,
    color: 'red',
    textDecorationLine: 'underline',
    marginBottom: 5,
  },
  deliveryAddress: {
    fontSize: 14,
    color: 'gray',
  },
  paymentButton: {
    backgroundColor: 'red',
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
});
