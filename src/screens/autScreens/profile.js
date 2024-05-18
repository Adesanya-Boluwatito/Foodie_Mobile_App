import React from "react"; 
import { Text, View,StyleSheet, TouchableOpacity, Image } from "react-native"; 
import { Ionicons } from "@expo/vector-icons"; 




const options = [
    { label: 'My Orders', icon: 'list-circle' },
    { label: 'Manage Addresses', icon: 'home' },
    { label: 'Payments', icon: 'card' },
    { label: 'Favourites', icon: 'star' },
    { label: 'Help', icon: 'help-circle-sharp' },
    { label: 'Logout', icon: 'log-out' },
  ];

export default function User() { 
return ( 
	<View style={styles.container}>

        <View>
        <View style={styles.profileSection}>
        <Image
            source={{ uri: 'https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg' }} // Replace with the URL of the profile picture
            style={styles.profileImage}
          />
          <Text style={styles.name}>Lorem Ipsum</Text>
          <Text style={styles.contact}>0000000000 • loremipsum@email.com</Text>
          <TouchableOpacity>
            <Text style={styles.edit}>EDIT</Text>
          </TouchableOpacity>
        </View>
        </View>

        <View style={styles.optionsSection}>
          {options.map((option, index) => (
            <TouchableOpacity key={index} style={styles.option}>
              <Ionicons name={option.icon} size={24} color="#000" style={styles.icon} />
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>






    </View> 
); 
}; 

 const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'#fffbf8',
        paddingHorizontal: 16,
        paddingTop: 50,

    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 20,
      },
      profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
      },
      name: {
        fontSize: 24,
        fontWeight: 'bold',
      },
      contact: {
        fontSize: 14,
        color: '#888',
      },
      edit: {
        fontSize: 14,
        color: 'red',
        marginTop: 8,
      },
      optionsSection: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
      },
      option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
      },
      icon: {
        marginRight: 16,
      },
      optionText: {
        fontSize: 16,
      },
 })
