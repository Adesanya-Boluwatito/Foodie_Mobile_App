import React, {useState, useEffect} from 'react'
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, BackHandler } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, sendPasswordResetEmail } from "firebase/auth"
import {auth, db, doc, getDoc}  from '../../../../firebaseconfi.js';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { ALERT_TYPE, AlertNotificationRoot, Toast } from "react-native-alert-notification";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles, fonts } from '../../../global/styles/theme.js';
import PasswordResetModal from '../../../components/PasswordResetModal.js'
import { verticalScale, horizontalScale, moderateScale } from '../../../theme/Metrics.js'
import { setAuthToken } from '../../../../utils/AuthStorage.js';
import { getLocationData } from '../../../../utils/LocationStorage.js';
import { useLocation } from '../../../context/LocationContext';
import BiometricLoginButton from '../../../components/BiometricLoginButton';
import { isBiometricEnabled, getBiometricType } from '../../../../utils/BiometricAuth';
import Ionicons from '@expo/vector-icons/Ionicons';
import { isLocationRefreshNeeded, clearLocationRefreshFlag } from '../../../../utils/LocationStorage';

export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const navigation = useNavigation();
    const isFocused = useIsFocused(); // Check if this screen is focused
    const [isResetModalVisible, setIsResetModalVisible] = useState(false)
    const [loading, setLoading] = useState(false);
    const { locationData } = useLocation();
    const [biometricsAvailable, setBiometricsAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState('');

    useEffect(() => {
        if (isFocused) {
            const handleBackPress = () => {
                BackHandler.exitApp(); // Closes the app when back is pressed
                return true; // Prevents default back navigation behavior
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

            const checkBiometrics = async () => {
                const biometricEnabled = await isBiometricEnabled();
                const type = await getBiometricType();
                setBiometricsAvailable(biometricEnabled);
                setBiometricType(type);
            };
            
            checkBiometrics();

            return () => {
                backHandler.remove();
            };
        }
    }, [isFocused]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    };

    const signUpOption = () => {
        console.log("Sign Up");
        navigation.navigate('SignUp');
    };

    // Helper function to determine where to navigate after login
    const navigateAfterLogin = async () => {
        try {
            // Check if location refresh is needed (session timeout occurred)
            const isRefreshNeeded = await isLocationRefreshNeeded();
            
            if (isRefreshNeeded) {
                console.log("Session expired, location refresh needed");
                // Clear the flag as we're handling it now
                await clearLocationRefreshFlag();
                // Navigate to location screen to refresh location
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'LocationAccess1' }],
                });
                return;
            }
            
            // Check if location data already exists
            const savedLocation = await getLocationData();
            
            if (savedLocation?.location && savedLocation?.readableLocation) {
                console.log("Location data found, navigating to MainTab");
                navigation.reset({
                    index: 0,
                    routes: [{ 
                      name: 'MainTab',
                      params: {
                        location: savedLocation.location,
                        readableLocation: savedLocation.readableLocation
                      }
                    }],
                });
            } else {
                console.log("No location data found, navigating to LocationAccess1");
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'LocationAccess1' }],
                });
            }
        } catch (error) {
            console.error("Error during navigation after login:", error);
            // Default to LocationAccess1 if there's an error
            navigation.reset({
                index: 0,
                routes: [{ name: 'LocationAccess1' }],
            });
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
          // Add a standalone test for Google Play Services availability
          const isPlayServicesAvailable = await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
          });
          
          if (!isPlayServicesAvailable) {
            throw new Error('Google Play Services not available or outdated');
          }
          
          console.log("Google Play Services check passed");
          
          // Force sign out to ensure a clean slate
          try {
            await GoogleSignin.signOut();
            console.log("Successfully signed out from previous Google sessions");
          } catch (signOutError) {
            console.log("Sign out error (non-critical):", signOutError);
            // Continue despite sign out errors
          }

          // Get current user to check if already signed in
          const currentUser = await GoogleSignin.getCurrentUser();
          console.log("Current Google user before signing in:", currentUser);
          
          // Check if we're running a production build
          console.log("Starting Google sign-in...");
          
          // First try with simplified options
          const userInfo = await GoogleSignin.signIn();
          console.log("Sign in success - userInfo:", userInfo);
          
          // Now try to get tokens
          try {
            const tokens = await GoogleSignin.getTokens();
            console.log("Tokens retrieved successfully");
            const { idToken, accessToken } = tokens;
            
            // Save Google profile image if available
            if (userInfo?.user?.photo) {
              await AsyncStorage.setItem('@googleProfileImage', userInfo.user.photo);
              console.log("Saved Google profile image URL");
            }
        
            if (!idToken) {
              throw new Error("No ID token returned from Google");
            }
        
            // Create Firebase credential and sign in
            console.log("Creating Firebase credential...");
            const googleCredential = GoogleAuthProvider.credential(idToken, accessToken);
            const userCredential = await signInWithCredential(auth, googleCredential);
            console.log("Firebase authentication successful");
        
            // Store user data
            const userData = {
              ...userCredential.user,
              photoURL: userInfo?.user?.photo || userCredential.user.photoURL
            };
            await AsyncStorage.setItem('@user', JSON.stringify(userData));
            await setAuthToken(userCredential.user.uid);
            
            // Navigate after successful login
            await navigateAfterLogin();
          } catch (tokenError) {
            console.error("Error getting tokens:", tokenError);
            Toast.show({
              type: ALERT_TYPE.DANGER,
              title: 'Authentication Error',
              textBody: 'Failed to authenticate with Google. Please try again.',
              button: 'Close',
            });
          }
        } catch (error) {
          console.error("Google Sign-In Error:", error);
          console.log("Error Code:", error.code);
          console.log("Error Message:", error.message);
          
          // Detailed error reporting for development
          let errorMessage = 'Google Sign-In failed. Please try again.';
          let errorDetails = '';
          
          if (error.code === 'SIGN_IN_CANCELLED') {
            errorMessage = 'Sign in was cancelled';
          } else if (error.code === 'SIGN_IN_REQUIRED') {
            errorMessage = 'Sign in is required to continue';
          } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
            errorMessage = 'Google Play Services are not available or outdated';
          } else if (error.code === 'DEVELOPER_ERROR') {
            errorMessage = 'Configuration error in Google Sign-In';
            errorDetails = 'The OAuth client ID may be incorrect or restricted';
          } else if (error.message?.includes('network')) {
            errorMessage = 'Network error. Please check your internet connection.';
          }
          
          // Show detailed error for debug
          console.log("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
          
          // Alert with more details
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: 'Login Error',
            textBody: `${errorMessage}\n${errorDetails ? 'Details: ' + errorDetails : ''}`,
            button: 'Close',
          });
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
          await setAuthToken(userCredential.user.uid);
          
          // Navigate based on whether location data exists
          await navigateAfterLogin();
          
        } catch (error) {
            console.error('Error adding document:', error);
            let errorMessage = 'An unexpected error occurred. Please try again.';
            
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
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password. Please try again.';
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

    // Handle biometric login success
    const handleBiometricLoginSuccess = async (userId) => {
        try {
            // Get the user data that was stored during biometric authentication
            const userDataString = await AsyncStorage.getItem('@user');
            const userData = userDataString ? JSON.parse(userDataString) : null;

            if (!userData) {
                console.warn('No user data found after biometric authentication');
                // Try to fetch user data from Firestore as a fallback
                try {
                    const userDoc = await getDoc(doc(db, 'users', userId));
                    if (userDoc.exists()) {
                        const userDocData = userDoc.data();
                        // Store complete user data
                        await AsyncStorage.setItem('@user', JSON.stringify({
                            uid: userId,
                            ...userDocData
                        }));
                        console.log('User data retrieved from Firestore after biometric login');
                    }
                } catch (fallbackError) {
                    console.error('Error fetching fallback user data:', fallbackError);
                }
            } else {
                console.log('User data successfully loaded after biometric login');
            }

            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Login Success',
                textBody: 'Successfully authenticated with biometrics',
                button: 'Close',
            });
            
            // Navigate based on whether location data exists
            await navigateAfterLogin();
        } catch (error) {
            console.error('Error handling biometric login success:', error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Error',
                textBody: 'Something went wrong after biometric authentication',
                button: 'Close',
            });
        }
    };

    return (
        <AlertNotificationRoot>
        <KeyboardAwareScrollView style={globalStyles.container}>
            <View style={styles.signInContainer}>
                <Text style={globalStyles.textBold}>Sign In</Text>
                <Text style={styles.instruction}>Fill in your details to continue</Text>
            </View>

            {/* Show biometric info message if available */}
            {biometricsAvailable && (
                <View style={styles.biometricsInfoContainer}>
                    <Ionicons 
                        name={biometricType.includes('Face') ? 'md-scan-outline' : 'finger-print'} 
                        size={20} 
                        color="#444"
                    />
                    <Text style={styles.biometricsInfoText}>
                        {biometricType} login is available
                    </Text>
                </View>
            )}

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

                    {/* Biometric Login Button */}
                    <BiometricLoginButton 
                        onLoginSuccess={handleBiometricLoginSuccess} 
                        style={styles.biometricButton}
                    />
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
        borderRadius: moderateScale(45),
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
    },
    biometricButton: {
        marginTop: verticalScale(10),
        backgroundColor: '#444',
    },
    biometricsInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: moderateScale(10),
        paddingVertical: verticalScale(10),
        paddingHorizontal: horizontalScale(20),
        marginHorizontal: horizontalScale(20),
        marginTop: verticalScale(10),
    },
    biometricsInfoText: {
        marginLeft: horizontalScale(10),
        fontFamily: fonts.medium,
        fontSize: moderateScale(14),
        color: '#444',
    },
})