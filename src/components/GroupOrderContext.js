// GroupOrderContext.js
import React, { createContext, useState } from 'react';

export const GroupOrderContext = createContext();

export const GroupOrderProvider = ({ children }) => {
  const [groupOrder, setGroupOrder] = useState({
    deliveryAddress: '',
    guests: [],
  });

  const addGuest = (guestName) => {
    setGroupOrder(prevOrder => ({
      ...prevOrder,
      guests: [...prevOrder.guests, { name: guestName, items: [], total: 0 }],
    }));
  };

  const addItemToGuestCart = (guestName, item) => {
    setGroupOrder(prevOrder => {
      const updatedGuests = prevOrder.guests.map(guest => {
        if (guest.name === guestName) {
          return {
            ...guest,
            items: [...guest.items, item],
            total: guest.total + item.price,
          };
        }
        return guest;
      });
      return { ...prevOrder, guests: updatedGuests };
    });
  };

  const setDeliveryAddress = (address) => {
    setGroupOrder(prevOrder => ({
      ...prevOrder,
      deliveryAddress: address,
    }));
  };

  return (
    <GroupOrderContext.Provider value={{ groupOrder, addGuest, addItemToGuestCart, setDeliveryAddress }}>
      {children}
    </GroupOrderContext.Provider>
  );
};
