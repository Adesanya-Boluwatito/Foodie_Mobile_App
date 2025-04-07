import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});

  const addToCart = (item) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[item.name]) {
        updated[item.name].quantity += item.quantity;
      } else {
        updated[item.name] = item;
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems({});
  };

  const removeItem = (item) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      delete updated[item.name];
      return updated;
    });
  };

  const updateItemQuantity = (item, quantity) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[item.name]) {
        updated[item.name].quantity = quantity;
        if (quantity === 0) {
          delete updated[item.name];
        }
      }
      return updated;
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, clearCart, removeItem, updateItemQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
