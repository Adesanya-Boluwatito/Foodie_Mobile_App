import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a Context
export const PaymentContext = createContext();

// Create a Provider component
export const PaymentProvider = ({ children }) => {
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load payment options from AsyncStorage when the app starts
    const loadPaymentOptions = async () => {
      try {
        const savedOptions = await AsyncStorage.getItem('paymentOptions');
        if (savedOptions) {
          setPaymentOptions(JSON.parse(savedOptions));
        }
      } catch (error) {
        console.error("Failed to load payment options:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadPaymentOptions();
  }, []);

  const updatePaymentOptions = async (newOptions) => {
    try {
      setPaymentOptions(newOptions);
      await AsyncStorage.setItem('paymentOptions', JSON.stringify(newOptions));
    } catch (error) {
      console.error("Failed to update payment options:", error);
    }
  };

  return (
    <PaymentContext.Provider value={{ paymentOptions, setPaymentOptions: updatePaymentOptions, isInitialized }}>
      {children}
    </PaymentContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const usePayment = () => useContext(PaymentContext);
