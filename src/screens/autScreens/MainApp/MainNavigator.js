import React, { useEffect, useState} from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5, Fontisto, Octicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { isOnboardingCompleted } from '../../../../utils/onboradingStatus';
import { getAuthToken } from '../../../../utils/AuthStorage';
import SignUp from '../Onboarding Pages/SignUp';
import OTP from '../Onboarding Pages/OTP';
import Login from '../Onboarding Pages/LogIn'
import HomeScreen from '../HomeScreen';
import AllRestaurants from '../AllRestaurants';
import Profile from '../profile';
import PromoScreen from '../promoScreen';
import CartScreen from '../cartScreen';
import ResturantScreen from '../ResturantScreen';
import OffersScreen from '../offerScreen';
import MapScreen from  '../mapScreen';
import OnBoardingScreen_1 from '../Onboarding Pages/Onboarding_1';
import OnBoardingScreen_2 from '../Onboarding Pages/Onboarding_2';
import OnBoardingScreen_3 from '../Onboarding Pages/Onboarding_3';
import LocationAccess_1 from '../LocationAccess/LocationAccess1';
import LocationAccess_2 from '../LocationAccess/LocationAccess2';
import LocationAccess_3 from '../LocationAccess/LocationAccess3';
import EditProfile from '../Editprofile';
import BottomNavbar from './navbar';
import AddNewAddressScreen from '../AddNewAddressScreen';
import GroupOrderScreen from '../GroupOrderScreen';
import EditAddressScreen from '../EditAddressScreen';
import MyOrdersScreen from '../MyOrdersScreen';
import Foodscreen from '../FoodScreen';
import CustomTabBarLayout from '../../../components/CustomTabBarLayout';
// import SignUpScreen from './src/screens/autScreens/SignUpScreen';
import PaymentOptionsScreen from '../paymentMethod';
import ManageAddressScreen from '../manageScreen';
import ChatScreen from '../ChatScreen';
import CategoryRestaurantsScreen from '../categoryRestaurantsScreen';
import FavouritesScreen from '../FavouriteScreen';
import { HomeIcon, Food, MartIcon, Pharmart, ProfileIcon } from '../../../global/styles/icons/TabIcons';
import { horizontalScale, verticalScale, moderateScale } from "../../../theme/Metrics"
import { globalStyles, fonts } from "../../../global/styles/theme";


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();



const CustomTabBarButton = ({  icon, focused }) => {
  const size = focused ? 34 : 30;
  const color = focused ? '#000' : '#A5A5A5';

  const getIcon = () => {
    switch (icon) { 
      case 'home':
        return <HomeIcon size={size} color={color} focused={focused} />

      case 'Food':
        return <Food size={size} color={color} focused={focused}/>
      
      case 'mart' :
        return <MartIcon size={size} color={color} focused={focused} />

      case 'pharmart' :
        return <Pharmart size={size} color={color} focused={focused} />

      case 'profile' :
        return <ProfileIcon size={size} color={color} focused={focused}/>
        
       
      default:
        return null;  
    }
  }
  return <View style={styles.iconContainer}>{getIcon()}</View>;
};

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        // tabBarShowLabel: true,
        // tabBarLabelStyle:styles.tabBarLabel,
        tabBarStyle: styles.tabBarStyle,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarButton icon="home" focused={focused} />
          ),

          tabBarLabel: ({ focused }) => (
            <Text style={[
              styles.tabBarLabel,
              { color: focused ? 'black' : '#A5A5A5' }
            ]}>
              Home
            </Text>
          ),

          
        }}
      />
      <Tab.Screen
  name="Food"
  // component={Foodscreen}
  options={{
    tabBarIcon: ({ focused }) => (
      <CustomTabBarButton icon="Food" focused={focused} />
    ),
    tabBarLabel: ({ focused }) => (
      <Text
        style={[
          styles.tabBarLabel,
          { color: focused ? 'black' : '#A5A5A5' },
        ]}
      >
        Food
      </Text>
    ),
  }}
>
  {({ navigation, route }) => (
    <CustomTabBarLayout navigation={navigation} route={route}>
      <Foodscreen />
    </CustomTabBarLayout>
  )}
