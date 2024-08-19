import React, { useEffect, useState } from "react"; 
import { Text, View, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native"; 
import { Ionicons } from "@expo/vector-icons"; 
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../../firebaseconfi.js';
import { doc,  getDoc } from "firebase/firestore"
import AsyncStorage from '@react-native-async-storage/async-storage';

const options = [
  { label: 'My Orders', icon: 'list-circle', screen: 'MyOrdersScreen' },
  { label: 'Manage Addresses', icon: 'home', screen:'Manage Add' },
  { label: 'Payments', icon: 'card', scree:'Payment Option' },
  { label: 'Favourites', icon: 'star' },
  { label: 'Help', icon: 'help-circle-sharp' },
  { label: 'Logout', icon: 'log-out' },
];
const defaultProfileIcon = 'https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg'


export default function User() {
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        let { displayName, email, photoURL } = user;
        const userID = user.uid;

        if (!displayName) {
          try {
            const docRef = doc(db, "users", userID);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              displayName = docSnap.data().displayName;
            } else {
              // console.log("No such document!");
            }
          } catch (error) {
            console.error("Error fetching user data: ", error);
          }
        }

        setUserData({ displayName, email, photoURL });
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, []);



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }




  const handleLogout = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.clear();
      navigation.navigate('Sign In'); // Navigate to the SignIn screen after logout
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  return ( 
    <View style={styles.container}>
      <View>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: userData && userData.photoURL ? userData.photoURL : defaultProfileIcon}} // Replace with the URL of the profile picture
            style={styles.profileImage}
          />
          <Text style={styles.name}>{userData ? userData.displayName : 'Loading...'}</Text>
          <Text style={styles.contact}>{userData ? userData.email : 'Loading...'}</Text>
          <TouchableOpacity>
            <Text style={styles.edit}>EDIT</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.optionsSection}>
        {options.map((option, index) => (
          <TouchableOpacity key={index} style={styles.option} onPress={() => option.label === 'Logout' ? handleLogout() : option.screen && navigation.navigate(option.screen)}>
            <Ionicons name={option.icon} size={24} color="#000" style={styles.icon} />
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View> 
  ); 
}; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbf8',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  contact: {
    fontSize: 14,
    color: '#888',
  },
  edit: {
    fontSize: 14,
    color: 'red',
    marginTop: 8,
  },
  optionsSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  icon: {
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
  },
});
