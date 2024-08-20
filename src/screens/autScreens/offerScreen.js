import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import TabSelector from '../../components/TabSelector';


const promoData = [
  { id: '1', platform: 'paytm', code: 'FREEDELPTM', title: 'Get Unlimited free delivery using paytm', description: 'Use code FREEDELPTM & get free delivery on all orders above Rs. 99', moreInfo: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut pretium pretium tempor.' },
  { id: '2', platform: 'freecharge', code: 'FIRSTUSER', title: 'Free Delivery for the first time users', description: '', moreInfo: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: '3', platform: 'GPay', code: 'DELIVERY', title: 'Free Delivery for the first time users', description: '', moreInfo: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
];

export default function PromoScreen() {
  const [expandedPromo, setExpandedPromo] = useState(null);

  const toggleExpand = (id) => {
    setExpandedPromo(expandedPromo === id ? null : id);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TabSelector selectedTab="promos" />
      </View>

      {/* Promo Cards */}
      {promoData.map((promo) => (
        <View key={promo.id} style={styles.promoCard}>
          <View style={styles.promoHeader}>
            <Text style={styles.promoPlatform}>{promo.platform}</Text>
            <Text style={styles.promoCode}>{promo.code}</Text>
          </View>
          <Text style={styles.promoTitle}>{promo.title}</Text>
          <Text style={styles.promoDescription}>{promo.description}</Text>
          {expandedPromo === promo.id && (
            <Text style={styles.promoMoreInfo}>{promo.moreInfo}</Text>
          )}
          <TouchableOpacity onPress={() => toggleExpand(promo.id)}>
            <Text style={styles.expandText}>{expandedPromo === promo.id ? 'CLOSE' : 'EXPAND'}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  headerContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 16 },
  headerButton: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  activeHeaderButton: { backgroundColor: '#bf0603' },
  headerText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  promoCard: { backgroundColor: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 16 },
  promoHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  promoPlatform: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  promoCode: { fontSize: 14, fontWeight: 'bold', color: '#bf0603' },
  promoTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  promoDescription: { fontSize: 12, color: '#777', marginBottom: 8 },
  promoMoreInfo: { fontSize: 12, color: '#777', marginBottom: 8 },
  expandText: { fontSize: 14, fontWeight: 'bold', color: '#bf0603' },
});
