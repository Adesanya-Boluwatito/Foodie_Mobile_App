import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ALERT_TYPE, AlertNotificationRoot, Toast } from "react-native-alert-notification";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {setDoc, collection, doc} from "firebase/firestore"
import { globalStyles, fonts } from "../../../global/styles/theme";
import { horizontalScale, verticalScale, moderateScale } from "../../../theme/Metrics";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../../firebaseconfi";
import axios from 'axios'




export default function SignUp({route}) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('')
    const [borderColor, setBorderColor] = useState('#ccc');
    const [isConfirming, setIsConfirming] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false)
    const[showConfirmPassword, setshowConfirmPassword] = useState(false)

    const isPasswordValid = password.length >= 6 && confirmPassword.length>=6;
    const isFormValid = name && email && phoneNumber && password && confirmPassword && isPasswordValid;

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }
    const toggleConfirmPasswordVisibility =() => {
        setshowConfirmPassword(!showConfirmPassword)
    }

    const handlePasswordInputChange = (text, field) => {
        // Update the respective state based on the field parameter
        if (field === 'password') {
            setPassword(text);
        } else {
            setConfirmPassword(text);
        }

        // Determine border color based on input values
        const pwd = field === 'password' ? text : password;
        const confirmPwd = field === 'confirmPassword' ? text : confirmPassword;
        setBorderColor(confirmPwd ? (pwd === confirmPwd ? 'green' : 'red') : '#ccc');
    };


    const getBorderStyle = () => {
        if (!isConfirming) {
            return { borderColor: '#ccc', borderWidth: 1 };
        }
        if (password && confirmPassword && password === confirmPassword) {
            return { borderColor: '#9ef01a', borderWidth: 2 };
        }
        return { borderColor: 'red', borderWidth: 2 };
    };

    const requestOTP = () => {
        axios.post('http://192.168.82.176:3000/otp/send-otp', { email })
        .then(response => console.log(response.data.message))
        .catch(error => console.error(error));
    }


    const  handleSignUp = async () => {
        if (!name || !email || !password || !phoneNumber) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Error',
                textBody : 'Name,  Email and Password are required',
                button: "Close"
            })
        }

        // Password length validation
        // if (password.length < 6) {
        //     return Toast.show({
        //         type: ALERT_TYPE.WARNING,
        //         title: 'Error',
        //         textBody: 'Password must be at least 6 characters',
        //         button: "Close"
        //     });
        // }

        setLoading(true)
        try {
            // Create a new user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user;
            const userId = user.uid

            navigation.navigate('OTP', { email })
            console.log(email)
            requestOTP()

            // Add user details to Firestore
            const docRef = doc(db,  "users", userId);
            await setDoc(docRef, {
                displayName: name,
                email: email,
                phoneNumber: phoneNumber,
            });

            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Success',
                textBody: "Account created Successfully!",
                button: 'Close',
            })
        } catch (error) {
            console.error('Error adding document:', error); // Log error details for debugging purposes
        
            // let errorMessage = 'Something went wrong. Please try again later.';
        
            // Check if the error is related to a specific issue
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'The email address is already in use. Please try with a different email.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'The email address is invalid. Please enter a valid email.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please choose a stronger password.';
            } else if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.message.includes('empty')) {
                errorMessage = 'Please fill in all the required fields.';
            }
        
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: errorMessage,
                button: 'Close',
            });
        }
        

        setLoading(false)
    };


    // Function to check if all fields are filled
    















    return (
        <AlertNotificationRoot>
            <KeyboardAwareScrollView style={globalStyles.container}>
                <View style={styles.header}>
                    <Text style={globalStyles.textBold}>Sign Up</Text>
                    <Text style={[globalStyles.textRegular, styles.signUpText]}> Fill in your details to get started</Text>
                </View>

                <View style= {styles.formContainer}>
                    <View  style={styles.detailsContainer}>
                        <Text style={styles.formFont}>Full Name</Text>
                        <TextInput
                            placeholder="Full Name"
                            style={styles.inputField}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style= {styles.detailsContainer}>
                        <Text style={styles.formFont}>Email</Text>
                        <TextInput
                            placeholder="Email"
                            style={styles.inputField}
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.detailsContainer}>
                        <Text style={styles.formFont}>Phone Number</Text>
                        <TextInput
                            placeholder="+234   |"
                            style={styles.inputField}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                        />
                    </View>

                    <View style={styles.detailsContainer}>
                        <Text style={styles.formFont}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                            placeholder="Minimum 6 characters"
                            style={[styles.passwordField, getBorderStyle()]}
                            value={password}
                            onChangeText={(text) => handlePasswordInputChange(text, 'password')}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
                            <FontAwesome5 name={showPassword ? "eye" : "eye-slash"} size={24} color="#A5A5A5" />
                        </TouchableOpacity>

                        </View>
                        
                    </View>

                    <View style={styles.detailsContainer}>
                        <Text style={styles.formFont}>Confirm Password</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                placeholder="Minimum 6 characters"
                                style={[styles.passwordField, getBorderStyle()]}
                                value={confirmPassword}
                                onChangeText={(text) => handlePasswordInputChange(text, setIsConfirming(true))}
                                secureTextEntry={!showConfirmPassword}
                            />

                            <TouchableOpacity style={styles.eyeIcon} onPress={toggleConfirmPasswordVisibility}>
                            <FontAwesome5 name={showConfirmPassword ? "eye" : "eye-slash"} size={24} color="#A5A5A5" />
                            </TouchableOpacity>
                        </View>
                        
                        
                    </View>

                    
                    
                </View>


                <View style={styles.footer}>
                    
                        <TouchableOpacity  style={[styles.SignUpbutton, { opacity: isFormValid ? 1 : 0.5}]} onPress={handleSignUp} disabled={!isFormValid}>
                           {loading ? <ActivityIndicator size="small" color="#fff"/> : <Text style={styles.SignUpText}>Create Account</Text>} 
                        </TouchableOpacity>      
                </View>

                <View style={styles.signInOption}>
                        <Text style={globalStyles.textRegular}>Already got an account?</Text>
                        <TouchableOpacity style={styles.SignInButton} onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.SignInText}> Sign In</Text>
                        </TouchableOpacity>
                </View>
                
            </KeyboardAwareScrollView>
        </AlertNotificationRoot>
    )
}

