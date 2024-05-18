import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomTabBarItem = ({ iconName, label, active }) => {
  return (
    <TouchableOpacity activeOpacity={0.8}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons
          name={iconName}
          size={24}
          color={active ? 'brown' : 'black'} // Change color based on active state
        />
        {active && <Text>{label}</Text>} {/* Show label only when tab is active */}
      </View>
    </TouchableOpacity>
  );
};

export default CustomTabBarItem;
