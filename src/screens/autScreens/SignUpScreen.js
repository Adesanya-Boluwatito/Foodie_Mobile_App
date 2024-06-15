import React, { useState } from 'react';
import { View, Text, StyleSheet,TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Button} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification'
import { setDoc, collection, doc } from "firebase/firestore"
import { auth , db} from '../../../firebaseconfi.js';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';


// Check the import statement for colors and parameters
import { colors, parameters } from '../../global/style';
import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigation = useNavigation();

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
    
    const handleSignUp = async () => {
      if (!name || !email || !password) {
        Toast.show({
          type: ALERT_TYPE.WARNING,
          title: 'Error',
          textBody: 'Name, email, and password are required',
          button: 'Close',
        });
        return;
      }
    
      try {
        // Create a new user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userid = user.uid
  
    
        // Add user details to Firestore
        const docRef = doc(db, "users", userid);
        await setDoc(docRef, {
        displayName: name,
        email: email,
      });
        
        console.log('Document written with ID: ', docRef.id);
        
        Toast.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: 'User created successfully!',
          button: 'Close',
        });
    
        navigation.navigate('HomeScreen');
      } catch (error) {
        console.error('Error adding document: ', error);
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: error.message,
          button: 'Close',
        });

      }
      setLoading(false)
    };
    

     

    const someAction =() => {
      console.log("Sign Up")
      navigation.navigate('Sign In')
    }


  return (
    // <KeyboardAvoidingView behavior={'height'} >
    <AlertNotificationRoot>
    <KeyboardAwareScrollView contentContainerStyle={styles.container} resetScrollToCoords={{ x: 0, y: 0 }} scrollEnabled={false}>
        
      <Text style={styles.Headertext}>Sign Up</Text>
          <View >
            <TextInput
                style = {styles.TextInput2}
                placeholder='Name'
                value={name}
                onChangeText={setName}
                
            
            />
          </View>
        <View> 
          <View >
            <TextInput
                style = {styles.TextInput1}
                placeholder='Email'
                value={email}
                onChangeText={setEmail}
            />
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
                style = {styles.TextInput2}
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

          {/* <View style= {{marginLeft:247, marginTop:10, marginBottom:20}} font="">
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View> */}
          <TouchableOpacity onPress={handleSignUp}>
            <View style ={styles.signIn}>
              
              <Text style= {styles.buttonText}>Sign Up</Text>
          </View>    
          </TouchableOpacity>

          
        </View>


        <View style = {{padding:15}}>
          <Text style={styles.subtext}> or</Text>
        </View>


       

        <View style={styles.optionText}>
          <Text style={styles.subtext}>
            Already a member, 
          <TouchableOpacity onPress={someAction}>
          <Text style={styles.signUpText}>Sign In</Text>
          </TouchableOpacity>
          </Text>
        </View>
          
        

    {/* </View> */}
   </KeyboardAwareScrollView > 
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
      paddingTop:30,
      minHeight: 900, // Adjust this value as needed (e.g., minHeight: 700)
      // height:"100vh",
    }, 
  Headertext: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text, 
    paddingBottom:29
    // marginTop:250// Example usage of colors from global style
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 23,
  },
  
  
  
  subtext: {
    fontSize: 22,
    fontWeight: 'bold',
    color: "#ced4da", 
    // marginLeft: 20,
    // textAlign: "left"// Example usage of colors from global style
  },
  nameContainer: {
    
  },

  

  TextInput1: {
    borderWidth:1,
    borderColor: "#000000",
    paddingHorizontal: 10,
    // marginHorizontal: 20,
    borderRadius:7,
    marginBottom:30,
    marginTop: 30,
    marginStart: 10,
    width:330,
    height:50,
  },
  TextInput2: {
    borderWidth:1,
    borderRadius:7,
    paddingHorizontal: 10,
    marginLeft:10,
    marginHorizontal:20,
    width:330,
    height:50,
    borderColor: "#000000",
    flexDirection:'row',
    marginRight:10
    // justifyContent: "space-between",
    // alignContent:'center',
    // alignItems: 'center'
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
    // marginTop: 10,
    // color: 'blue',
    fontFamily: "" ,
    fontWeight:'bold',
},
signIn: {
  backgroundColor: "#f02d3a",
  paddingVertical: 20,
  paddingHorizontal: 1,
  borderRadius: 10,
   marginTop:20, 
   marginBottom:20
  // paddingTop:,
},
buttonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
  textAlign: 'center',
  // paddingLeft: 
},
faceBookButton: {
  backgroundColor: "#1877F2",
  // paddingVertical: 20,
  // paddingHorizontal: -80,
  marginRight: 20,
  marginTop: 10,
  width: 160,
  height:65,
  borderRadius: 10,
  color: "white",
  // alignContent:"center",
  justifyContent: "center"
  // padding:17,
},
 
faceBookText: {
  
    fontSize: 20,
    fontWeight: 'bold',
    color: "white",
    marginTop: 5,
    // marginBottom: 5,
    marginLeft: 7,
    
    justifyContent: "center",
    alignContent:"center",
    // marginLeft: 20,
    textAlign: "left"// Example usage of colors from global style
},
googleButton: {
  backgroundColor: "white",
  borderColor:"grey",
  borderWidth: 2,
  marginRight: 20,
  marginTop: 10,
  width: 160,
  height: 65,
  borderRadius: 10,
  color: "white",
  justifyContent: "center",
  alignItems: 'center', // Center text vertically
  paddingHorizontal: 20, // Adjust padding as needed
  paddingVertical: 15, // Adjust padding as needed
},

googleText: {
  fontSize: 20,
  fontWeight: 'bold',
  color: "black",
  textAlign: "center",
  position: "relative",
  // padding:30,
  marginLeft:60,
},


buttonsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  // paddingBottom:
},

optionText: {
  paddingTop: 50,
  flexDirection: "row",
  alignItems: "center"
},
signUpText: {
  fontSize: 22,
  fontWeight: 'bold',
  color: 'red', 
  // marginTop:,
  marginLeft: 5,
},

 
}
);
