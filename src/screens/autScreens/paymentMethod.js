import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput } from 'react-native';
import { usePayment } from '../../components/paymentContext';
import LinkAccountModal from '../../components/LinkAccountModal';

const PaymentOptionsScreen = ({route}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [newCard, setNewCard] = useState('');
  const { paymentOptions, setPaymentOptions } = usePayment();

  const { totalItems, totalPrice } = route.params;
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const addNewCard = () => {
    if (newCard) {
      setPaymentOptions([...paymentOptions, { id: Date.now(), number: newCard }]);
      setNewCard('');
      toggleModal();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Payment Options</Text>
        <Text style={styles.subHeaderText}>{totalItems} item(s), To pay: ₦{totalPrice}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wallets</Text>
        {/* ... Your existing Wallets section ... */}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Credit/Debit Cards</Text>
        {paymentOptions.map(option => (
          <TouchableOpacity key={option.id} style={styles.paymentOption}>
            <Text>{option.number}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addNewCard} onPress={toggleModal}>
          <Text style={styles.addNewCardText}>ADD NEW CARD</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Net Banking</Text>
        {/* ... Your existing Net Banking section ... */}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pay On Delivery</Text>
        {/* ... Your existing Pay On Delivery section ... */}
      </View>

      <LinkAccountModal isVisible={isModalVisible} onClose={toggleModal} />

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Card</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter card number"
              value={newCard}
              onChangeText={setNewCard}
            />
            <TouchableOpacity style={styles.modalButton} onPress={addNewCard}>
              <Text style={styles.modalButtonText}>Add Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={toggleModal}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#FF3D00',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PaymentOptionsScreen;
