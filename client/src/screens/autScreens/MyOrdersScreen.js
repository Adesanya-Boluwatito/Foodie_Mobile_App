import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../../firebaseconfi';
import { collection, doc, getDoc, getDocs, Timestamp} from 'firebase/firestore';
import { ScrollView } from 'react-native-gesture-handler';
import NoOrdersImage from '../../../assets/ima/shopping-list.png'; // Adjust the path as needed


const MyOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const navigation = useNavigation();  

  // Function to save orders to local storage
  const saveOrdersToLocal = async (orders) => {
    try {
      await AsyncStorage.setItem('userOrders', JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders to local storage:', error);
    }
  };

  // Function to load orders from local storage
  const loadOrdersFromLocal = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem('userOrders');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
  
        // Convert any loaded timestamp to Firestore Timestamp if necessary
        const ordersWithTimestamp = parsedOrders.map(order => {
          if (order.timestamp && typeof order.timestamp === 'object' && !order.timestamp.toDate) {
            // Convert to Firestore Timestamp if not already
            order.timestamp = new Timestamp(order.timestamp.seconds, order.timestamp.nanoseconds);
          }
          return order;
        });
  
        setOrders(ordersWithTimestamp);
        setIsLoading(false); // Stop loading once orders are loaded from local storage
      }
    } catch (error) {
      console.error('Error loading orders from local storage:', error);
    }
  };
  

  // Function to fetch orders from Firestore
  const fetchOrders = async () => {
    try {
      const userId = auth.currentUser.uid;

      // Fetch the list of orderIds from the 'users/{userId}/orders' sub-collection
      const userOrdersRef = collection(db, 'users', userId, 'orders');
      const userOrdersSnapshot = await getDocs(userOrdersRef);

      if (userOrdersSnapshot.empty) {
        console.log('No orders found for this user.');
        setOrders([]);
        setIsLoading(false);
        return;
      }

      // Fetch full order data from the centralized 'orders' collection
      const ordersList = [];
      for (const userOrderDoc of userOrdersSnapshot.docs) {
        const orderId = userOrderDoc.id;

        const orderRef = doc(db, 'orders', orderId);
        const orderDoc = await getDoc(orderRef);

        if (orderDoc.exists()) {
          const orderData = orderDoc.data();
          ordersList.push({ id: orderId, ...orderData });
        }
      }

      // Sort orders by timestamp and update state
      ordersList.sort((a, b) => b.timestamp - a.timestamp);
      setOrders(ordersList);

      // Save fetched orders to local storage
      saveOrdersToLocal(ordersList);

    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false); // Stop loading after fetching orders
    }
  };

  // Load orders on component mount
  useEffect(() => {
    const loadOrders = async () => {
      await loadOrdersFromLocal();  // Try loading orders from local storage
      fetchOrders();  // Fetch fresh orders from Firestore
    };

    loadOrders();
  }, []);

  // Handle reordering
  const handleReorder = (orderId) => {
    const order = orders.find(order => order.id === orderId);
    if (order && order.packs) {
      navigation.navigate('Cart', { packs: order.packs, restaurants: order.restaurant });
    } else {
      Alert.alert("Error", "No packs found in this order.");
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#bf0603" />
          <Text>Loading your orders...</Text>
        </View>
      ) : (
        <ScrollView>
          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
            <Image source={NoOrdersImage} style={styles.noOrdersImage} resizeMode="contain" />
            <Text style={styles.noOrdersText}>You have no orders yet.</Text>
          </View>
          ) : (
            orders.map((order) => (
              <View key={order.id} style={styles.orderContainer}>
                <View style={styles.orderHeader}>
                  <Text style={styles.restaurantName}>{order.restaurantName}</Text>
                  <Text style={styles.orderTotal}>€{order.totalAmount}</Text>
                </View>
                <Text style={styles.orderDate}>{new Date(order.timestamp.toDate()).toLocaleString()}</Text>
                <Text style={styles.orderId}>Order ID: {order.id}</Text>
                <TouchableOpacity style={styles.reorderButton} onPress={() => handleReorder(order.id)}>
                  <Text style={styles.reorderButtonText}>REORDER</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 45,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrdersText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
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
  orderDate: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
  },
  orderId: {
    fontSize: 14,
    color: 'gray',
  },
  reorderButton: {
    alignSelf: "flex-end",
    padding: 10,
    backgroundColor: '#bf0603',
    borderRadius: 5,
  },
  reorderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 200,
  },
  noOrdersImage: {
    width: 200,  // Adjust width as needed
    height: 200, // Adjust height as needed
    marginBottom: 16,
  },
});

export default MyOrdersScreen;
