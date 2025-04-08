import React, { useState, useEffect, useRef} from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { Ionicons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { ProfileIcon } from '../global/styles/icons/TabIcons';
import { globalStyles, fonts } from '../global/styles/theme';
import { horizontalScale, verticalScale, moderateScale } from '../theme/Metrics';
import { useLocation } from '../context/LocationContext';
import { getFormattedLocationName } from '../../utils/LocationStorage';

export default function CustomTabBarLayout({ route, navigation, children }) {
  const [address, setAddress] = useState('Set Location');
  const hideLocationBanner = route.params?.hideLocationBanner || false;
  const { locationData } = useLocation();
  const addressInitialized = useRef(false);

  // Load address from storage when component mounts
  useEffect(() => {
    const loadAddressFromStorage = async () => {
      if (!addressInitialized.current) {
        const storedAddress = await getFormattedLocationName();
        if (storedAddress !== 'Set Location') {
          console.log("Preloading address from storage:", storedAddress);
          setAddress(storedAddress);
          addressInitialized.current = true;
        }
      }
    };
    
    loadAddressFromStorage();
  }, []);

  useEffect(() => {
    console.log('CustomTabBarLayout mounted for screen:', route.name);
    console.log('Route params received:', route?.params);
    
    // First priority: Check route params
    if (route.params?.readableLocation) {
      console.log("Setting address from route params:", route.params.readableLocation);
      setAddress(route.params.readableLocation);
      addressInitialized.current = true;
    } 
    // Second priority: Check location context
    else if (locationData?.readableLocation && !addressInitialized.current) {
      console.log("Setting address from location context:", locationData.readableLocation);
      setAddress(locationData.readableLocation);
      addressInitialized.current = true;
    } else {
      console.log("No location found in params or context, keeping default:", address);
    }
  }, [route.params?.readableLocation, locationData?.readableLocation, route.name]);

  const handleLocationSearch = async () => {
      navigation.navigate("Map");
      console.log('Location Found');
  };

  const redirectSearchScreen = () => {
      navigation.navigate('AllRestaurants');
  };
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={[globalStyles.container, {paddingBottom:0}]}>
      {/* Top Container for Location */}
      {!hideLocationBanner && (
        <>
          <View style={styles.TopContainer}>
            <View style={styles.locationContainer}>
              <View style={styles.address}>
                <Text style={styles.HeadText}>Deliver Now</Text>
                <View style={styles.addressContainer}>
                  <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">{address}</Text>
                  <TouchableOpacity style={styles.emoji} onPress={handleLocationSearch}>
                    <Ionicons name="chevron-down" size={20} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View>
              <TouchableOpacity style={styles.ProfileIcon} onPress={() => navigation.navigate('User')}>
                <ProfileIcon size={32} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBarContainer} onPress={redirectSearchScreen}>
              <TextInput
                style={styles.searchBar}
                placeholder="Search restaurants, pharmacy, farmers market..."
                onPress={redirectSearchScreen}
              />
              <View style={styles.searchIcon}>
                <AntDesign name="search1" size={24} color="black" />
              </View>
            </View>
          </View>
        </>
      )}

      {/* Render screen-specific content */}
      <View style={{flex:1}}>
        {React.Children.map(children, child => {
          // If it's a React element, clone it and pass navigation prop
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { navigation });
          }
          return child;
        })}
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
TopContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop:verticalScale(35),
    // width: '100%',
    borderColor: "#000",
    // borderWidth: 1,
},
locationContainer: {
    flexDirection:'column',
    alignItems:'center',
    
},
HeadText: {
    fontFamily:fonts.bold,
    fontWeight: "700",
    fontSize: moderateScale(20),
    color: "#898A8D",
},
addressContainer: {
    flexDirection: 'row',
    // borderWidth: 1,
    // borderColor: "#000",
},
addressText: {
    flexGrow:1,
    fontSize: moderateScale(19),
    fontWeight: "bold",

},
emoji: {
    marginTop: moderateScale(3),
    },
ProfileIcon: {
        // position: 'absolute',
    alignSelf:'center',
    alignContent:'center',
    marginTop: verticalScale(9),
    borderColor: "#000",
        
},
  searchContainer: {
    marginTop: verticalScale(20)
  },
  searchBarContainer: {
    flexDirection: 'row',
    position: 'relative',
  },
  searchIcon: {
    position:"absolute",
    right: horizontalScale(15),
    top: verticalScale(10),
    zIndex:1,
  },
  searchBar: {
    backgroundColor: '#F3F2F2',
    padding: moderateScale(15),
    borderRadius: moderateScale(15),
    fontSize: moderateScale(15),
    // borderRadius:20,
    elevation:3,
    width: '100%'
},
});
