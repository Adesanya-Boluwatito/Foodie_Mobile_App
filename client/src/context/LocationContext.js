// Create a new file: contexts/LocationContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getLocationData, saveLocationData } from '../../utils/LocationStorage';

// Create the context
const LocationContext = createContext();

// Create a provider component
export function LocationProvider({ children }) {
  const [locationData, setLocationData] = useState({
    location: null,
    readableLocation: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load location data from AsyncStorage on component mount
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const savedLocationData = await getLocationData();
        if (savedLocationData?.location || savedLocationData?.readableLocation) {
          console.log('Loaded location data from storage:', savedLocationData);
          setLocationData(savedLocationData);
        }
      } catch (error) {
        console.error('Error loading location data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocationData();
  }, []);

  // Custom setter that updates both state and AsyncStorage
  const updateLocationData = async (newLocationData) => {
    setLocationData(newLocationData);
    await saveLocationData(newLocationData);
  };

  return (
    <LocationContext.Provider value={{ 
      locationData, 
      setLocationData: updateLocationData,
      isLoading 
    }}>
      {children}
    </LocationContext.Provider>
  );
}

// Create a custom hook to use the context
export function useLocation() {
  return useContext(LocationContext);
}