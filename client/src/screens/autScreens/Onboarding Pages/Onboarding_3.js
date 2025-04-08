import React, {useEffect} from "react";
import{View, Text, StyleSheet, Image,TouchableOpacity, Animated, Dimensions} from 'react-native';
import { globalStyles, fonts } from "../../../global/styles/theme";
import { verticalScale, horizontalScale, moderateScale } from "../../../theme/Metrics";
import { useNavigation } from '@react-navigation/native';
import { useAnimation } from '../../../components/AnimationContext';
import DisableBackAction from "../../../components/DisableBackActionContext";
import { setOnboardingCompleted } from "../../../../utils/onboradingStatus";



export default function OnBoardingScreen_3 () {

    const navigation = useNavigation()
    const { slideAnim, fadeAnim, scaleAnim, animateTransition, resetAnimation } = useAnimation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', resetAnimation);
        return unsubscribe;
    }, [navigation]);

    

    const handleNextPage = async () => {
        // Mark onboarding as completed
        await setOnboardingCompleted();
        console.log("Onboarding marked as completed");
        
        animateTransition('next', () => {
            navigation.navigate('Login');
        });
    };

    return (
        <Animated.View 
            style={[
                globalStyles.container,
                {
                    transform: [
                        { translateX: slideAnim },
                        { scale: scaleAnim }
                    ],
                    opacity: fadeAnim
                }
            ]}
        >
            
            <Animated.View style={[
                    styles.imageContainer,
                    {
                        transform: [{
                            scale: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1]
                            })
                        }]
                    }
                ]}
            >
                <Image source={require('../../../../assets/ima/Image3.png')} style={styles.image} />
            </Animated.View>

            <Animated.View 
                style={[
                    styles.textdesignContainer,
                    {
                        transform: [{
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0]
                            })
                        }]
                    }
                ]}
            >
                <Text style={styles.textdesign}>Neque porro quisquam est qui dolorem ipsum quia dolor sit amet</Text>
            </Animated.View>

            <View style={styles.progressContainer}>
                <View style={styles.progressDotOutlined} />
                <View style={styles.progressDotOutlined} />
                <Animated.View 
                        style={[
                            styles.progressDotFilled,
                            {
                                transform: [{
                                    scale: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.5, 1]
                                    })
                                }]
                            }
                        ]} 
                    />
            </View>

            <Animated.View 
                style={[
                    styles.buttonContainer,
                    {
                        transform: [{
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0]
                            })
                        }]
                    }
                ]}
            >
                <TouchableOpacity style={styles.button} onPress={handleNextPage}>
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </Animated.View>
            <DisableBackAction/>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    
    imageContainer: {
        flex:1,
        alignSelf:"center",
        alignContent:"center",
        // borderWidth:1,
        paddingTop: verticalScale(200)
        
    },
    image: {
        // borderWidth:1,
        width: horizontalScale(342),
        height: verticalScale(300),
        resize:"contain"
    },
    textdesignContainer: {
        // borderWidth: 1,
        alignContent:"center",
        alignItems:"center",
        marginTop: verticalScale(50)

    },
    textdesign: {
        fontFamily: fonts.bold,
        fontSize: moderateScale(18),
        textAlign:"center",
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(60),
        gap: horizontalScale(8)
    },
    progressDotFilled: {
        width: moderateScale(40),
        height: moderateScale(12),
        borderRadius: moderateScale(16),
        backgroundColor: '#000', // Adjust color as needed
    },
    progressDotOutlined: {
        width: moderateScale(12),
        height: moderateScale(12),
        borderRadius: moderateScale(16),
        borderWidth: 1,
        borderColor: '#000', // Adjust color as needed
    },
    buttonContainer: {
        // borderWidth: 1,
        marginTop:verticalScale(50),
        alignContent:"center",
    },
    button:{
        backgroundColor:"black",
        marginVertical: verticalScale(10),
        padding: moderateScale(14),
        borderRadius: moderateScale(15)
    }, 
    buttonText:{
        color:"white",
        fontFamily: fonts.bold,
        fontWeight: "700",
        fontSize: moderateScale(16),
        textAlign:"center", 
    }
})