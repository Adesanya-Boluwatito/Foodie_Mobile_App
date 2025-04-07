 // Create a new file: contexts/LocationContext.js
import React, { createContext, useState, useContext } from 'react';

// Create the context
const LocationContext = createContext();

// Create a provider component
export function LocationProvider({ children }) {
  const [locationData, setLocationData] = useState({
    location: null,
    readableLocation: null
  });

  return (
    <LocationContext.Provider value={{ locationData, setLocationData }}>
      {children}
    </LocationContext.Provider>
  );
}

// Create a custom hook to use the context
export function useLocation() {
  return useContext(LocationContext);
}