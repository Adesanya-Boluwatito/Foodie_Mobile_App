import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function EmptyCartScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/ima/empty_cart.png')} // Replace with the path to your image
        style={styles.image}
      />
      <Text style={styles.message}>Your cart is empty.</Text>
      <Text style={styles.subMessage}>Please add a few items.</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
    backgroundColor: '#fff', // White background
  },
  image: {
    width: 200, // Adjust size as needed
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20, // Space between image and text
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 5, // Space between message and sub-message
  },
  subMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#C4F1A4', // Light green background for the button
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50, // Adjust the positioning as needed
  },
  addButtonText: {
    fontSize: 24,
    color: '#000', // Black text color for the button
    fontWeight: 'bold',
  },
});
