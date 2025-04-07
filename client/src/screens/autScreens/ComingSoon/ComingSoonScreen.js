import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale } from '../../../theme/Metrics';
import { fonts, globalStyles } from '../../../global/styles/theme';
import { useLocation } from '../../../context/LocationContext';

const { width } = Dimensions.get('window');

const ComingSoonScreen = ({ route, navigation, screenType = 'Mart' }) => {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Get location data for personalized message
  const { locationData } = useLocation();
  const locationName = locationData?.readableLocation 
    ? locationData.readableLocation.split(',')[0] 
    : 'your area';

  useEffect(() => {
    // Sequence animations for better visual effect
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // Setup pulse animation
    const pulseSequence = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ]);

    // Loop the pulse animation
    Animated.loop(pulseSequence).start();
  }, [fadeAnim, slideAnim, pulseAnim]);

  const getImage = () => {
    if (screenType === 'Mart') {
      return require('../../../../assets/ima/grocery.png');
    } else {
      return require('../../../../assets/ima/pharmacy.png');
    }
  };

  const getTitle = () => {
    return screenType === 'Mart' ? 'Grocery Mart' : 'Pharmacy';
  };

  const getMessage = () => {
    if (screenType === 'Mart') {
      return `We're working hard to bring fresh groceries to ${locationName}. Stay tuned for our launch!`;
    } else {
      return `Our pharmacy service is coming soon to ${locationName}. We're finalizing partnerships with local pharmacies.`;
    }
  };

  const getETA = () => {
    return screenType === 'Mart' ? '2 weeks' : '3 weeks';
  };

  const getFeatures = () => {
    if (screenType === 'Mart') {
      return [
        { icon: 'basket-outline', text: 'Fresh produce and groceries' },
        { icon: 'timer-outline', text: 'Same-day delivery' },
        { icon: 'cart-outline', text: 'Local market items' },
        { icon: 'pricetag-outline', text: 'Special deals & discounts' },
      ];
    } else {
      return [
        { icon: 'medkit-outline', text: 'Prescription delivery' },
        { icon: 'timer-outline', text: 'Rush delivery option' },
        { icon: 'medical-outline', text: 'Health consultations' },
        { icon: 'heart-outline', text: 'Health & wellness products' },
      ];
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        {/* Image */}
        <Animated.View style={[
          styles.imageContainer,
          { transform: [{ scale: pulseAnim }] }
        ]}>
          <Image 
            source={getImage()}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>{getTitle()} Coming Soon</Text>
        
        {/* Description */}
        <Text style={styles.description}>{getMessage()}</Text>
        
        {/* ETA */}
        <View style={styles.etaContainer}>
          <Ionicons name="time-outline" size={24} color="#4CAF50" />
          <Text style={styles.etaText}>Estimated Launch: <Text style={styles.etaHighlight}>{getETA()}</Text></Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What to expect:</Text>
          {getFeatures().map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name={feature.icon} size={20} color="#4CAF50" />
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        {/* Notification Button */}
        <TouchableOpacity style={styles.notifyButton}>
          <Text style={styles.notifyButtonText}>Notify Me When Available</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Floating Action Button to return to home */}
      <TouchableOpacity 
        style={styles.homeButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="home-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: moderateScale(20),
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: verticalScale(50),
  },
  imageContainer: {
    width: horizontalScale(150),
    height: verticalScale(150),
    marginBottom: verticalScale(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: moderateScale(16),
    color: '#666',
    textAlign: 'center',
    marginBottom: verticalScale(30),
    lineHeight: verticalScale(24),
    paddingHorizontal: horizontalScale(20),
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(20),
    borderRadius: moderateScale(25),
    marginBottom: verticalScale(30),
  },
  etaText: {
    fontFamily: fonts.regular,
    fontSize: moderateScale(14),
    color: '#555',
    marginLeft: horizontalScale(10),
  },
  etaHighlight: {
    fontFamily: fonts.bold,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: verticalScale(30),
  },
  featuresTitle: {
    fontFamily: fonts.bold,
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: verticalScale(10),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(8),
  },
  featureText: {
    fontFamily: fonts.regular,
    fontSize: moderateScale(15),
    color: '#555',
    marginLeft: horizontalScale(10),
  },
  notifyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(20),
    borderRadius: moderateScale(25),
    marginTop: verticalScale(10),
    elevation: 2,
  },
  notifyButtonText: {
    fontFamily: fonts.bold,
    fontSize: moderateScale(16),
    color: '#fff',
    fontWeight: 'bold',
  },
  homeButton: {
    position: 'absolute',
    bottom: verticalScale(30),
    right: horizontalScale(20),
    backgroundColor: '#4CAF50',
    width: horizontalScale(50),
    height: verticalScale(50),
    borderRadius: moderateScale(25),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default ComingSoonScreen; 