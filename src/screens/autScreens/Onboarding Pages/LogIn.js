import React, {useState, useEffect} from 'react'
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useNavigation } from '@react-navigation/native'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, sendPasswordResetEmail } from "firebase/auth"
import {auth}  from '../../../../firebaseconfi.js';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { ALERT_TYPE, AlertNotificationRoot, Toast } from "react-native-alert-notification";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles, fonts } from '../../../global/styles/theme.js';
import PasswordResetModal from '../../../components/PasswordResetModal.js'
import { verticalScale, horizontalScale, moderateScale } from '../../../theme/Metrics.js'


export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const navigation = useNavigation();
    const [isResetModalVisible, setIsResetModalVisible] = useState(false)
    const [loading, setLoading] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    };


    const signUpOption = () => {
        console.log("Sign Up");
        navigation.navigate('SignUp');
      };


    



    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
          // Start Google sign-in process
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
          await GoogleSignin.signOut();

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
            if (!email || !password) {
                throw new Error('empty-fields');
            }
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          await AsyncStorage.setItem('@user', JSON.stringify(user));
          navigation.replace('HomeScreen'); // Replace current screen with HomeScreen
        } catch (error) {
            console.error('Error adding document:', error);
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'The email address is already in use. Please try with a different email.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'The email address is invalid. Please enter a valid email.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please choose a stronger password.';
            } else if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.message === 'empty-fields') {
                errorMessage = 'Please fill in all the required fields.';
            }
        
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: errorMessage,
                button: 'Close',
            });
        } finally {
          setLoading(false);
        }
    };





    return (
        <AlertNotificationRoot>
        <KeyboardAwareScrollView style={globalStyles.container}>
            <View style={styles.signInContainer}>
                <Text style={globalStyles.textBold}>Sign In</Text>
                <Text style={styles.instruction}>Fill in your details to continue</Text>
            </View>


            <View style={styles.formContainer}>
                <View style={styles.detailsContainer}>
                    <Text style={styles.formFont}>Email</Text>
                    <TextInput
                        placeholder='Email'
                        style={styles.inputField}
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.formFont}>Password</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            placeholder="Minimum 6 characters"
                            style={styles.passwordField}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />  


                        <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
                            <FontAwesome5 name={showPassword ? "eye" : "eye-slash"} size={24} color="#A5A5A5" />
                        </TouchableOpacity>
                    </View>
                    
                </View>

                <View style={styles.forgotPasswordContainer}>
                    <TouchableOpacity onPress={() => setIsResetModalVisible(true)}>
                         <Text style={styles.forgotPassword}>Forgot Password?</Text>
                    </TouchableOpacity>
                    <PasswordResetModal 
                        visible={isResetModalVisible}
                        onClose={() => setIsResetModalVisible(false)}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity  style={styles.SignInbutton} onPress={handleLogin}>
                        {loading ? <ActivityIndicator size="small" color="#fff"/> : <Text style={styles.SignInText}>Sign In</Text>} 
                    </TouchableOpacity> 

                </View>

                <View style={styles.GoogleSection}>
                    <Text style={styles.orText}>or</Text>

                    <GoogleSigninButton
                        style={styles.googleButton}
                        size={GoogleSigninButton.Size.Wide}
                        color={GoogleSigninButton.Color.Light}
                        onPress={handleGoogleLogin}
                    />
                </View>

                <View style={styles.signUpOption}>
                    <Text style={globalStyles.textRegular}>Haven't got an account?</Text>
                    <TouchableOpacity onPress={signUpOption}>
                        <Text style={styles.SignUpText}> Sign Up</Text>  
                    </TouchableOpacity>
                </View>
                
            </View>
        </KeyboardAwareScrollView>
        </AlertNotificationRoot>
    )


}

const styles = StyleSheet.create({
    signInContainer: {
        flex: 1,
        alignSelf: "center",
        alignItems:"center",
        marginTop: verticalScale(88),
        // borderWidth:1,
    },
    instruction: {
        marginTop: verticalScale(20),
        fontFamily: fonts.regular,
        fontWeight: "600",
        fontSize: moderateScale(16),
        color:"grey"
    },
    formContainer: {
        marginTop:verticalScale(40)
    },
    formFont: {
        fontFamily: fonts.bold,
        fontWeight: "700",
        fontSize: moderateScale(16)
    },
    detailsContainer: {
        marginVertical: verticalScale(10)
         
    },
    inputField: {
        borderWidth:1,
        marginTop: verticalScale(10),
        height: verticalScale(50),
        borderRadius:moderateScale(17),
        paddingHorizontal: horizontalScale(12),
        borderColor:  '#A5A5A5',
        fontSize: moderateScale(16),
        fontFamily: fonts.regular,   
        
    },
    inputWrapper: {
        flexDirection: "row",
        position: "relative",
        alignItems: 'center',
    },
    passwordField: {
        borderWidth:1,
        marginTop: verticalScale(10),
        height: verticalScale(50),
        borderRadius:17,
        padding: 12,
        borderColor:  '#A5A5A5',
        fontSize: moderateScale(16),
        fontFamily: fonts.regular, 
        flex:1,    
    },
    eyeIcon: {
        position: "absolute",
        right: horizontalScale(15),
        top: verticalScale(20),
        zIndex: 1,
        
    },
    forgotPasswordContainer: {
        // borderWidth:1,
        flexDirection: "row-reverse",
    },
    forgotPassword: {
        fontFamily: fonts.bold,
        fontWeight:"400",
        fontSize: moderateScale(16),

    },
    buttonContainer: {
        flexDirection:"column",
        // borderWidth: 1,
        marginTop: verticalScale(25),

    },
    SignInbutton: {
        // borderWidth:1,
        backgroundColor:"black",
        // marginVertical: verticalScale(10),
        padding: moderateScale(14),
        borderRadius: moderateScale(15)
    },
    SignInText:{
        color:"white",
        fontFamily: fonts.bold,
        fontWeight: "700",
        fontSize: moderateScale(16),
        textAlign:"center", 
    },
    GoogleSection: {
        flexDirection: "column",
        marginVertical: verticalScale(18),
        // borderWidth: 1,
        alignItems:"center"
    },
    orText: {
        color: "#A5A5A5",
        fontFamily: fonts.bold,
        fontSize: moderateScale(18),
        fontWeight: "700"
    },
    googleButton: {
        borderRadius: moderateScale(35),
        // padding: moderateScale(14),
        fontFamily: fonts.bold,
        fontWeight:"700",
        elevation:0
        
    },
    signUpOption: {
        flex:1,
        flexDirection: 'row',
        alignSelf:"center",
        marginTop: verticalScale(10)
    },
    SignUpText: {
        fontFamily: fonts.bold,
        fontWeight:"700",
        fontSize: moderateScale(16)
    }
})