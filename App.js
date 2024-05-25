import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { colors } from './src/global/style';
import SignIn from './src/screens/autScreens/SignIn';
import HomeScreen from './src/screens/autScreens/HomeScreen'
import profile from './src/screens/autScreens/profile'
import promoscreen from './src/screens/autScreens/promoScreen'
import ResturantScreen from './src/screens/autScreens/ResturantScreen'
import MyOrdersScreen from './src/screens/autScreens/MyOrdersScreen';
import SignUpScreen from './src/screens/autScreens/SignUpScreen';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer,  createAppContainer} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign, FontAwesome, Ionicons,FontAwesome5 } from '@expo/vector-icons'
import 'react-native-gesture-handler'


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ tabBarlabel, icon,  focused }) => (
  <View style={{ backgroundColor: focused ? 'rgba(255,255,255, 0.35)' : 'transparent', borderRadius: 50, paddingTop: 2, marginRight:8, flexDirection:'row', alignItems:'center', width:100, height:20, justifyContent: 'center', flex: 0.5  }}>
    <FontAwesome5 name={icon} size={focused ? 25 : 27} color={focused ? 'white' : 'black'} />
    {focused &&<Text style={{ color: focused ? 'white' : 'black', textAlign: 'center', fontSize:15, paddingLeft:8,fontWeight:'bold' }}>{tabBarlabel}</Text>}
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
      
      tabBarShowLabel:false,
      backgroundColor:'white',
      tabBarActiveTintColor: 'white',
      tabBarInactiveTintColor:'black', // Assuming colors.white is defined in your theme
      headerShown: false,
      tabBarStyle: {
        backgroundColor:'#bf0603',
        borderRadius:15,
        height:90,
        // width:450,
        marginBottom: -10,
        paddingHorizontal:25,
        paddingBottom:25,
      },
      
    }}
    
      
   
    tabBarIcon={{}}
      >
    <Tab.Screen 
    name="Explore" 
    component={HomeScreen} 
    options={{
      headerShown:false,
      // tabBarLabel:'Explore',
      tabBarIcon: ({ focused }) => (
        <CustomTabBarButton
          icon="compass"
          
          focused={focused}
          tabBarlabel="Explore" // Pass the tabBarLabel as a prop
        />
      ),
    }} />



    {/* }/> */}
    


    <Tab.Screen name="Cart" component={promoscreen} options={{headerShown:false,tabBarIcon: ({ focused }) => (
        <CustomTabBarButton
          icon="shopping-cart"
          
          focused={focused}
          tabBarlabel="Cart" // Pass the tabBarLabel as a prop
        />
      ),}}/>


    

    <Tab.Screen name="Wallet" component={promoscreen} options={{headerShown:false,tabBarIcon: ({ focused }) => (
        <CustomTabBarButton
          icon="wallet"
          
          focused={focused}
          tabBarlabel="Wallet" // Pass the tabBarLabel as a prop
        />
      ),}}/>


    <Tab.Screen name="User" component={profile} options={{headerShown:false,tabBarIcon: ({ focused }) => (
        <CustomTabBarButton
          icon="user-circle"
          
          focused={focused}
          tabBarlabel="Profile" // Pass the tabBarLabel as a prop
        />
      ),}}/>
  </Tab.Navigator>
  )
}

function MyScreens() {
  return(
    <Stack.Navigator>
      
        <Stack.Screen name="Sign In" component={SignIn} options={{
          headerShown: false, // Hide the status bar for SignIn screen
            }}/>

          
        <Stack.Screen name="HomeScreen" component={MyTabs} options={{
          headerShown: false, // Hide the status bar for SignIn screen
            }}/>
        <Stack.Screen name="ResturantScreen" component={ResturantScreen} options={{headerShown: true}}/>
        <Stack.Screen name="MyOrdersScreen" component={MyOrdersScreen} options={{
          headerShown: true,
          title: 'My Order'}}/>

        <Stack.Screen
          name="SignUpScreen"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen name='MyTabs' component={MyTabs} options={{headerShown:false}}/>

        </Stack.Navigator>
  )
}


export default function App() {



 
  return (
    <NavigationContainer style={styles.container}>
      <StatusBar
        barStyle = "light-content"
        backgroundColor = {colors.statusbar} 
      />
      <SafeAreaView style={styles.container}> 
      
        <MyScreens/>
      </SafeAreaView>
      {/* <SignIn/> */}
      
    </NavigationContainer>

    // <NavigationContainer>

    // </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {flex:1,
    minHeight:800,
  },
  
  
});
  
