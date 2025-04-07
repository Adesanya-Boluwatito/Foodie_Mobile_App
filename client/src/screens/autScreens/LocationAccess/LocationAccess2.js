import React, { useState, useEffect } from 'react';
import  {View, Text, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import { globalStyles, fonts } from '../../../global/styles/theme';
import { verticalScale, horizontalScale, moderateScale } from '../../../theme/Metrics';
import Ionicons from '@expo/vector-icons/Ionicons';


export default function EnterManually () {


    return (
        <View style={globalStyles.container}>
            <View style={styles.BackContainer}>
                <TouchableOpacity style={styles.BackButton}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <View style={styles.header}>
                <Text style={styles.title}>Search for Location</Text>

                <View >
                <TextInput
                    placeholder="Search"
                    style={styles.inputField}
                />
                </View>
            </View>

            <View>
                
            </View>
            
        </View>
    )
}

const styles = StyleSheet.create({

    BackContainer: {
        // borderWidth:1,
        marginTop:verticalScale(40),
        alignSelf:"flex-start",
        backgroundColor:"#D9D9D914",
        
        
    },
    BackButton: {
        borderColor: "#A5A5A5",
        // backgroundColor:"#D9D9D914",
        borderWidth:1,
        alignItems:"center",
        justifyContent:"center",
        borderRadius: moderateScale(6.4),
        width: horizontalScale(32),
        height: verticalScale(32)

    },
    header: {
        // borderWidth:1,
        marginTop: verticalScale(25),
    },
    title: {
        fontFamily: fonts.extendedBold,
        fontWeight:"700",
        fontSize: moderateScale(24),
    },
    searchContainer: {
        // borderWidth:1,
    },
    inputField: {
        borderWidth:1,
        marginTop: verticalScale(10),
        height: verticalScale(50),
        borderRadius:moderateScale(16),
        padding: 12,
        borderColor:  '#A5A5A5',
        fontSize: moderateScale(16),
        fontFamily: fonts.regular,   
        
    },

})