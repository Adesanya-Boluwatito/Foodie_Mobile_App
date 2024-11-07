import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator, Animated, Easing } from 'react-native';
import { colors } from './src/global/style';
import SignIn from './src/screens/autScreens/SignIn';
import SignUp from './src/screens/autScreens/Onboarding Pages/SignUp';
import HomeScreen from './src/screens/autScreens/HomeScreen';
import AllRestaurants from './src/screens/autScreens/AllRestaurants';
import Profile from './src/screens/autScreens/profile';
import PromoScreen from './src/screens/autScreens/promoScreen';
import CartScreen from './src/screens/autScreens/cartScreen';
import ResturantScreen from './src/screens/autScreens/ResturantScreen';
import OffersScreen from './src/screens/autScreens/offerScreen';
import MapScreen from  './src/screens/autScreens/mapScreen';
import { AddressProvider } from './src/components/AddressContext';
import { PaymentProvider } from './src/components/paymentContext';
import {CartProvider} from './src/components/GroupOrderContext'
import AddNewAddressScreen from './src/screens/autScreens/AddNewAddressScreen';
import GroupOrderScreen from './src/screens/autScreens/GroupOrderScreen';
import EditAddressScreen from './src/screens/autScreens/EditAddressScreen';
import MyOrdersScreen from './src/screens/autScreens/MyOrdersScreen';
import SignUpScreen from './src/screens/autScreens/SignUpScreen';
import PaymentOptionsScreen from './src/screens/autScreens/paymentMethod';
import ManageAddressScreen from './src/screens/autScreens/manageScreen';
import ChatScreen from './src/screens/autScreens/ChatScreen';
import CategoryRestaurantsScreen from './src/screens/autScreens/categoryRestaurantsScreen';
import FavouritesScreen from './src/screens/autScreens/FavouriteScreen';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5, Fontisto } from '@expo/vector-icons';
import 'react-native-gesture-handler';





// enableScreens(true);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const getIconComponent = (icon, focused) => {
  const fontAwesomeIcons = ['compass','shopping-cart',
    'wallet',
    'user-circle',
    // add more Font Awesome icon names here
  ];

  if (fontAwesomeIcons.includes(icon)) {
    return <FontAwesome5 name={icon} size={focused ? 25 : 27} color={focused ? 'white' : 'black'} />;
  } else {
    return <Fontisto name={icon} size={focused ? 25 : 27} color={focused ? 'white' : 'black'} />;
  }
};

const CustomTabBarButton = ({ tabBarlabel, icon, focused }) => (
  <View style={{ backgroundColor: focused ? 'rgba(255,255,255, 0.35)' : 'transparent', borderRadius: 50, paddingTop: 2, marginRight: 8, flexDirection: 'row', alignItems: 'center', width: 100, height: 20, justifyContent: 'center', flex: 0.5 }}>
    {getIconComponent(icon, focused)}
    {focused && <Text style={{ color: focused ? 'white' : 'black', textAlign: 'center', fontSize: 15, paddingLeft: 8, fontWeight: 'bold' }}>{tabBarlabel}</Text>}
  </View>
);

function MyTabs() {
  return (
    
    <Tab.Navigator screenOptions={{
      tabBarLabelPosition: "beside-icon",
      tabBarHideOnKeyboard: true,
      // keyboardHidesTabBar: true,
      tabBarLabelStyle: {
        fontWeight: "700",
        fontSize: 15,
        // tabBarPosition:'bottom',
        position: 'absolute'
      },
      tabBarShowLabel: false,
      backgroundColor: 'white',
      tabBarActiveTintColor: 'white',
      tabBarInactiveTintColor: 'black',
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#bf0603',
        borderRadius: 15,
        height: 90,
        marginBottom: -10,
        paddingHorizontal: 25,
        paddingBottom: 25,
      },
      tabBarPosition:"bottom"
      // tabBarTransitionPreset: 'fade',
    }}>
      <Tab.Screen name="Explore" component={HomeScreen} options={{
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <CustomTabBarButton
            icon="compass"
            focused={focused}
            tabBarlabel="Explore"
          />
        ),
      }} />
      <Tab.Screen name="Wallet" component={PromoScreen} options={{
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <CustomTabBarButton
            icon="shopping-sale"
            focused={focused}
            tabBarlabel="Promo"
          />
        ),
      }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <CustomTabBarButton
            icon="shopping-cart"
            focused={focused}
            tabBarlabel="Cart"
          />
        ),
      }} />
      
      <Tab.Screen name="User" component={Profile} options={{
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <CustomTabBarButton
            icon="user-circle"
            focused={focused}
            tabBarlabel="Profile"
          />
        ),
      }} />
    </Tab.Navigator>
  );
}

function MyScreens() {
  

  

  return (
    <Stack.Navigator initialRouteName= 'Sign In'>
      <Stack.Screen name="Sign In" component={SignIn} options={{ headerShown: false }}/>
      
      <Stack.Screen name="HomeScreen" component={MyTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ResturantScreen" component={ResturantScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MyOrdersScreen" component={MyOrdersScreen} options={{ headerShown: true, title: 'Order History' }} />
      <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
      <Stack.Screen name='MyTabs' component={MyTabs} options={{ headerShown: false }} />
      <Stack.Screen name='Manage Add' component={ManageAddressScreen} options={{ headerShown: true, title: 'Manage Addresses' }} />
      <Stack.Screen name='Payment Option' component={PaymentOptionsScreen} options={{ headerShown: true, title: 'Payment' }} />
      <Stack.Screen name='Add Addy' component={AddNewAddressScreen} options={{ headerShown: true, title: 'Add Address' }} />
      <Stack.Screen name='Edit Address' component={EditAddressScreen} options={{ headerShown: true, title: 'Edit Address' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Support Chat' }} />
      <Stack.Screen name="OfferScreen" component={OffersScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="AllRestaurants" component={AllRestaurants} options={{ headerShown: false }}/>
      <Stack.Screen name="FavouriteScreen" component={FavouritesScreen} options={{ title: 'Favourites'}}/>
      <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="GroupOrder" component={GroupOrderScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="CategoryRestaurantsScreen" component={CategoryRestaurantsScreen} />


      
    </Stack.Navigator>
  );
}



export default function App() {
  const [loading, setLoading] = useState(true);
  

  


  useEffect(() => {
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
              <NavigationContainer >
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

              </NavigationContainer>
            </AddressProvider>
        </PaymentProvider>
      </CartProvider>
        
     
      
     
    
   
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 800 },
});
