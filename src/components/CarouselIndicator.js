// CarouselIndicator.js
import React from 'react';
import { View, Animated } from 'react-native';

const CarouselIndicator = ({ scrollX, data, itemWidth }) => {
    return (
        <View style={styles.paginationContainer}>
            {data.map((_, index) => {
                const inputRange = [
                    (index - 1) * itemWidth,
                    index * itemWidth,
                    (index + 1) * itemWidth,
                ];

                // Animate the width for pill shape
                const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [8, 20, 8],
                    extrapolate: 'clamp',
                });

                // Animate the opacity
                const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                });

                return (
                    <Animated.View
                        key={index}
                        style={[
                            styles.dot,
                            {
                                width: dotWidth,
                                opacity,
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
};

const styles = {
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // paddingVertical: 5,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#000',
        marginHorizontal: 4,
    },
};

export default CarouselIndicator;