import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "./AuthContext.jsx";
import { useData } from "./DataContext.jsx";

const CartContext = createContext(null);
const STORAGE_KEY = "restostack_cart";
const DELIVERY_FEE = 35;
const TAX_RATE = 0.05;
const PLATFORM_FEE = 6;

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { restaurants } = useData();
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const hydratedRef = useRef(false);

  // Load initial cart (localStorage for guests, Supabase for signed-in users)
  useEffect(() => {
    hydratedRef.current = false;
    if (!user) {
      try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
        setItems(parsed?.items || []);
        setRestaurantId(parsed?.restaurantId || null);
      } catch {
        setItems([]); setRestaurantId(null);
      }
      hydratedRef.current = true;
      return;
    }
    if (!restaurants.length) return; // wait until catalog is loaded to hydrate
    (async () => {
      const { data } = await supabase.from("cart_items").select("*").eq("user_id", user.id);
      const rows = data || [];
      const dishIndex = {};
      restaurants.forEach((r) => r.menu.forEach((d) => { dishIndex[d.id] = { d, r }; }));
      const hydrated = rows
        .map((row) => {
          const found = dishIndex[row.dish_id];
          if (!found) return null;
          return { ...found.d, qty: row.qty, restaurantId: found.r.id, restaurantName: found.r.name };
        })
        .filter(Boolean);
      setItems(hydrated);
      setRestaurantId(rows[0]?.restaurant_id || null);
      hydratedRef.current = true;
    })();
  }, [user, restaurants]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!user && hydratedRef.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, restaurantId }));
    }
  }, [items, restaurantId, user]);

  async function syncUpsert(dishId, qty, restId) {
    if (!user) return;
    await supabase.from("cart_items").upsert(
      { user_id: user.id, dish_id: dishId, qty, restaurant_id: restId },
      { onConflict: "user_id,dish_id" }
    );
  }
  async function syncDelete(dishId) {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id).eq("dish_id", dishId);
  }
  async function syncClear() {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
  }

  function addItem(dish, restaurant) {
    setItems((prev) => {
      // Switching restaurants clears the cart, like Swiggy/Zomato.
      if (restaurantId && restaurant.id !== restaurantId && prev.length > 0) {
        const confirmed = window.confirm(
          "Your cart has items from another restaurant. Start a new cart?"
        );
        if (!confirmed) return prev;
        setRestaurantId(restaurant.id);
        syncClear().then(() => syncUpsert(dish.id, 1, restaurant.id));
        return [{ ...dish, qty: 1, restaurantId: restaurant.id, restaurantName: restaurant.name }];
      }
      setRestaurantId(restaurant.id);
      const existing = prev.find((i) => i.id === dish.id);
      if (existing) {
        syncUpsert(dish.id, existing.qty + 1, restaurant.id);
        return prev.map((i) => (i.id === dish.id ? { ...i, qty: i.qty + 1 } : i));
      }
      syncUpsert(dish.id, 1, restaurant.id);
      return [...prev, { ...dish, qty: 1, restaurantId: restaurant.id, restaurantName: restaurant.name }];
    });
  }

  function removeItem(dishId) {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== dishId);
      if (next.length === 0) setRestaurantId(null);
      syncDelete(dishId);
      return next;
    });
  }

  function setQty(dishId, qty) {
    if (qty <= 0) return removeItem(dishId);
    setItems((prev) => prev.map((i) => (i.id === dishId ? { ...i, qty } : i)));
    syncUpsert(dishId, qty, restaurantId);
  }

  function clearCart() {
    setItems([]);
    setRestaurantId(null);
    syncClear();
    if (!user) localStorage.removeItem(STORAGE_KEY);
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
