import React, { createContext, useContext, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AnimationContext = createContext({});
const { width } = Dimensions.get('window');

export const AnimationProvider = ({ children }) => {
    const navigation = useNavigation();
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const animateTransition = (direction, callback) => {
        const toValue = direction === 'next' ? -width : width;
        
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(callback);
    };

    const navigateTo = (routeName) => {
        animateTransition('next', () => {
            navigation.navigate(routeName);
        });
    };

    const resetAnimation = () => {
        slideAnim.setValue(0);
        fadeAnim.setValue(1);
        scaleAnim.setValue(1);
    };

    return (
        <AnimationContext.Provider value={{
            slideAnim,
            fadeAnim,
            scaleAnim,
            animateTransition,
            navigateTo,
            resetAnimation,
        }}>
            {children}
        </AnimationContext.Provider>
    );
};

export const useAnimation = () => useContext(AnimationContext);