import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "firebase/auth"
import { ALERT_TYPE, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import {auth}  from '../../../firebaseconfi.js';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import {CLIENT_ID} from '@env'
// Check the import statement for colors and parameters
import { colors } from '../../global/style';
import { globalStyles } from '../../global/styles/theme.js';
import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { horizontalScale, moderateScale,  verticalScale } from '../../theme/Metrics.js';



export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  

  const handleForgotPassword = () => {
    // Add your logic for handling forgot password here
    console.log('Forgot password link pressed');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Start Google sign-in process
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();

      const tokens = await GoogleSignin.getTokens();
      const { idToken, accessToken } = tokens;
      console.log("Google ID Token:", tokens);

      
  
      if (!idToken) {
        throw new Error("Google Sign-In ID token is missing");
      }
  
      // Create Google credential and sign in with Firebase
      const googleCredential = GoogleAuthProvider.credential(idToken, accessToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
  
      // Store user information
      await AsyncStorage.setItem('@user', JSON.stringify(userCredential.user));
      navigation.replace('HomeScreen');
     
      }catch (error) {
      console.error("Google Sign-In Error:", error); // Log the full error object
      console.log("Detailed Error Info:", JSON.stringify(error, Object.getOwnPropertyNames(error))); // Log all properties in error
    } finally {
      setLoading(false);
    }
  };
  


  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await AsyncStorage.setItem('@user', JSON.stringify(user));
      navigation.replace('HomeScreen'); // Replace current screen with HomeScreen
    } catch (error) {
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  
  
  

  const someAction = () => {
    console.log("Sign Up");
    navigation.navigate('SignUp');
  };

  return (
    <AlertNotificationRoot>
      <KeyboardAwareScrollView contentContainerStyle={globalStyles.container} resetScrollToCoords={{ x: 0, y: 0 }} scrollEnabled={false}>
        <Text style={globalStyles.textBold}>Sign In</Text>

        <View>
          <View>
            <TextInput
              style={styles.TextInput1}
              placeholder='Email'
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.TextInput2}
              placeholder='Password'
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
              <View style={styles.eyeIconBackground}>
                <AntDesign name={showPassword ? 'eye' : 'eyeo'} size={24} color='black' />
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ marginLeft: horizontalScale(247), marginTop: 10, marginBottom: 20 }} font="">
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleLogin}>
            <View style={styles.signIn}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 15 }}>
          <Text style={styles.subtext}> or</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <View style={styles.faceBookButton} position="absolute" right={-10}>
            <TouchableOpacity onPress={handleForgotPassword} style={{ marginLeft: 50 }}>
              <Text style={styles.faceBookText}>
                Facebook
              </Text>
              <FontAwesome5 name="facebook-f" size={24} color="white" position="absolute" zIndex={1} left={-25} />
            </TouchableOpacity>
          </View>

          <View >
          <GoogleSigninButton
            style={{ width: 192, height: 48 }}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            onPress={handleGoogleLogin}
          />
          </View>
        </View>

        <View style={[styles.optionText]}>
          <Text style={globalStyles.textRegular}>
             Not yet a member,
          </Text>
            <TouchableOpacity onPress={someAction}> 
              <Text style={[globalStyles.textRegular, styles.subtext]} > SignUp </Text>
            </TouchableOpacity>
          
        </View>
      </KeyboardAwareScrollView>
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // You can change this to 'flex-end' to move the button to the bottom
    alignItems: 'center',
    backgroundColor: "#FCFBF4",
    padding: 20, // Optional padding for the container
    paddingTop: verticalScale(20),
    minHeight: 900, // Adjust this value as needed (e.g., minHeight: 700)
  },
  Headertext: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtext: {
    fontSize: moderateScale(18),
    // fontWeight: 'bold',
    color: "#f02d3a",
  },
  TextInput1: {
    borderWidth: 1,
    borderColor: "#000000",
    paddingHorizontal: horizontalScale(10),
    borderRadius: 7,
    marginBottom: 30,
    marginTop: verticalScale(60),
    marginStart: 10,
    width: horizontalScale(330),
    height: verticalScale(50),
  },
  TextInput2: {
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: horizontalScale(10),
    marginLeft: 10,
    marginHorizontal: 20,
    width: horizontalScale(330),
    height: verticalScale(50),
    borderColor: "#000000",
    flexDirection: 'row',
    marginRight: 10,
  },
  eyeIcon: {
    position: 'absolute',
    right: horizontalScale(19),
    top: verticalScale(5),
    zIndex: 1,
  },
  eyeIconBackground: {
    backgroundColor: '#FCFBF4',
    borderRadius: 0,
    padding: 8,
  },
  forgotPasswordText: {
    fontWeight: 'bold',
  },
  signIn: {
    backgroundColor: "#f02d3a",
    paddingVertical: verticalScale(15),
    paddingHorizontal: 1,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  faceBookButton: {
    backgroundColor: "#1877F2",
    marginRight: 20,
    marginTop: 10,
    width: 160,
    height: 65,
    borderRadius: 10,
    color: "white",
    justifyContent: "center",
  },
  faceBookText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "white",
    marginTop: 5,
    marginLeft: 7,
    justifyContent: "center",
    alignContent: "center",
    textAlign: "left",
  },
  googleButton: {
    backgroundColor: "white",
    borderColor: "grey",
    borderWidth: 2,
    marginRight: 20,
    marginTop: 10,
    width: 160,
    height: 65,
    borderRadius: 10,
    color: "white",
    justifyContent: "center",
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  googleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "black",
    textAlign: "center",
    position: "relative",
    marginLeft: 60,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  optionText: {
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  signUpText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'red',
    marginLeft: 5,
  },
});