</Tab.Screen>

      <Tab.Screen
        name="Mart"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarButton icon="mart" focused={focused}/>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[ styles.tabBarLabel, {color: focused ? 'black' : '#A5A5A5'} ]}>
              Mart
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Care"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarButton icon="pharmart" focused={focused} />
          ),

          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabBarLabel, { color: focused ? 'black' : '#A5A5A5'}]}>
            Pharmart
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="User"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarButton icon="profile" focused={focused} />
          ),

          tabBarLabel: ({ focused }) => (
            <Text style={ [styles.tabBarLabel,{ color: focused ? 'black' : '#A5A5A5'}]}>
            Profile
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function MyScreens() {

  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Onboarding1');

  useEffect(() => {
    const checkAuthAndOnboardingStatus = async () => {
      const onboardingCompleted = await isOnboardingCompleted();
      const authToken = await getAuthToken();

      if (authToken) {
        setInitialRoute('HomeScreen'); // User is logged in, go to HomeScreen
      } else if (onboardingCompleted) {
        setInitialRoute('Sign In'); // Onboarding completed but not logged in, go to Sign In
      } else {
        setInitialRoute('Onboarding1'); // Show onboarding screens
      }

      setIsLoading(false);
    };

    checkAuthAndOnboardingStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#cc" />
      </View>
    );
  }


  return (
    <Stack.Navigator initialRouteName= {initialRoute}>
      <Stack.Screen name="Sign In" component={Login} options={{ headerShown: false }}/>
      
      <Stack.Screen name="HomeScreen" component={MyTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ResturantScreen" component={ResturantScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MyOrdersScreen" component={MyOrdersScreen} options={{ headerShown: true, title: 'Order History' }} />
      <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding1" component={OnBoardingScreen_1} options={{ headerShown: false, animationEnabled: false, gestureEnabled:false }} />
      <Stack.Screen name="Onboarding2" component={OnBoardingScreen_2} options={{ headerShown: false, animationEnabled: false, gestureEnabled:false  }} />
      <Stack.Screen name="Onboarding3" component={OnBoardingScreen_3} options={{ headerShown: false, animationEnabled: false, gestureEnabled:false  }} />
      <Stack.Screen name="LocationAccess1" component={LocationAccess_1} options={{ headerShown: false, animationEnabled: false, gestureEnabled:false  }} />
      <Stack.Screen name="LocationAccess2" component={LocationAccess_2} options={{ headerShown: false, animationEnabled: false, gestureEnabled:false  }} />
      <Stack.Screen name="OTP" component={OTP} options={{ headerShown: false}}/>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false}}/>
      <Stack.Screen name='MyTabs' component={MyTabs} options={{ headerShown: false }} />
      <Stack.Screen name='MyNavBar' component={BottomNavbar} options={{ headerShown: false }} />
      {/* <Stack.Screen name='MyTabs' component={BottomNavbar} options={{ headerShown: false }} /> */}
      <Stack.Screen name='Manage Add' component={ManageAddressScreen} options={{ headerShown: true, title: 'Manage Addresses' }} />
      <Stack.Screen name='Cart' component={CartScreen} options={{ headerShown: false}} />
      <Stack.Screen name='Payment Option' component={PaymentOptionsScreen} options={{ headerShown: true, title: 'Payment' }} />
      <Stack.Screen name='Add Addy' component={AddNewAddressScreen} options={{ headerShown: false, title: 'Add Address' }} />
      <Stack.Screen name='Edit Address' component={EditAddressScreen} options={{ headerShown: true, title: 'Edit Address' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Support Chat' }} />
      <Stack.Screen name="OfferScreen" component={OffersScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="AllRestaurants" component={AllRestaurants} options={{ headerShown: false }}/>
      <Stack.Screen name="FavouriteScreen" component={FavouritesScreen} options={{ title: 'Favourites'}}/>
      <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="GroupOrder" component={GroupOrderScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="CategoryRestaurantsScreen" component={CategoryRestaurantsScreen} />
      <Stack.Screen name="Edit Profile" component={EditProfile} options={{ headerShown: false }} />



      
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  // customTabButton: {
  //   // borderRadius: 50,
  //   // paddingTop: 2,
  //   // marginRight: 8,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   // width: 100,
  //   // height: 20,
  //   justifyContent: 'center',
  // },
  tabBarLabel: {
    fontSize: moderateScale(15),
    fontFamily: fonts.bold,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: verticalScale(2),
  },
  tabBarStyle: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(15),
    height: verticalScale(60),
    paddingTop: verticalScale(15),
    paddingBottom: verticalScale(2),
  },
  iconContainer: {
    height: verticalScale(34),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(4),
  },
});
