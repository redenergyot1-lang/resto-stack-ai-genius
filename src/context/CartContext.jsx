import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "restostack_cart";
const DELIVERY_FEE = 35;
const TAX_RATE = 0.05;
const PLATFORM_FEE = 6;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setItems(parsed.items || []);
        setRestaurantId(parsed.restaurantId || null);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, restaurantId }));
  }, [items, restaurantId]);

  function addItem(dish, restaurant) {
    setItems((prev) => {
      // Switching restaurants clears the cart, like Swiggy/Zomato.
      if (restaurantId && restaurant.id !== restaurantId && prev.length > 0) {
        const confirmed = window.confirm(
          "Your cart has items from another restaurant. Start a new cart?"
        );
        if (!confirmed) return prev;
        setRestaurantId(restaurant.id);
        return [{ ...dish, qty: 1, restaurantId: restaurant.id, restaurantName: restaurant.name }];
      }
      setRestaurantId(restaurant.id);
      const existing = prev.find((i) => i.id === dish.id);
      if (existing) {
        return prev.map((i) => (i.id === dish.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...dish, qty: 1, restaurantId: restaurant.id, restaurantName: restaurant.name }];
    });
  }

  function removeItem(dishId) {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== dishId);
      if (next.length === 0) setRestaurantId(null);
      return next;
    });
  }

  function setQty(dishId, qty) {
    if (qty <= 0) return removeItem(dishId);
    setItems((prev) => prev.map((i) => (i.id === dishId ? { ...i, qty } : i)));
  }

  function clearCart() {
    setItems([]);
    setRestaurantId(null);
  }

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const deliveryFee = items.length ? DELIVERY_FEE : 0;
    const platformFee = items.length ? PLATFORM_FEE : 0;
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + deliveryFee + platformFee + tax;
    const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
    return { subtotal, deliveryFee, platformFee, tax, total, itemCount };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, restaurantId, addItem, removeItem, setQty, clearCart, totals }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
