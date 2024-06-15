import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const ManageAddressScreen = () => {
  return (
    <View style={styles.container}>
      {/*  */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.addressContainer}>
          <FontAwesome name="home" size={24} color="gray" />
          <View style={styles.addressTextContainer}>
            <Text style={styles.addressType}>Home</Text>
            <Text style={styles.addressDetails}>43-D San Francisco, near Church</Text>
            <Text style={styles.addressDetails}>USA</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.buttonText}>EDIT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton}>
              <Text style={styles.buttonText}>DELETE</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.addressContainer}>
          <FontAwesome name="briefcase" size={24} color="gray" />
          <View style={styles.addressTextContainer}>
            <Text style={styles.addressType}>Work</Text>
            <Text style={styles.addressDetails}>Lorem Ipsum location</Text>
            <Text style={styles.addressDetails}>USA</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.buttonText}>EDIT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton}>
              <Text style={styles.buttonText}>DELETE</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>ADD NEW</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContainer: {
    padding: 16,
  },
  addressContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  addressTextContainer: {
    marginLeft: 8,
    marginBottom: 8,
  },
  addressType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressDetails: {
    color: 'gray',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#FF3D00',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#FF3D00',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FF3D00',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#FF3D00',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ManageAddressScreen;
