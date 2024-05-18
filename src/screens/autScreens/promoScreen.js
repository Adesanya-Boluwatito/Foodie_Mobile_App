// screens/WalletScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';

const WalletScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Wallet</Text>
      </View>
      
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceTitle}>Current Balance</Text>
        <Text style={styles.balanceAmount}>€ 120.50</Text>
      </View>

      <View style={styles.transactionHeader}>
        <Text style={styles.transactionTitle}>Recent Transactions</Text>
      </View>

      <View style={styles.transactionList}>
        {transactions.map((transaction, index) => (
          <View key={index} style={styles.transactionItem}>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionName}>{transaction.name}</Text>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
            </View>
            <Text style={[
              styles.transactionAmount,
              { color: transaction.type === 'credit' ? 'green' : 'red' }
            ]}>
              {transaction.type === 'credit' ? '+' : '-'} € {transaction.amount}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.addFundsButton}>
        <Text style={styles.addFundsButtonText}>Add Funds</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const transactions = [
  { name: 'McDonald’s', date: 'May 18, 2024', amount: 15.20, type: 'debit' },
  { name: 'Uber', date: 'May 17, 2024', amount: 8.50, type: 'debit' },
  { name: 'Starbucks', date: 'May 16, 2024', amount: 5.75, type: 'debit' },
  { name: 'Salary', date: 'May 15, 2024', amount: 1000.00, type: 'credit' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
	paddingTop: 30,
  },
  header: {
    padding: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceContainer: {
    padding: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 16,
    color: 'gray',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  transactionHeader: {
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionList: {
    padding: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
  },
  transactionDate: {
    fontSize: 14,
    color: 'gray',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addFundsButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    alignItems: 'center',
  },
  addFundsButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default WalletScreen;
