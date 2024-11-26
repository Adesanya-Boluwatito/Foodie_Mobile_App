import React, {useState, useRef, useEffect} from 'react'
import {View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator} from 'react-native'
import { globalStyles, fonts } from '../../../global/styles/theme'
import { horizontalScale, verticalScale, moderateScale } from '../../../theme/Metrics'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { ALERT_TYPE, AlertNotificationRoot, Toast } from "react-native-alert-notification";
import axios from 'axios'

export default function OTP({route}) {
    const [loading, setLoading] = useState(false)
    const { email = '' } = route.params
    const [otp, setOtp] = useState(['', '', '', ''])
    const [countdown, setCountdown] = useState(300); // 300 seconds for 5 minutes
    const [showResend, setShowResend] = useState(false);
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];


    useEffect(() => {
        // Start countdown timer
        if (countdown > 0) {
            const timerId = setInterval(() => {
                setCountdown((prevCount) => prevCount - 1);
            }, 1000);

            return () => clearInterval(timerId);
        } else {
            setShowResend(true); // Show Resend OTP when countdown reaches zero
        }
    }, [countdown]);

    const verifyOTP = (otpString) => {
        setLoading(true)
        axios.post('http://10.100.180.38:3000/otp/verify-otp', { email, otp: otpString })
        .then(response => {
            console.log(response.data.message);
            setLoading(false);
        })
        
        .catch(error => {
            console.error(error);
            setLoading(false);
        })
    }

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    

    const handleChange = (index, value) => {
        // Immediate return if value is empty or not numeric
        if (value !== '' && !/^\d+$/.test(value)) {
            return;
        }

        // Handle pasting of full OTP
        if (value.length > 1) {
            const otpArray = value.slice(0, 4).split('');
            const newOtp = [...otpArray, ...Array(4 - otpArray.length).fill('')];
            
            // Update state directly
            setOtp(newOtp);
            
            // Focus the last filled input
            const lastFilledIndex = Math.min(otpArray.length - 1, 3);
            inputRefs[lastFilledIndex].current?.focus();
            return;
        }

        // Handle single digit input
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move focus to next input if value is entered
        if (value !== '' && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace') {
            // If current input is empty and we're not at the first input
            if (!otp[index] && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs[index - 1].current?.focus();
            } else {
                // Clear current input
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };

    const resendOtp = () => {
        axios.post('http://192.168.82.176:3000/otp/send-otp', { email })
        .then(response => console.log(response.data.message))
        .catch(error => console.error(error));

        // Reset the countdown timer and hide Resend button
        setCountdown(300);
        setShowResend(false);

    }

    const handleSubmit = () => {
        const otpString = otp.join('');
        if (otpString.length === 4) {
            console.log("Entered OTP: ", otpString);
            console.log("Email: ", email);
            verifyOTP(otpString);
        } else {
            // Handle case where OTP is not fully entered (optional)
            console.log('Please enter the full OTP');
        }
    };

    return (
        <KeyboardAwareScrollView style={globalStyles.container}>
            <View style={styles.header}>
                <Text style={globalStyles.textBold}>OTP VERIFICATION</Text>
                <Text style={[globalStyles.textRegular, styles.otpText]}>
                    Hey, We sent an OTP to your mail, kindly fill it to get verified
                </Text>
            </View>

            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={inputRefs[index]}
                        style={[
                            styles.otpInput,
                            digit && styles.otpInputFilled,
                            {
                                borderColor: digit ? '#000' : '#ccc'
                            }
                        ]}
                        keyboardType="numeric"
                        maxLength={4}  // Changed from 4 to 1 to prevent multiple inputs
                        value={digit}
                        onChangeText={(value) => handleChange(index, value)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        autoComplete="sms-otp"
                        textContentType="oneTimeCode"
                        selectTextOnFocus
                    />
                ))}
            </View>
                
            <View style={styles.resendOtpContainer}>
                <Text style={globalStyles.textRegular}>Didn't recieve Otp?</Text>
                {showResend ? (
                    <TouchableOpacity style={styles.ResendButton} onPress={resendOtp}>
                        <Text style={styles.resendOtpText}>Resend OTP</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.timerText}>{formatTime(countdown)}</Text>
                )}
            </View>

            <View style={styles.verifyButtonContainer}>
                <TouchableOpacity  style={styles.verifybutton} onPress={handleSubmit} >
                           {loading ? <ActivityIndicator size="small" color="#fff"/> : <Text style={styles.VerifyText}>Verify</Text>} 
                </TouchableOpacity>  
            </View>

        </KeyboardAwareScrollView>
    )
}

const styles = StyleSheet.create({
    header: {
        flex:1, 
        flexDirection: "column",
        marginTop: verticalScale(100),
        marginBottom: verticalScale(29),
        alignItems:"center",
        alignSelf:'center',
        alignContent:'center',
    },
    otpText: {
        color: "grey",
        paddingTop:verticalScale(30),
        textAlign:"center",
    },
    otpContainer: {
        flex:4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: verticalScale(20),
        marginTop: verticalScale(50),
        alignSelf:"center",
        
    },
    otpInput: {
        width: horizontalScale(56),
        height: verticalScale(60),
        borderWidth: 2,
        borderColor: "#ccc",
        borderRadius: 8,
        fontSize: moderateScale(20),
        fontFamily: fonts.number,
        textAlign: 'center',
    },
    otpInputFilled: {
        borderColor: '#000',
    },
    resendOtpContainer: {
        flexDirection:"row",
        alignSelf:"center",
        marginTop: verticalScale(30),
        textAlign: "center",
    },

    resendOtpText: {
        font: fonts.bold,
        fontSize:moderateScale(16),
        fontWeight:"700",
        paddingHorizontal: horizontalScale(3)
        
    },
    timerText: {
        font: fonts.bold,
        fontSize:moderateScale(16),
        fontWeight: 'bold',
        color: 'grey',
        paddingHorizontal: horizontalScale(3)
    },

    verifyButtonContainer: {
        marginTop: verticalScale(20),
    
    },

    verifybutton: {
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 15,
        width: '80%',
        alignItems: 'center',
        alignSelf:"center"
    },
    VerifyText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
})