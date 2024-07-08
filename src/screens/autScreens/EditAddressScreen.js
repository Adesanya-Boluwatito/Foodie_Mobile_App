import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const EditAddressScreen = ({ navigation, route }) => {
  const { addressType, addressDetails, country } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Address</Text>
      <TextInput style={styles.input} placeholder="Address Type" defaultValue={addressType} />
      <TextInput style={styles.input} placeholder="Address Details" defaultValue={addressDetails} />
      <TextInput style={styles.input} placeholder="Country" defaultValue={country} />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          // Logic to save the edited address
          navigation.goBack();
        }}
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
});

export default EditAddressScreen;
