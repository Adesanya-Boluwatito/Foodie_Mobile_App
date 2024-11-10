import React from "react";
import{View, Text, StyleSheet, Image,TouchableOpacity} from 'react-native';
import { globalStyles, fonts } from "../../../global/styles/theme";
import { verticalScale, horizontalScale, moderateScale } from "../../../theme/Metrics";



export default function OnBoardingScreen_2 () {



    return (
        <View style={globalStyles.container}>
            <View style={styles.skipContainer}>
                <TouchableOpacity>
                    <Text style={styles.Skiptext}>Skip</Text>
                </TouchableOpacity>
                
            </View>
            <View style={styles.imageContainer}>
                <Image source={require('../../../../assets/ima/Image3.png')} style={styles.image} />
            </View>

            <View style={styles.textdesignContainer}>
                <Text style={styles.textdesign}>Neque porro quisquam est qui dolorem ipsum quia dolor sit amet</Text>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressDotOutlined} />
                <View style={styles.progressDotOutlined} />
                <View style={styles.progressDotFilled} />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </View>
                
        </View>
    )
}

const styles = StyleSheet.create({
    skipContainer:{
        flex:1,
        flexDirection: "row-reverse",
        // borderWidth:1,
    },
    Skiptext:{
        fontFamily: fonts.bold,
        fontSize: moderateScale(18),
        fontWeight: "700",
        marginTop: verticalScale(30),
    },
    imageContainer: {
        alignSelf:"center",
        alignContent:"center",
        // borderWidth:1,
        marginTop: verticalScale(200)
    },
    image: {
        // borderWidth:1,
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
    buttonContainer: {
        // borderWidth: 1,
        marginTop:verticalScale(50),
        alignContent:"center",
    },
    button:{
        backgroundColor:"black",
        // marginVertical: verticalScale(10),
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