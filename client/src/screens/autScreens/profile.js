import React, { useEffect, useState } from "react"; 
import { Text, View, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView } from "react-native"; 
import { Ionicons } from "@expo/vector-icons"; 
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import BiometricAuthSwitch from '../../components/BiometricAuthSwitch';
// Import Firebase directly using require to avoid issues with module resolution
const { auth, db } = require('../../../firebaseconfi.js');
const { doc, getDoc } = require('firebase/firestore');

const options = [
  { label: 'My Orders', icon: 'list-circle', screen: 'MyOrdersScreen' },
  { label: 'Manage Addresses', icon: 'home', screen:'Manage Add' },
  // { label: 'Payments', icon: 'card', screen:'Payment Option' },
  { label: 'Favourites', icon: 'heart', screen:"FavouriteScreen" },
  { label: 'Help', icon: 'help-circle-sharp' },
  { label: 'Logout', icon: 'log-out' },
];
const defaultProfileIcon = 'https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg'


export default function User({ navigation, route }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        console.log('Loading user data in profile.js...');
        // First check if we have user data in AsyncStorage
        const cachedUserDataString = await AsyncStorage.getItem('@user');
        
        if (cachedUserDataString) {
          const cachedUserData = JSON.parse(cachedUserDataString);
          console.log('Found cached user data in profile:', cachedUserData);
          
          // Extract profile image URL using multiple possible property names
          const photoURL = cachedUserData.photoURL || 
                           cachedUserData.profilePictureUrl || 
                           cachedUserData.photo || 
                           cachedUserData.picture;
          
          setUserData({
            displayName: cachedUserData.displayName || 'User',
            email: cachedUserData.email || '',
            photoURL: photoURL
          });
          
          // Even after loading from cache, try to get the most up-to-date data from Firestore
          if (cachedUserData.uid) {
            try {
              console.log('Fetching Firestore data for UID:', cachedUserData.uid);
              const docRef = doc(db, "users", cachedUserData.uid);
              const docSnap = await getDoc(docRef);
              
              if (docSnap.exists()) {
                const firestoreData = docSnap.data();
                console.log('Firestore data:', firestoreData);
                
                // Get profile image with fallbacks
                const updatedPhotoURL = firestoreData.profilePictureUrl || 
                                        firestoreData.photoURL || 
                                        firestoreData.photo || 
                                        photoURL;
                
                const updatedUserData = {
                  displayName: firestoreData.displayName || cachedUserData.displayName || 'User',
                  email: firestoreData.email || cachedUserData.email || '',
                  photoURL: updatedPhotoURL
                };
                
                console.log('Updated user data:', updatedUserData);
                setUserData(updatedUserData);
                
                // Update the cache with latest data
                await AsyncStorage.setItem('@user', JSON.stringify({
                  uid: cachedUserData.uid,
                  ...updatedUserData,
                  ...firestoreData
                }));
              }
            } catch (error) {
              console.error('Error updating user data from Firestore:', error);
            }
          }
        } else {
          // No cached data, rely on Firebase auth
          const currentUser = auth.currentUser;
          console.log('Current Firebase user:', currentUser);
          
          if (currentUser) {
            let { displayName, email, photoURL, uid } = currentUser;
            
            try {
              console.log('Fetching Firestore data for auth user:', uid);
              const docRef = doc(db, "users", uid);
              const docSnap = await getDoc(docRef);
              
              if (docSnap.exists()) {
                const firestoreData = docSnap.data();
                console.log('Firestore data for auth user:', firestoreData);
                
                // Get profile image with fallbacks
                const updatedPhotoURL = firestoreData.profilePictureUrl || 
                                        firestoreData.photoURL || 
                                        firestoreData.photo || 
                                        photoURL;
                
                displayName = firestoreData.displayName || displayName || 'User';
                email = firestoreData.email || email || '';
                photoURL = updatedPhotoURL;
                
                // Cache the data for future use
                await AsyncStorage.setItem('@user', JSON.stringify({
                  uid,
                  displayName,
                  email,
                  photoURL,
                  ...firestoreData
                }));
              }
              
              setUserData({ displayName, email, photoURL });
            } catch (error) {
              console.error('Error fetching user data from Firestore:', error);
              // Still set whatever data we have from auth
              setUserData({ 
                displayName: displayName || 'User', 
                email: email || '', 
                photoURL 
              });
            }
          } else {
            console.log('No current user and no cached data');
            setUserData(null);
          }
        }
      } catch (error) {
        console.error('Error in loadUserData:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
    
    // Also set up an auth state listener for changes
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log('Auth state changed, user logged in:', user.uid);
        loadUserData(); // Reload data when auth state changes
      } else {
        console.log('Auth state changed, user logged out');
        setUserData(null);
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const handleEditProfile = () => {
    navigation.navigate('Edit Profile');
  }
  
  const handleChangePassword = () => {
    navigation.navigate('Change Password');
  }
  
  const handleDeleteAccount = () => {
    navigation.navigate('Delete Account');
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleLogout = async () => {
    try {
      // Try to sign out from Google if available
      if (GoogleSignin.currentUser) {
        try {
          await GoogleSignin.signOut();
          console.log('Successfully signed out from Google');
        } catch (googleError) {
          console.log('Google sign out error (non-critical):', googleError);
          // Continue with logout even if Google sign out fails
        }
      }
      
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem('@user');
      await AsyncStorage.removeItem('@googleProfileImage');
      
      // Clear biometric authentication settings
      await AsyncStorage.removeItem('biometric_enabled');
      await AsyncStorage.removeItem('biometric_user_id');
      await AsyncStorage.removeItem('@bioAuthGoogleImage');
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Navigate back to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error("Error during logout:", error);
      
      // If error occurs, still try to sign out from Firebase as a fallback
      try {
        await signOut(auth);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } catch (fallbackError) {
        console.error("Error during fallback logout:", fallbackError);
        // If all else fails, just navigate to login
        navigation.navigate('Login');
      }
    }
  };
  
  

  return ( 
    <ScrollView style={styles.container}>
      <View>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleEditProfile}>
            <Image
              source={{ 
                uri: userData && userData.photoURL ? userData.photoURL : defaultProfileIcon
              }}
              style={styles.profileImage}
              // Add error handler to use default if image fails to load
              onError={(e) => {
                console.log('Error loading profile image, using default');
                // This will update the component to use the default image if there's an error
                if (userData) {
                  setUserData({
                    ...userData,
                    photoURL: defaultProfileIcon
                  });
                }
              }}
            />
          </TouchableOpacity>
          
          <Text style={styles.name}>{userData ? userData.displayName : 'Loading...'}</Text>
          <Text style={styles.contact}>{userData ? userData.email : 'Loading...'}</Text>
          {/* <TouchableOpacity>
            <Text style={styles.edit}>EDIT</Text>
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.securitySection}>
        <Text style={styles.sectionTitle}>Security</Text>
        <BiometricAuthSwitch />
      </View>

      <View style={styles.optionsSection}>
        {options.map((option, index) => (
          <TouchableOpacity key={index} style={styles.option} onPress={() => option.label === 'Logout' ? handleLogout() : option.screen && navigation.navigate(option.screen)}>
            <Ionicons name={option.icon} size={24} color="#000" style={styles.icon} />
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView> 
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
    marginBottom: 30,
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
  securitySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 4,
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
    marginBottom: 20,
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
