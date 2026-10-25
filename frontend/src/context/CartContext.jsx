import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("quickbite_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [restaurant, setRestaurant] = useState(() => {
    try {
      const saved = localStorage.getItem("quickbite_restaurant");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem("quickbite_cart", JSON.stringify(cartItems));
    if (cartItems.length === 0) {
      setRestaurant(null);
      localStorage.removeItem("quickbite_restaurant");
    } else if (restaurant) {
      localStorage.setItem("quickbite_restaurant", JSON.stringify(restaurant));
    }
  }, [cartItems, restaurant]);

  const addToCart = (item, currentRestaurant) => {
    if (restaurant && restaurant.id !== currentRestaurant.id && cartItems.length > 0) {
      const confirmReset = window.confirm(
        `Your cart contains items from "${restaurant.name}". Discard cart and start a new order from "${currentRestaurant.name}"?`
      );
      if (!confirmReset) return;
      setCartItems([
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          isVeg: item.isVeg,
          image: item.image
        }
      ]);
      setRestaurant({ id: currentRestaurant.id, name: currentRestaurant.name });
      return;
    }

    if (!restaurant) {
      setRestaurant({ id: currentRestaurant.id, name: currentRestaurant.name });
    }

    setCartItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          isVeg: item.isVeg,
          image: item.image
        }
      ];
    });
  };

  const updateQuantity = (menuItemId, qty) => {
    if (qty <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: qty } : i))
    );
  };

  const removeFromCart = (menuItemId) => {
    setCartItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurant(null);
    localStorage.removeItem("quickbite_cart");
    localStorage.removeItem("quickbite_restaurant");
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 35;
  const taxes = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + deliveryFee + taxes;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurant,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        subtotal,
        deliveryFee,
        taxes,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
