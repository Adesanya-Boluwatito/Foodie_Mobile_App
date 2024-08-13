import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getMessages, sendMessage } from '../../components/chatService'; // Placeholder for chat service

const ChatScreen = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const navigation = useNavigation();
  const { userId, restaurantsId } = route.params;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        console.log('Fetching messages for userId:', userId, 'and restaurantsId:', restaurantsId);
        const initialMessages = await getMessages(userId, restaurantsId);
        console.log('Fetched messages:', initialMessages);
        setMessages(initialMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    
  }, [userId, restaurantsId]);

  const handleSendMessage = async () => {
    if (messageText.trim()) {
      const newMessage = { text: messageText, userId, restaurantsId, timestamp: new Date().toISOString() };
      await sendMessage(newMessage);
      setMessages((prevMessages) =>[...prevMessages, newMessage]);
      setMessageText('');
      
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.timestamp}
        renderItem={({ item }) => (
          <View style={item.userId === userId ? styles.myMessage : styles.otherMessage}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    padding: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7dd',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ChatScreen;
