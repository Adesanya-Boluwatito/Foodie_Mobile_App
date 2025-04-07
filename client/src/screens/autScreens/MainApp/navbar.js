import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons

const BottomNavbar = () => {
  const navigation = useNavigation();

  // Define navigation items with icons and routes
  const navItems = [
    {
      name: 'Home',
      icon: 'home-outline',
      route: 'HomeScreen'
    },
    {
      name: 'Explore',
      icon: 'search-outline',
      route: 'Explore'
    },
    {
      name: 'Cart',
      icon: 'cart-outline',
      route: 'Cart'
    },
    {
      name: 'Profile',
      icon: 'person-outline',
      route: 'Profile'
    }
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.navItem}
          onPress={() => navigation.navigate(item.route)}
        >
          <Ionicons 
            name={item.icon} 
            size={24} 
            color="#bf0603" // Customize color as needed
          />
          <Text style={styles.navText}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#bf0603',
    marginTop: 5
  }
});

export default BottomNavbar;