import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal } from 'react-native';

const PaymentOptionsScreen = () => {
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Payment Options</Text>
        <Text style={styles.subHeaderText}>1 item(s), To pay: €27.27</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wallets</Text>
        <TouchableOpacity style={styles.paymentOption} onPress={toggleModal}>
          <Text>Amazon Pay</Text>
          <Text style={styles.linkText}>LINK ACCOUNT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.paymentOption}>
          <Text>Paytm</Text>
          <Text style={styles.linkText}>LINK ACCOUNT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.paymentOption} onPress={toggleModal}>
          <Text>PayPal</Text>
          <Text>€10.00</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.paymentOption}>
          <Text>Google Pay</Text>
          <Text style={styles.linkText}>LINK ACCOUNT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Credit/Debit Cards</Text>
        <TouchableOpacity style={styles.paymentOption}>
          <Text>4800-XXXX-XXXX-X844</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.paymentOption}>
          <Text>4800-XXXX-XXXX-X844</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addNewCard}>
          <Text style={styles.addNewCardText}>ADD NEW CARD</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Net Banking</Text>
        <View style={styles.bankOptions}>
          <Text style={styles.bankOption}>SC</Text>
          <Text style={styles.bankOption}>BB</Text>
          <Text style={styles.bankOption}>BJB</Text>
          <Text style={styles.bankOption}>CIMB</Text>
          <Text style={styles.bankOption}>HSBC</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.moreBanks}>MORE BANKS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pay On Delivery</Text>
        <TouchableOpacity style={styles.paymentOption}>
          <Text>Cash ONLY</Text>
        </TouchableOpacity>
      </View>

      <LinkAccountModal isVisible={isModalVisible} onClose={toggleModal} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    marginVertical: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subHeaderText: {
    fontSize: 16,
    color: 'grey',
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  linkText: {
    color: 'red',
  },
  addNewCard: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  addNewCardText: {
    color: 'blue',
  },
  bankOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bankOption: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  moreBanks: {
    color: 'blue',
    marginTop: 8,
    textAlign: 'right',
  },
});

export default PaymentOptionsScreen;
