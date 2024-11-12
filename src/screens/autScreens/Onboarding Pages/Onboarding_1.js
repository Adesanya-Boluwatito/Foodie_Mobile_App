import React, {useEffect} from "react";
import{View, Text, StyleSheet, Image,TouchableOpacity, Animated, Dimensions} from 'react-native';
import { globalStyles, fonts } from "../../../global/styles/theme";
import { verticalScale, horizontalScale, moderateScale } from "../../../theme/Metrics";
import { useNavigation } from '@react-navigation/native';
import { useAnimation } from '../../../components/AnimationContext';



export default function OnBoardingScreen_1 () {

    const navigation = useNavigation()
    
    const { slideAnim, fadeAnim, scaleAnim, animateTransition, resetAnimation, navigateTo } = useAnimation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', resetAnimation);
        return unsubscribe;
    }, [navigation]);

    const handleSkip = () => {
        navigateTo('Login'); // Or wherever skip should go
        };
    

    const handleNextPage = () => {
        navigateTo('Onboarding2');
        
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

            <View style={styles.skipContainer}>
                <TouchableOpacity onPress={handleSkip}>
                <Animated.Text style={[styles.skipText, { opacity: fadeAnim }]}>
                        Skip
                    </Animated.Text>
                </TouchableOpacity>
                
            </View>
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
                <Image source={require('../../../../assets/ima/Image1.png')} style={styles.image} />
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
                    <View style={styles.progressDotOutlined} />
                    <View style={styles.progressDotOutlined} />
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
                <TouchableOpacity style={styles.button} onPress={handleNextPage} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </Animated.View>
                
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    skipContainer:{
        flex:1,
        flexDirection: "row-reverse",
        // borderWidth:1,
    },
    skipText:{
        fontFamily: fonts.bold,
        fontSize: moderateScale(18),
        fontWeight: "700",
        marginTop: verticalScale(30),
    },
    imageContainer: {
        flex:2,
        alignSelf:"center",
        alignContent:"center",
        // borderWidth:1,
        
    },
    image: {
        borderWidth:1,
        width: horizontalScale(342),
        height: verticalScale(300)
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
    progressDotSquare: {
        width: moderateScale(8),
        height: moderateScale(8),
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