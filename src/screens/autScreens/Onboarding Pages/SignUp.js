import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ALERT_TYPE, AlertNotificationRoot, Toast } from "react-native-alert-notification";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { globalStyles, fonts } from "../../../global/styles/theme";
import { horizontalScale, verticalScale, moderateScale } from "../../../theme/Metrics";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../../firebaseconfi";




export default function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false)
    const[showConfirmPassword, setshowConfirmPassword] = useState(false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }
    const toggleConfirmPasswordVisibility =() => {
        setshowConfirmPassword(!showConfirmPassword)
    }

    const  handleSignUp = async () => {
        if (!name || email || password) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Error',
                textBody : 'Name,  Email and Password are required',
                button: "Close"
            })
        }

        setLoading(true)
        try {
            // Create a new user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user;
            const userId = user.uid

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

            navigation.navigate('HomeScreen');
        } catch {error} {
            console.error('Error adding document:', error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: error.message,
                button: 'Close',
            })
        }

        setLoading(false)
    };















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
                            placeholder="Password"
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

                    <View style={styles.detailsContainer}>
                        <Text style={styles.formFont}>Confirm Password</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                placeholder="Confirm Password"
                                style={styles.passwordField}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                            />

                            <TouchableOpacity style={styles.eyeIcon} onPress={toggleConfirmPasswordVisibility}>
                            <FontAwesome5 name={showConfirmPassword ? "eye" : "eye-slash"} size={24} color="#A5A5A5" />
                            </TouchableOpacity>
                        </View>
                        
                        
                    </View>

                    
                    
                </View>


                <View style={styles.footer}>
                    
                        <TouchableOpacity  style={styles.SignUpbutton} onPress={handleSignUp}>
                            <Text style={styles.SignUpText}>Create Account</Text>
                        </TouchableOpacity>      
                </View>

                <View style={styles.signInOption}>
                        <Text style={globalStyles.textRegular}>Already got an account?</Text>
                        <TouchableOpacity style={styles.SignInButton} onPress={() => navigation.navigate('Sign In')}>
                            <Text style={styles.SignInText}> Sign In</Text>
                        </TouchableOpacity>
                </View>
                
            </KeyboardAwareScrollView>
        </AlertNotificationRoot>
    )
}

const styles  = StyleSheet.create({
    header: {   
    flexDirection: "column",
    width: horizontalScale(200),   // Responsive width
    height: verticalScale(70),     // Responsive height
    marginTop: verticalScale(70),
    marginBottom: verticalScale(29),  // Using margin for positioning instead of top
    alignItems:"center",
    alignSelf:'center',
    alignContent:'center'
    },
    signUpText: {
        color: "grey",
        paddingTop:verticalScale(30),
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