const styles  = StyleSheet.create({
    header: {  
    flex:1, 
    flexDirection: "column",
    marginTop: verticalScale(70),
    marginBottom: verticalScale(29),  // Using margin for positioning instead of top
    alignItems:"center",
    alignSelf:'center',
    alignContent:'center'
    },
    signUpText: {
        // borderWidth: 1,
        color: "grey",
        paddingTop:verticalScale(20),
    },

    formContainer: {
        // borderWidth: 1,
        height: verticalScale(500)
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
        borderRadius:17,
        padding: 12,
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

    footer:{
        // borderWidth:1,
        alignContent:"center",
        alignItems:"center",
        height: verticalScale(70),
    },

    SignUpbutton: {
        // borderWidth:1,
        backgroundColor:"black",
        flex: 1,
        justifyContent:"center",
        alignItems:"center",
        paddingHorizontal: horizontalScale(117),
        marginVertical: verticalScale(10),
        borderRadius: 15
    },
    SignUpText:{
        color:"white",
        fontFamily: fonts.bold,
        fontWeight: "700",
        fontSize: moderateScale(16),
        textAlign:"center", 
    },
    signInOption: {
        flex:1,
        flexDirection: 'row',
        alignSelf:"center",
        marginTop: verticalScale(10)
    },
    
    SignInButton: {
        
    },
    SignInText: {
        fontFamily: fonts.bold,
        fontWeight:"700",
        fontSize: moderateScale(16)
    }
     

})
