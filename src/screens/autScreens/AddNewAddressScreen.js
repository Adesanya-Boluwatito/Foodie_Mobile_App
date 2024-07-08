import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { auth,db} from '../../../firebaseconfi';
import {addDoc, collection } from "firebase/firestore"


const AddNewAddressScreen = ({ navigation }) => {

    const [addressType, setAddressType] = useState('')
    const [addressDetails, setAddressDetails] = useState('')
    const [state, setState] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async () => {
        const currentUser = auth.currentUser;

        if(currentUser) {
            const uid = currentUser.uid;

            try {

                setIsLoading(true);
                const docRef =  await addDoc(collection(db, `addresses/${uid}/userAddresses`), {
                
                type: addressType,
                details: addressDetails,
                state: state
                })
                
                console.log("Address saved successfully!", docRef.id);
                setIsLoading(false)
                navigation.goBack();

               }catch (error) {
                 console.error('Error saving Address: ', error);
               }
        }else {
           console.error("No user is signed In")
        }
    }

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4D4D" />
        </View>
      );
    }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Address</Text>
      <TextInput style={styles.input} placeholder="Address Type" value={addressType} onChangeText={setAddressType} />
      <TextInput style={styles.input} placeholder="Address Details" value={addressDetails} onChangeText={setAddressDetails} />
      <TextInput style={styles.input} placeholder="State" value={state} onChangeText={setState} />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>SAVE</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#FF3D00',
    paddingVertical: 16,
    borderRadius: 8,
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
