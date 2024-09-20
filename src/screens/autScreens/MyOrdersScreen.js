import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../../firebaseconfi';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { ScrollView } from 'react-native-gesture-handler';

const MyOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const navigation = useNavigation();  
  

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = auth.currentUser.uid;

        // Step 1: Fetch the list of orderIds from the 'users/{userId}/orders' sub-collection
        const userOrdersRef = collection(db, 'users', userId, 'orders');
        const userOrdersSnapshot = await getDocs(userOrdersRef);

        if (userOrdersSnapshot.empty) {
          console.log('No orders found for this user.');
          setOrders([]);
          return;
        }

        // Step 2: Loop through the orderIds and fetch the full order data from the centralized 'orders' collection
        const ordersList = [];
        for (const userOrderDoc of userOrdersSnapshot.docs) {
          const orderId = userOrderDoc.id; // orderId is the document ID in the user's orders sub-collection

          // Step 3: Query the centralized 'orders' collection using the orderId
          const orderRef = doc(db, 'orders', orderId);
          const orderDoc = await getDoc(orderRef);

          if (orderDoc.exists()) {
            const orderData = orderDoc.data();
            ordersList.push({ id: orderId, ...orderData });
          } else {
            // console.log(`Order with ID ${orderId} not found in centralized 'orders' collection.`);
          }
        }

        ordersList.sort((a, b) => b.timestamp - a.timestamp);
        // Step 4: Set the fetched orders into state
        // console.log('Fetched Orders:', ordersList);
        setOrders(ordersList);

      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);



  
  const handleReorder = (orderId) => {
    // Find the order by its ID from the existing orders array
    const order = orders.find(order => order.id === orderId);
  
    if (order && order.packs) {
      // Pass the packs directly to CartScreen
      navigation.navigate('Cart', { packs: order.packs, restaurants: order.restaurant });
      console.log('Formatted Pack from reorderscreen:', JSON.stringify({packs: order.packs}, null, 2));

    } else {
      Alert.alert("Error", "No packs found in this order.");
    }
  
    // Navigate to Cart screen with the formattedCartItems and restaurant information
    // navigation.navigate('Cart', { packs: formattedPacks, restaurants: order.restaurant });
    // console.log('Formatted Pack from reorderscreen:', JSON.stringify(packs, null, 2));
  };

  
  
  
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Header content */}
      </View>
    <ScrollView>
      {orders.length === 0 ? (
        <Text style={styles.noOrdersText}>You have no orders yet.</Text>
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
      

      
    </View>
  );
};
;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 45,
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
    marginBottom: 5,
  },
  orderId: {
    fontSize: 14,
    color: 'gray',
  },
  reorderButton: {
    alignSelf:"flex-end",
    padding: 10,
    backgroundColor: '#bf0603',
    borderRadius: 5,
    top:1
  },
  reorderButtonText: {
    color: '#ffff',
    fontSize: 16,
    fontWeight: 'bold',
    // width:1,
    
  },
});

export default MyOrdersScreen;
