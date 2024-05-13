import React, { useState } from 'react';
import { View, Text, StyleSheet,TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';


// Check the import statement for colors and parameters
import { colors, parameters } from '../../global/style';
import { AntDesign, FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigation = useNavigation();


    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const handleForgotPassword = () => {
      // Add your logic for handling forgot password here
      console.log('Forgot password link pressed');
  };

    const handleLogin = () => {
      console.log('Signed In');
      navigation.navigate('HomeScreen');
    };

    const someAction =() => {
      console.log("Sign Up")
    }


  return (
    // <KeyboardAvoidingView behavior={'height'} >
    <KeyboardAwareScrollView contentContainerStyle={styles.container} resetScrollToCoords={{ x: 0, y: 0 }} scrollEnabled={false}>

      <Text style={styles.Headertext}>Sign In</Text>

           



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

          <View style= {{marginLeft:247, marginTop:10, marginBottom:20}} font="">
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleLogin}>
            <View style ={styles.signIn}>
              
              <Text style= {styles.buttonText}>Sign In</Text>
          </View>    
          </TouchableOpacity>



          
          

          
        </View>


        <View style = {{padding:15}}>
          <Text style={styles.subtext}> or</Text>
        </View>


        <View style= {styles.buttonsContainer}>

          <View style={styles.faceBookButton} position="absolute" right={-10}>
            <TouchableOpacity onPress={handleForgotPassword} style={{marginLeft:50}}>
              <Text style={styles.faceBookText}>

                  Facebook
              </Text>
              <FontAwesome5 name="facebook-f" size={24} color="white" position="absolute" zIndex={1} left={-25} />
            </TouchableOpacity>
          </View>


          <View style={styles.googleButton}>
            <TouchableOpacity onPress={handleForgotPassword} style={{marginLeft:-35}}>
              <Text style={styles.googleText}>
                Google
              </Text>
              <Ionicons name="logo-google" size={24} color="black" position="absolute" zIndex={1} left={-25} style={{marginLeft:40}}/>
            </TouchableOpacity>
          </View>
            
        </View>

        <View style={styles.optionText}>
          <Text style={styles.subtext}>Not yet a member, <Text onPress={someAction} style={styles.signUpText}>Sign Up</Text></Text>
        </View>


    {/* </View> */}
   </KeyboardAwareScrollView >    
    
    



  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center', // You can change this to 'flex-end' to move the button to the bottom
      alignItems: 'center',
      backgroundColor: "#FCFBF4",
      padding: 20, // Optional padding for the container
      paddingTop:20,
      minHeight: 900, // Adjust this value as needed (e.g., minHeight: 700)
      // height:"100vh",
    }, 
  Headertext: {
    fontSize: 24,
    // fontWeight: 'bold',
    color: colors.text, 
    // marginTop:250// Example usage of colors from global style
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  
  
  subtext: {
    fontSize: 22,
    fontWeight: 'bold',
    color: "#ced4da", 
    // marginLeft: 20,
    // textAlign: "left"// Example usage of colors from global style
  },

  

  TextInput1: {
    borderWidth:1,
    borderColor: "#000000",
    paddingHorizontal: 10,
    // marginHorizontal: 20,
    borderRadius:7,
    marginBottom:30,
    marginTop: 60,
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
