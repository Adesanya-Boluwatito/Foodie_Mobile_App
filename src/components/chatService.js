import { db } from '../../firebaseconfi';
import { collection, addDoc, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';

// const currentUser = auth.currentUser
// const userId = currentUser.uid

export const getMessages = async (userId, restaurantId) => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('userId', '==', userId), where('restaurantId', '==', restaurantId), orderBy('timestamp'));

    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return []; // Return an empty array or handle the error as needed
  }
};

export const sendMessage = async (message) => {
  try {
    const messagesRef = collection(db, 'messages');
    await addDoc(messagesRef, message);
  } catch (error) {
    console.error('Error sending message: ', error);
  }
};
