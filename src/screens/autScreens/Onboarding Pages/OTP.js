import React, {useState, useRef} from 'react'
import {View, Text, StyleSheet, TextInput, TouchableOpacity} from 'react-native'
import { globalStyles, fonts } from '../../../global/styles/theme'
import { horizontalScale, verticalScale, moderateScale } from '../../../theme/Metrics'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default function OTP() {
    const [loading, setLoading] = useState(false)
    const [otp, setOtp] = useState(['', '', '', ''])
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

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

    const handleSubmit = () => {
        const otpString = otp.join('');
        if (otpString.length === 4) {
            console.log("Entered OTP: ", otpString);
            // Add your verification logic here
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
                <TouchableOpacity style={styles.ResendButton} >
                    <Text style={styles.resendOtpText}> Resend OTP</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.verifyButtonContainer}>
                <TouchableOpacity  style={styles.verifybutton} >
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
        marginTop: verticalScale(25),
    },

    resendOtpText: {
        font: fonts.bold,
        fontSize:moderateScale(16),
        fontWeight:"700"
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