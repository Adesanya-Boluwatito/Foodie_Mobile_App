import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from "firebase/auth"
import { ALERT_TYPE, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { auth } from '../../../firebaseconfi.js';
// Check the import statement for colors and parameters
import { colors } from '../../global/style';
import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons';


export default function SignIn({promptAsync}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    // Add your logic for handling forgot password here
    console.log('Forgot password link pressed');
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        );
      }
      
      console.log('Signed In', userCredential);
      
      // Show toast for successful login
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: 'Login successful!',
        button: 'Close',
      });
      setLoading(false);
      
      navigation.navigate('HomeScreen');
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Invalid Password",
          textBody: 'The password you entered is incorrect.',
          button: 'Close',
        });
      } else if (error.code === 'auth/user-not-found') {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Invalid Credentials",
          textBody: 'Incorrect email or password.',
          button: 'Close',
        });
      } else {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'An error occurred during sign in. Please try again.',
          button: 'Close',
        });
      }
    }
    setLoading(false)
  };

  
  
  

  const someAction = () => {
    console.log("Sign Up");
    navigation.navigate('SignUpScreen');
  };

  return (
    <AlertNotificationRoot>
      <KeyboardAwareScrollView contentContainerStyle={styles.container} resetScrollToCoords={{ x: 0, y: 0 }} scrollEnabled={false}>
        <Text style={styles.Headertext}>Sign In</Text>

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

          <View style={{ marginLeft: 247, marginTop: 10, marginBottom: 20 }} font="">
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleLogin}>
            <View style={styles.signIn}>
              <Text style={styles.buttonText}>Sign In</Text>
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

          <View style={styles.googleButton}>
            <TouchableOpacity onPress={() => promptAsync()} style={{ marginLeft: -35 }}>
              <Text style={styles.googleText}>
                Google
              </Text>
              <Ionicons name="logo-google" size={24} color="black" position="absolute" zIndex={1} left={-25} style={{ marginLeft: 40 }} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.optionText}>
          <Text style={styles.subtext}>
            Not yet a member,
            <TouchableOpacity onPress={someAction}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </Text>
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
    paddingTop: 20,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: "#ced4da",
  },
  TextInput1: {
    borderWidth: 1,
    borderColor: "#000000",
    paddingHorizontal: 10,
    borderRadius: 7,
    marginBottom: 30,
    marginTop: 60,
    marginStart: 10,
    width: 330,
    height: 50,
  },
  TextInput2: {
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 10,
    marginLeft: 10,
    marginHorizontal: 20,
    width: 330,
    height: 50,
    borderColor: "#000000",
    flexDirection: 'row',
    marginRight: 10,
  },
  eyeIcon: {
    position: 'absolute',
    right: 19,
    top: 5,
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
    paddingVertical: 20,
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
  },
  signUpText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'red',
    marginLeft: 5,
  },
});
