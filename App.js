import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from './src/global/style';
import SignIn from './src/screens/autScreens/SignIn';
import HomeScreen from './src/screens/autScreens/HomeScreen'
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-gesture-handler'


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer style={styles.container}>
      <StatusBar
        barStyle = "light-content"
        backgroundColor = {colors.statusbar} 
      />
      
        <Stack.Navigator initialRouteName='SignIn'>
            <Stack.Screen name="Sign In" component={SignIn} options={{
        headerShown: false, // Hide the status bar for SignIn screen
      }}/>
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{
        headerShown: false, // Hide the status bar for SignIn screen
      }}/>

        </Stack.Navigator>
      


      {/* <SignIn />
      <HomeScreen/> */}
      
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {flex:1}
});
  
