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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bf0603',
    overflow: 'hidden',
    width:250,
    height:50,
    alignSelf: "center",
  },
  tab: {
    flex: 0.6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    // paddingBottom:10,
  },
  activeTab: {
    backgroundColor: '#bf0603',
  },
  tabText: {
    color: '#bf0603',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});

export default TabSelector;
