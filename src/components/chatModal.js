import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';

const ChatModal = ({ visible, onClose, onSubmit, message }) => {
  const [inputMessage, setInputMessage] = useState(message);

   // Update inputMessage whenever the prop `message` changes
   useEffect(() => {
    setInputMessage(message);
  }, [message]);

  const handleSubmit = () => {
    console.log("Input message:", inputMessage);
    onSubmit(inputMessage);
    onClose(); // Close the modal after submitting
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          {/* Blurred Background with transparency */}
          <View style={styles.overlay} />

          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chat with us</Text>

            {/* TextInput for typing message */}
            <TextInput
              style={styles.input}
              placeholder="Type your message here"
              value={inputMessage}
              onChangeText={setInputMessage} // Update state on change
            />

            {/* Submit button */}
            <TouchableOpacity onPress={handleSubmit} style={styles.button}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>

            {/* Close button */}
            
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent dark background
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%', // Full width for the input
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius:10,
  },
  closeButton: {
    marginTop: 10,
    color: 'red',
  },
  button: {
    width: 60,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#bf0603',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    marginRight: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChatModal;
