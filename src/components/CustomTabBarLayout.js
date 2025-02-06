import React, { useState, useEffect, useRef} from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { Ionicons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { ProfileIcon } from '../global/styles/icons/TabIcons';
import { globalStyles, fonts } from '../global/styles/theme';
import { horizontalScale, verticalScale, moderateScale } from '../theme/Metrics';


export default function CustomTabBarLayout({ route, navigation, children }) {

  const [address, setAddress] = useState('Set Location')



    useEffect(() => {
        if (route.params?.readableLocation) {
            // Log the updated location
            console.log("Location updated after navigation:", route.params.readableLocation);
            setAddress(route.params.readableLocation);
        }
    }, [route.params?.readableLocation])


    const handleLocationSearch = async () => {
        navigation.navigate("Map")
        console.log('Location Found')
    };

    const redirectSearchScreen = () => {
        navigation.navigate('AllRestaurants')
      };
  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={[globalStyles.container, {paddingBottom:0}]}>
      {/* Top Container for Location */}
      <View style={styles.TopContainer}>
        <View style={styles.locationContainer}>
          <View style={styles.address}>
            <Text style={styles.HeadText}>Deliver Now</Text>
            <View style={styles.addressContainer}>
              <Text style = {styles.addressText}>{address}</Text>
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

      {/* Render screen-specific content */}
      <View style={{flex:1}}>{children}</View>
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
