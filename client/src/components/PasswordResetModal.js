import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../../firebaseconfi.js';
import { fonts } from '../global/styles/theme.js';
import { verticalScale, horizontalScale, moderateScale } from '../theme/Metrics.js';

const PasswordResetModal = ({ visible, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }
    
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent! Check your inbox.');
      setEmail('');
      onClose();
    } catch (error) {
      console.error('Error sending password reset email:', error);
      alert('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Reset Password</Text>
          <Text style={styles.instruction}>
            Enter your email address to receive password reset instructions
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              style={styles.inputField}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={handlePasswordReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.resetButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: moderateScale(24),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: verticalScale(10),
  },
  instruction: {
    fontFamily: fonts.regular,
    fontSize: moderateScale(16),
    color: 'grey',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  inputLabel: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: moderateScale(16),
    marginBottom: verticalScale(5),
  },
  inputField: {
    borderWidth: 1,
    height: verticalScale(50),
    borderRadius: moderateScale(17),
    paddingHorizontal: horizontalScale(12),
    borderColor: '#A5A5A5',
    fontSize: moderateScale(16),
    fontFamily: fonts.regular,
  },
  buttonContainer: {
    gap: verticalScale(10),
  },
  resetButton: {
    backgroundColor: 'black',
    padding: moderateScale(14),
    borderRadius: moderateScale(15),
  },
  resetButtonText: {
    color: 'white',
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: moderateScale(16),
    textAlign: 'center',
  },
  cancelButton: {
    padding: moderateScale(14),
    borderRadius: moderateScale(15),
    borderWidth: 1,
    borderColor: '#A5A5A5',
  },
  cancelButtonText: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: moderateScale(16),
    textAlign: 'center',
  },
});

export default PasswordResetModal;