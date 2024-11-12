import React, {useState} from "react"
import {View, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Image} from "react-native";
import { globalStyles, fonts } from "../../../global/styles/theme";
import { verticalScale, horizontalScale, moderateScale } from "../../../theme/Metrics";


export default function LocationAccessScreen_1 () {

    const [loading, setLoading] = useState(false);
     
    return (
        <View style={globalStyles.container}>
            
            <View style={styles.imageContainer}>
                <Image source={require('../../../../assets/ima/Location.png')} style={styles.image} />
            </View>


            <View style={styles.GrantAccessContainer}>
                <Text style={styles.LocationText}>Grant Location Access</Text>
            </View>

            <View style={styles.InstructionContainer}>
                <Text style={styles.InstructionText}>Kindly click on one of the buttons below to select your location</Text>
            </View>
            
            <View style={styles.BlackbuttonContainer}>
                <TouchableOpacity  style={styles.Blackbutton} >
                           {loading ? <ActivityIndicator size="small" color="#fff"/> : <Text style={styles.BlackbuttonText}>Use Current Location</Text>} 
                </TouchableOpacity>  
            </View>

            <View style={styles.WhitebuttonContainer}>
                <TouchableOpacity style={styles.Whitebutton} onPress={() => console.log('Pressed')}>
                        <Text style={styles.WhitebuttonText}>Enter Manually</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}


const styles = StyleSheet.create ({

    imageContainer: {
        alignSelf:"center",
        alignContent:"center",
        // borderWidth:1,
        marginTop: verticalScale(150)
    },
    image: {
        width: horizontalScale(342),
        height: verticalScale(300)
    },

    GrantAccessContainer:{
        // borderWidth:1,
        alignSelf: "center",
        marginTop: verticalScale(40)
    },
    LocationText: {
        fontSize: moderateScale(20),
        fontFamily: fonts.extendedBold,
        fontWeight: "700",
        textAlign: "center"
    },
    InstructionContainer: {
        // borderWidth:1,
        alignSelf:"center",
        alignContent: "center",
        alignItems:"center",
        marginTop: moderateScale(15),

    },
    InstructionText: {
        textAlign: "center",
        fontFamily: fonts.regular,
        fontSize: moderateScale(16),
        fontWeight: "700",
        color:"#A5A5A5",
    },
    BlackbuttonContainer: {
        // borderWidth:1,
        alignContent:"center",
        alignItems:"center",
        alignSelf:"center",
        marginTop: verticalScale(60)
    },
    Blackbutton:{
        backgroundColor:"#000",
        width: moderateScale(280),
        height: moderateScale(50),
        borderRadius: moderateScale(10),
        justifyContent: "center"
    },
    BlackbuttonText: {
        color:"#fff",
        textAlign: "center",
        fontFamily: fonts.extendedBold,
        fontSize: moderateScale(16),
        fontWeight: "400"
    },
    WhitebuttonContainer: {
        alignContent:"center",
        alignItems:"center",
        alignSelf:"center",
        marginTop: verticalScale(20)
    },
    Whitebutton: {
        // backgroundColor:"#fff",
        borderWidth:1,
        width: moderateScale(280),
        height: moderateScale(50),
        borderRadius: moderateScale(10),
        justifyContent: "center"
    },
    WhitebuttonText: {
        color:"#000",
        textAlign: "center",
        fontFamily: fonts.extendedBold,
        fontSize: moderateScale(16),
        fontWeight: "400"
    }
    


})