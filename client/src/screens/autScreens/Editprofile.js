import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert} from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { globalStyles, fonts } from "../../global/styles/theme";
import { horizontalScale, verticalScale, moderateScale } from "../../theme/Metrics";
import Ionicons from '@expo/vector-icons/Ionicons';
import '../../../assets/ima/profile_ima.png'



export default function EditProfile () {
    const defaultProfileImage = require('../../../assets/ima/profile_ima.png');
    const [profileImage, setProfileImage] = useState(defaultProfileImage)
    const [displayName, setDisplayName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('')
    const [Birthday, setBirthday] = useState('')
    const [address, setAddress] = useState('')
    const [imageUri, setImageUri] = useState(null);



    const pickImage = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                includeBase64: false,
                selectionLimit: 1,
                maxWidth: 2000,
                maxHeight: 2000,
                quality: 1,
            });

            if (result.didCancel) {
                console.log('User cancelled image picker');
                return;
            } else if (result.errorCode) {
                console.log('ImagePicker Error: ', result.errorMessage);
                Alert.alert('Error', result.errorMessage);
                return;
            }

            const selectedImage = result.assets[0];
            setProfileImage({ uri: selectedImage.uri });
            setImageUri(selectedImage.uri);
            
            // Upload to Firebase
            await uploadImageToFirebase(selectedImage.uri);
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick an image');
        }
    };

    const uploadImageToFirebase = async (uri) => {
        try {
            // Convert URI to blob
            const response = await fetch(uri);
            const blob = await response.blob();
            
            // Get current user
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (!user) {
                Alert.alert('Please log in to upload a profile picture');
                return;
            }
            
            // Create a reference to firebase storage
            const storage = getStorage();
            const storageRef = ref(storage, `profileImages/${user.uid}/profile.jpg`);
            
            // Upload image
            const snapshot = await uploadBytes(storageRef, blob);
            
            // Get download URL
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            // Update Firestore user document with image URL
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                profilePictureUrl: downloadURL
            });
            
            Alert.alert('Profile Picture Updated Successfully');
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Failed to upload image', error.message);
        }
    };


   

    

    return (

        
        <View style={globalStyles.container}>

            <View style={styles.BackContainer}>
                <TouchableOpacity style={styles.BackButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <KeyboardAwareScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.headerContainer}>
                <Text style={globalStyles.textBold}>Setup your Profile</Text>
                <View style={styles.ImageContainer}>
                    <Image source={profileImage} style={styles.Image} />
                    <TouchableOpacity style={styles.EditPhoto} onPress={pickImage} >
                        <Text style={styles.EditPhotoText}>Edit Photo</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.detailsContainer}>
                    <Text style={styles.formText}>Display Name</Text>
                    <TextInput
                            placeholder="Jon Doe"
                            style={styles.formInput}
                            value={displayName}
                            onChangeText={setDisplayName}
                    />
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.formText}>Phone Number</Text>
                    <TextInput
                            placeholder="+234   |"
                            style={styles.formInput}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                        />
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.formText}>Birthday</Text>
                    <TextInput
                            placeholder="DD-MM-YY"
                            style={styles.formInput}
                            value={Birthday}
                            onChangeText={setBirthday}
                    />
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.formText}>Address</Text>
                    <TextInput
                            style={styles.addressInput}
                            value={address}
                            onChangeText={setAddress}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.updateButton}>
                        <Text style={styles.buttonText}>Update Profile</Text>
                    </TouchableOpacity>
                </View>


            </View>
            </KeyboardAwareScrollView>
        </View>
    )
}

const styles = StyleSheet.create({

    
    BackContainer: {
        // borderWidth:1,
        marginTop:verticalScale(40),
        
        alignSelf:"flex-start",
        backgroundColor:"#D9D9D914",  
        // position: "absolute"
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

    headerContainer: {
        flexDirection:"column",
        justifyContent:"center",
        // borderWidth:1,
        marginTop: verticalScale(10),
        textAlign: "center",
        alignSelf:"center",
        alignContent:"center"
        // flex:1
    },
    ImageContainer:{
        // borderWidth:1,
        marginTop: verticalScale(30),
        alignSelf:"center"
    },
    Image:{
        height: verticalScale(100),
        width:horizontalScale(100), 
        borderRadius: moderateScale(100)
    },
    EditPhoto: {
        marginTop: verticalScale(10)
    },
    EditPhotoText:{
        textAlign: "center",
        fontSize: moderateScale(16),
        fontWeight:"700",
        fontFamily:fonts.extendedBold,
        color: '#A5A5A5'
    },
    formContainer: {
        // borderWidth:1,
        marginVertical: verticalScale(10),
    },
    detailsContainer: {
        marginVertical: verticalScale(10)
    },
    formText: {
        fontFamily: fonts.bold,
        fontWeight: "700",
        fontSize: moderateScale(16)
    },
    formInput: {
        borderWidth:1,
        marginTop: verticalScale(10),
        height: verticalScale(50),
        borderRadius:17,
        padding: 12,
        borderColor:  '#A5A5A5',
        fontSize: moderateScale(16),
        fontFamily: fonts.regular,  
    },
    addressInput: {
        height: verticalScale(80),
        marginTop: verticalScale(10),
        borderWidth:1,
        borderColor:  '#A5A5A5',
        borderRadius:17,
    },
    buttonContainer:{
        marginVertical: verticalScale(25),
    },
    updateButton:{
        backgroundColor:"#000",
        height: verticalScale(50),
        borderRadius: moderateScale(15),
        justifyContent: "center",
    },
    buttonText:{
        color:"#fff",
        textAlign: "center",
        fontFamily: fonts.bold,
        fontWeight:"700",
        fontSize: moderateScale(16)
    }

})