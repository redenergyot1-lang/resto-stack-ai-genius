import { createContext, useContext, useEffect, useState } from "react";

// Mirrors CartContext's shape/persistence pattern so it's an easy drop-in
// swap for a real `GET/POST/DELETE /api/wishlist` API later:
//   list    -> GET  /api/wishlist
//   toggle  -> POST /api/wishlist/:restaurantId  or DELETE if already saved
const WishlistContext = createContext(null);
const STORAGE_KEY = "restostack_wishlist";

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(raw)) setIds(raw);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  function isSaved(restaurantId) {
    return ids.includes(restaurantId);
  }

  function toggle(restaurantId) {
    setIds((prev) =>
      prev.includes(restaurantId) ? prev.filter((id) => id !== restaurantId) : [...prev, restaurantId]
    );
  }

  function remove(restaurantId) {
    setIds((prev) => prev.filter((id) => id !== restaurantId));
  }

  return (
    <WishlistContext.Provider value={{ ids, isSaved, toggle, remove }}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
