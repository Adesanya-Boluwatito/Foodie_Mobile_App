import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator  } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { auth, db } from '../../../firebaseconfi';
import {doc, onSnapshot, collection, deleteDoc  } from 'firebase/firestore';

const ManageAddressScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const uid = currentUser.uid;
      const addressesRef = collection(db, `addresses/${uid}/userAddresses`);

      const unsubscribe = onSnapshot(addressesRef, (snapshot) => {
        const newAddresses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAddresses(newAddresses);
        setLoading(false); 
      });

      return () => unsubscribe();
    }
  }, []);

  const deleteAddress = (id) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const currentUser = auth.currentUser;
              if (currentUser) {
                const uid = currentUser.uid;
                const addressDocRef = doc(db, `addresses/${uid}/userAddresses`, id);
                await deleteDoc(addressDocRef);
                console.log('Address deleted successfully!');
              }
            } catch (error) {
              console.error('Error deleting address: ', error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4D4D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {addresses.map(address => (
          <View key={address.id} style={styles.addressContainer}>
            <FontAwesome name={address.type === 'Home' ? 'home' : 'briefcase'} size={24} color="gray" />
            <View style={styles.addressTextContainer}>
              <Text style={styles.addressType}>{address.type}</Text>
              <Text style={styles.addressDetails}>{address.details}</Text>
              <Text style={styles.addressDetails}>{address.country}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('Edit Address', { ...address })}
              >
                <Text style={styles.buttonText}>EDIT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteAddress(address.id)}
              >
                <Text style={styles.buttonText}>DELETE</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Add Addy')}
        >
          <Text style={styles.addButtonText}>ADD NEW</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 16,
  },
  addressContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  addressTextContainer: {
    marginLeft: 8,
    marginBottom: 8,
  },
  addressType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressDetails: {
    color: 'gray',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#FF3D00',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#FF3D00',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FF3D00',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#FF3D00',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ManageAddressScreen;
