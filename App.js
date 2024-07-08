import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator } from 'react-native';
import { colors } from './src/global/style';
import SignIn from './src/screens/autScreens/SignIn';
import HomeScreen from './src/screens/autScreens/HomeScreen';
import Profile from './src/screens/autScreens/profile';
import PromoScreen from './src/screens/autScreens/promoScreen';
import CartScreen from './src/screens/autScreens/cartScreen';
import ResturantScreen from './src/screens/autScreens/ResturantScreen';
import AddNewAddressScreen from './src/screens/autScreens/AddNewAddressScreen';
import EditAddressScreen from './src/screens/autScreens/EditAddressScreen';
import MyOrdersScreen from './src/screens/autScreens/MyOrdersScreen';
import SignUpScreen from './src/screens/autScreens/SignUpScreen';
import PaymentOptionsScreen from './src/screens/autScreens/paymentMethod';
import ManageAddressScreen from './src/screens/autScreens/manageScreen';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import {CLIENT_ID} from '@env'
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential } from "firebase/auth";
import { auth } from "./firebaseconfi";
import AsyncStorage from '@react-native-async-storage/async-storage';


WebBrowser.maybeCompleteAuthSession();
enableScreens(true);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ tabBarlabel, icon, focused }) => (
  <View style={{ backgroundColor: focused ? 'rgba(255,255,255, 0.35)' : 'transparent', borderRadius: 50, paddingTop: 2, marginRight: 8, flexDirection: 'row', alignItems: 'center', width: 100, height: 20, justifyContent: 'center', flex: 0.5 }}>
    <FontAwesome5 name={icon} size={focused ? 25 : 27} color={focused ? 'white' : 'black'} />
    {focused && <Text style={{ color: focused ? 'white' : 'black', textAlign: 'center', fontSize: 15, paddingLeft: 8, fontWeight: 'bold' }}>{tabBarlabel}</Text>}
  </View>
);

function MyTabs() {
  return (
    <Tab.Navigator screenOptions={{
      tabBarLabelPosition: "beside-icon",
      tabBarLabelStyle: {
        fontWeight: "700",
        fontSize: 15
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
      tabBarTransitionPreset: 'fade',
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
      <Tab.Screen name="Wallet" component={PromoScreen} options={{
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <CustomTabBarButton
            icon="wallet"
            focused={focused}
            tabBarlabel="Wallet"
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

function MyScreens({ initialRoute, promptAsync, user }) {
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      navigation.navigate('HomeScreen');
    }
  }, [user]);

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen name="Sign In" options={{ headerShown: false }}>
        {props => <SignIn {...props} promptAsync={promptAsync} />}
      </Stack.Screen>
      <Stack.Screen name="HomeScreen" component={MyTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ResturantScreen" component={ResturantScreen} options={{ headerShown: true }} />
      <Stack.Screen name="MyOrdersScreen" component={MyOrdersScreen} options={{ headerShown: true, title: 'My Order' }} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />
      <Stack.Screen name='MyTabs' component={MyTabs} options={{ headerShown: false }} />
      <Stack.Screen name='Manage Add' component={ManageAddressScreen} options={{ headerShown: true, title: 'Manage Addresses' }} />
      <Stack.Screen name='Payment Option' component={PaymentOptionsScreen} options={{ headerShown: true, title: 'Payment' }} />
      <Stack.Screen name='Add Addy' component={AddNewAddressScreen} options={{ headerShown: true, title: 'Add Address' }} />
      <Stack.Screen name='Edit Address' component={EditAddressScreen} options={{ headerShown: true, title: 'Edit Address' }} />
      
    </Stack.Navigator>
  );
}

const redirectUris = makeRedirectUri({ useProxy: true });

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Sign In'); 
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: CLIENT_ID,
    redirectUri: redirectUris
  });


  useEffect(() => {
    // Simulate loading delay with a timer (e.g., 2000 milliseconds or 2 seconds)
    const timer = setTimeout(() => {
      setLoading(false); // Set loading to false after the timer expires
    }, 2000);

    return () => clearTimeout(timer); // Cleanup the timer on unmount or dependency change
  }, []);

  const clearLocalUser = async () => {
    try {
      await AsyncStorage.removeItem('@user');
    } catch (e) {
      alert(e.message);
    }
  };


  const checkLocalUser = async () => {
    try {
      setLoading(true)
      const userJSON = await AsyncStorage.getItem('@user')
      const userData = userJSON ? JSON.parse(userJSON) : null;
      // console.log("local storage", userData)
      setUserInfo(userData)
      setInitialRoute(userData ? 'HomeScreen' : 'Sign In');
    } catch(e) {
      alert(e.message)
    }finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          const user = userCredential.user;
          setUserInfo(user);
          setInitialRoute('HomeScreen');
        })
        .catch((error) => {
          console.error('Authentication error:', error);
        });
    } else if (response?.type === 'error') {
      console.error('Authentication error:', response.error);
    }
  }, [response]);

  React.useEffect(() => {
    clearLocalUser();
    checkLocalUser()
    const unsub = onAuthStateChanged(auth, async(user) => {
      if(user) {
        console.log(JSON.stringify(user, null,2))
        setUserInfo(user);
        setInitialRoute('HomeScreen');
        await AsyncStorage.setItem('@user', JSON.stringify(user))
      } else {
        setUserInfo(null);
        setInitialRoute('Sign In');
        console.log("else")
      }
    })
    return () => unsub();
  }, [])

  if (loading) 
    return (
      <View style = {{flex: 1, alignItems: "center", justifyContent: "center"}}>
          <ActivityIndicator size={"large"}/>
      </View>
  )

  return (

     <NavigationContainer style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.statusbar} />
      {loading ? (
          // Show loading indicator while loading is true
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#bf0603" />
          </View>
        ) : (
          // Show MyScreens component when loading is false
          <MyScreens initialRoute={initialRoute} promptAsync={promptAsync} user={userInfo} />
        )}

    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 800 },
});
