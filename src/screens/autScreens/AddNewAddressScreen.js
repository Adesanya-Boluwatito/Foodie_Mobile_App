import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingScrollView } from 'react-native';
import { horizontalScale, verticalScale, moderateScale } from "../../theme/Metrics";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { globalStyles, fonts } from '../../global/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { auth,db} from '../../../firebaseconfi';
import {addDoc, collection } from "firebase/firestore"


const AddNewAddressScreen = ({ navigation }) => {

    const [addressType, setAddressType] = useState('Home')
    const [streetName, setStreetName] = useState('')
    const [houseNumber, setHouseNumber] = useState('')
    const [ApartmentName, setApartmentName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('');
    const [Landmark, setLandmark] = useState('')
    const [isLoading, setIsLoading] = useState(false)


    useEffect(() => {
      console.log('Current selected address type:', addressType);
  }, [addressType]);


    const handleAddressTypeSelect = (type) => {
      setAddressType(type);
    }

    const handleSave = async () => {
        const currentUser = auth.currentUser;

        if (!addressType || !streetName || !houseNumber || !ApartmentName || !Landmark || !phoneNumber) {
          alert('Please fill in all fields');
          return;
      }

        if(currentUser) {
            const uid = currentUser.uid;

            try {

                setIsLoading(true);
                const docRef =  await addDoc(collection(db, `addresses/${uid}/userAddresses`), {
                
                  type: addressType,
                  streetName: streetName,
                  houseNumber: houseNumber,
                  apartmentName: ApartmentName,
                  landmark: Landmark,
                  phoneNumber: phoneNumber,
                })
                
                console.log("Address saved successfully!", docRef.id);
                setIsLoading(false)
                navigation.goBack();

               }catch (error) {
                 console.error('Error saving Address: ', error);
                 setIsLoading(false);
                 alert('Failed to save address');
               }
        }else {
           console.error("No user is signed In")
           alert('Please sign in to save address');
        }
    }

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      );
    }

  return (
    <KeyboardAwareScrollView>

    
    <View style={globalStyles.container}>
      <View style={styles.BackContainer}>
          <TouchableOpacity style={styles.BackButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={globalStyles.textBold}>Add Address Details</Text>
      </View>
      
      <View style={styles.formContainer}>
        <View  style={styles.detailsContainer}>
          <Text style={styles.formFont}>House/Flat Number</Text>
                <TextInput
                  placeholder="NO.14"
                  style={styles.inputField}
                  value={houseNumber}
                  onChangeText={setHouseNumber}
               />
        </View>
        <View style={styles.detailsContainer}>
        <Text style={styles.formFont}>Apartment Name</Text>
                <TextInput
                  placeholder="Sunshine Hall"
                  style={styles.inputField}
                  value={ApartmentName}
                  onChangeText={setApartmentName}
               />

        </View>
        <View style={styles.detailsContainer}>
        <Text style={styles.formFont}>Street Name</Text>
                <TextInput
                  placeholder="Falilat-Ajoke Street"
                  style={styles.inputField}
                  value={streetName}
                  onChangeText={setStreetName}
               />
        </View>
        <View style={styles.detailsContainer}>
        <Text style={styles.formFont}>Nearest Landmark</Text>
                <TextInput
                  placeholder="Conference Hotel"
                  style={styles.inputField}
                  value={Landmark}
                  onChangeText={setLandmark}
               />
        </View>
        <View style={styles.detailsContainer}>
        <Text style={styles.formFont}>Phone Number</Text>
                <TextInput
                  placeholder="+234 | 9039203920"
                  style={styles.inputField}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
               />
        </View>
      </View>

      <View style={styles.addressTypeContainer}>
        <Text style={styles.addressType}>Address type</Text>
        <View style={styles.selectionsContainer}>
            <TouchableOpacity style={[styles.selectionButton, addressType=='Home' && styles.activeSelectionButton]} onPress={() => handleAddressTypeSelect('Home')}>
              <Text style={[styles.selectionText, addressType=='Home' && styles.activeSelectionText]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.selectionButton, addressType ==="Office" && styles.activeSelectionButton]} onPress={() => handleAddressTypeSelect('Office')}>
              <Text style={[styles.selectionText, addressType ==="Office" && styles.activeSelectionText]}>Office</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.selectionButton, addressType ==="Other" && styles.activeSelectionButton]} onPress={() => handleAddressTypeSelect('Other')}>
              <Text style={[styles.selectionText, addressType ==="Other" && styles.activeSelectionText]}>Other</Text>
            </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Add Address</Text>
      </TouchableOpacity>
      </View>
      
    </View>

    </KeyboardAwareScrollView>
  );
};

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
  alignContent:"center",
  justifyContent:"center",
  marginVertical: verticalScale(25),
},
formContainer: {
  flex:1,
  // height: verticalScale(500)
  paddingBottom: verticalScale(20),
},
formFont: {
  fontFamily: fonts.bold,
  fontWeight: "700",
  fontSize: moderateScale(16),
},
detailsContainer: {
  marginVertical: verticalScale(9)
   
},
inputField: {
  borderWidth:1,
  marginTop: verticalScale(10),
  height: verticalScale(50),
  borderRadius:moderateScale(14),
  paddingHorizontal: horizontalScale(12),
  borderColor:  '#A5A5A5',
  fontSize: moderateScale(16),
  fontFamily: fonts.regular,   
  
},
addressTypeContainer: {
  flex:0.24,
  borderWildth:1,
},
addressType:{
  fontSize: moderateScale(16),
  fontFamily: fonts.extendedBold,
  fontWeight: "700"
},
selectionsContainer: {
  flexDirection:"row",
  marginTop: verticalScale(10),
  alignItems: "flex-start",

},
selectionButton: {
    // backgroundColor: "white",
    height: verticalScale(39),
    width: horizontalScale(76),
    borderRadius: moderateScale(8),
    justifyContent: "center",
    borderWidth: 1,
    marginRight:horizontalScale(12)
    
},
activeSelectionButton: {
  backgroundColor: 'black',
},
selectionText:{
  fontSize: moderateScale(14),
  fontFamily: fonts.regular,
  color:"#000",
  textAlign:"center",
},
activeSelectionText: {
  color: 'white',
  textAlign:"center",
  fontSize: moderateScale(14),
  fontFamily: fonts.regular,
},
buttonContainer: {
  // borderWidth: 1,
  //
  marginTop: verticalScale(19)
},

saveButton: {
  backgroundColor: '#000',
  paddingVertical: verticalScale(16),
  borderRadius: moderateScale(16),
  alignItems: 'center',
},
saveButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},
loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
});

export default AddNewAddressScreen;
