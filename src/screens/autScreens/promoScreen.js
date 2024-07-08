import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const transactions = [
  { id: '1', type: 'Credit', amount: '$200.00', date: '2024-06-01' },
  { id: '2', type: 'Debit', amount: '$50.00', date: '2024-06-02' },
  { id: '3', type: 'Credit', amount: '$100.00', date: '2024-06-03' },
  { id: '4', type: 'Debit', amount: '$25.00', date: '2024-06-04' },
];

const WalletScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>My Wallet</Text>
        <TouchableOpacity>
          <MaterialIcons name="account-balance-wallet" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Virtual Card */}
      <ImageBackground
        // source={{ uri: 'https://i.imgur.com/rjqiKRJ.png' }}
        // style={styles.card}
        // imageStyle={styles.cardImage}
      >
        <LinearGradient
          colors={['rgba(255,0,0,0.8)', 'rgba(255,0,0,0.6)', 'rgba(255,0,0,0.4)']}
          // style={styles.cardOverlay}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>VIRTUAL CARD</Text>
            <Text style={styles.cardNumber}>**** **** **** 1234</Text>
            <View style={styles.cardDetails}>
              <Text style={styles.cardLabel}>Card Holder</Text>
              <Text style={styles.cardValue}>John Doe</Text>
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.cardLabel}>Expires</Text>
              <Text style={styles.cardValue}>12/24</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      {/* Wallet Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="plus-circle" size={24} color="white" />
          <Text style={styles.actionText}>Add Money</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="history" size={24} color="white" />
          <Text style={styles.actionText}>Transaction History</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Info */}
      <View style={styles.balanceInfo}>
        <Text style={styles.balanceTitle}>Current Balance</Text>
        <Text style={styles.balanceAmount}>₦1,234,560</Text>
      </View>

      {/* Recent Transactions */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>Recent Transactions</Text>
        <FlatList
          data={transactions}
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <Text style={styles.transactionType}>{item.type}</Text>
              <Text style={styles.transactionAmount}>{item.amount}</Text>
              <Text style={styles.transactionDate}>{item.date}</Text>
            </View>
          )}
          keyExtractor={item => item.id}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight:100,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  card: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardImage: {
    borderRadius: 15,
  },
  cardOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  cardNumber: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 14,
    color: 'white',
  },
  cardValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 10,
    width: '48%',
    justifyContent: 'center',
  },
  actionText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  balanceInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceTitle: {
    fontSize: 16,
    color: 'white',
  },
  balanceAmount: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 10,
  },
  transactionsContainer: {
    flex: 1,
  },
  transactionsTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 10,
  },
  transactionType: {
    color: 'white',
    fontWeight: 'bold',
  },
  transactionAmount: {
    color: 'white',
  },
  transactionDate: {
    color: 'white',
  },
});

export default WalletScreen;
