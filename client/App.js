import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator, Animated, Easing } from 'react-native';
import { colors } from './src/global/style';
import { AddressProvider } from './src/components/AddressContext';
import { PaymentProvider } from './src/components/paymentContext';
import {CartProvider} from './src/components/GroupOrderContext'
import { LocationProvider } from './src/context/LocationContext';
import { NavigationContainer, useNavigation } from '@react-navigation/native';

import 'react-native-gesture-handler';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {CLIENT_ID} from '@env'
import {AnimationProvider} from './src/components/AnimationContext';
import MyScreens from './src/screens/autScreens/MainApp/MainNavigator';











export default function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: CLIENT_ID,
      offlineAccess: false,
    });
    // Simulate loading delay with a timer (e.g., 2000 milliseconds or 2 seconds)
    const timer = setTimeout(() => {
      setLoading(false); // Set loading to false after the timer expires
    }, 2000);

    return () => clearTimeout(timer); // Cleanup the timer on unmount or dependency change
  }, []);



 

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#bf0603" />
      </View>
    );
  }

  return (

    
      
      <CartProvider>
        <PaymentProvider>
           <AddressProvider>
            <LocationProvider>
              <NavigationContainer >
                <AnimationProvider>
                  <StatusBar barStyle="light-content" backgroundColor={colors.statusbar} />
                  {loading ? (
                    // Show loading indicator while loading is true
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#bf0603" />
                    </View>
                  ) : (
                    // Show MyScreens component when loading is false
                    <SafeAreaView style={{ flex: 1 }}>
                    <MyScreens />
                    </SafeAreaView>
                  )}
                </AnimationProvider>
              </NavigationContainer>
            </LocationProvider>
            </AddressProvider>
        </PaymentProvider>
      </CartProvider>
      
        
     
      
     
    
   
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 800 },
});
