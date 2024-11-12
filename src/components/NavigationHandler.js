// NavigationHandler.js
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export const useCustomBackBehavior = ({
  isOnboarding = false,
  onBackPress
}) => {
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    const onboardingScreens = ['Onboarding1', 'Onboarding2', 'Onboarding3'];
    
    // Handle hardware back button
    const handleBackPress = () => {
      if (isOnboarding && onboardingScreens.includes(route.name)) {
        if (onBackPress) {
          onBackPress();
        }
        return true; // Prevents back navigation only for onboarding screens
      }
      return false; // Allows default back behavior for all other screens
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [route.name, isOnboarding, onBackPress]);
};