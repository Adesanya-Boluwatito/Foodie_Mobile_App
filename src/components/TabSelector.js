import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TabSelector = ({ selectedTab }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'restaurants' && styles.activeTab]}
        onPress={() => navigation.navigate('Wallet')}
      >
        <Text style={[styles.tabText, selectedTab === 'restaurants' && styles.activeTabText]}>
          RESTAURANTS
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, selectedTab === 'promos' && styles.activeTab]}
        onPress={() => navigation.navigate('OfferScreen')}
      >
        <Text style={[styles.tabText, selectedTab === 'promos' && styles.activeTabText]}>
          PROMOS
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FF3B30',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  activeTab: {
    backgroundColor: '#FF3B30',
  },
  tabText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});

export default TabSelector;
