import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Icon } from 'react-native-elements';

const MyOrdersScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <TouchableOpacity style={styles.backButton}>
          <Icon name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text> */}
      </View>

      <View style={styles.orderContainer}>
        <View style={styles.orderHeader}>
          <Text style={styles.restaurantName}>McDonald's</Text>
          <Text style={styles.orderTotal}>€27.27</Text>
        </View>
        <Text style={styles.location}>Bodakdev</Text>
        <Text style={styles.orderItems}>Nachos x 1, Maharaja mac x 1</Text>
        <Text style={styles.orderDate}>01 Feb 2024, 05:11 PM</Text>
      </View>

      <TouchableOpacity style={styles.reorderButton}>
        <Text style={styles.reorderButtonText}>REORDER</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop:45,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  orderContainer: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 20,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
  },
  orderItems: {
    fontSize: 16,
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: 'gray',
  },
  reorderButton: {
    backgroundColor: '#fff',
    borderColor: '#ff4d4d',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  reorderButtonText: {
    color: '#ff4d4d',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyOrdersScreen;
