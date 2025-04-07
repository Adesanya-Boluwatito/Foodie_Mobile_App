// GroupOrderScreen.js
import React, { useContext } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { GroupOrderContext } from '../../components/GroupOrderContext';

const GroupOrderScreen = ({ navigation }) => {
  const { groupOrder, addGuest } = useContext(GroupOrderContext);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Group Order from Restaurant Name</Text>
      <ScrollView>
        {groupOrder.guests.map((guest, index) => (
          <View key={index}>
            <Text>{guest.name}</Text>
            {guest.items.map((item, itemIndex) => (
              <Text key={itemIndex}>{item.name} - {item.price}</Text>
            ))}
            <Text>Total: {guest.total}</Text>
          </View>
        ))}
      </ScrollView>
      <Button title="Add Guest" onPress={() => addGuest('New Guest')} />
      <Button title="Go to Cart" onPress={() => navigation.navigate('CartScreen')} />
    </View>
  );
};

export default GroupOrderScreen;
