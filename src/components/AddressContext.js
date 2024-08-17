import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a Context
export const AddressContext = createContext();

// Create a Provider component
export const AddressProvider = ({ children }) => {
  const [defaultAddress, setDefaultAddress] = useState(null);


  useEffect(() => {
    // Load the default address from AsyncStorage when the app starts
    const loadDefaultAddress = async () => {
      try {
        const savedDefault = await AsyncStorage.getItem('defaultAddress');
        if (savedDefault) {
          setDefaultAddress(JSON.parse(savedDefault));
        }
      } catch (error) {
        console.error("Failed to load default address:", error);
      }
    };

    loadDefaultAddress();
  }, []);

  const updateDefaultAddress = (newDefault) => {
    setDefaultAddress(newDefault);
    AsyncStorage.setItem('defaultAddress', JSON.stringify(newDefault));
  };

  return (
    <AddressContext.Provider value={{ defaultAddress, setDefaultAddress:updateDefaultAddress }}>
      {children}
    </AddressContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useAddress = () => useContext(AddressContext);
