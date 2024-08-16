import React, { createContext, useContext, useState } from 'react';

// Create a Context
const AddressContext = createContext();

// Create a Provider component
export const AddressProvider = ({ children }) => {
  const [defaultAddress, setDefaultAddress] = useState(null);

  return (
    <AddressContext.Provider value={{ defaultAddress, setDefaultAddress }}>
      {children}
    </AddressContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useAddress = () => useContext(AddressContext);
