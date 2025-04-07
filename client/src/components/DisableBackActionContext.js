import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const DisableBackActionForScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Track if the screen is focused

  useEffect(() => {
    if (isFocused) {
      const handleBackPress = () => true;
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

      const unsubscribeNavigation = navigation.addListener('beforeRemove', (e) => {
        e.preventDefault(); // Disable gesture-based back navigation
      });

      return () => {
        backHandler.remove();
        unsubscribeNavigation();
      };
    }
  }, [isFocused, navigation]);

  return null;
};

export default DisableBackActionForScreen;
