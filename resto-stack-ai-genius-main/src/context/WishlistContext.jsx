import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "./AuthContext.jsx";

const WishlistContext = createContext(null);
const STORAGE_KEY = "restostack_wishlist";

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState([]);

  useEffect(() => {
    if (!user) {
      try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
        setIds(Array.isArray(raw) ? raw : []);
      } catch { setIds([]); }
      return;
    }
    (async () => {
      const { data } = await supabase.from("wishlist").select("restaurant_id").eq("user_id", user.id);
      setIds((data || []).map((r) => r.restaurant_id));
    })();
  }, [user]);

  function isSaved(restaurantId) {
    return ids.includes(restaurantId);
  }

  async function toggle(restaurantId) {
    const has = ids.includes(restaurantId);
    const next = has ? ids.filter((id) => id !== restaurantId) : [...ids, restaurantId];
    setIds(next);
    if (user) {
      if (has) await supabase.from("wishlist").delete().eq("user_id", user.id).eq("restaurant_id", restaurantId);
      else await supabase.from("wishlist").insert({ user_id: user.id, restaurant_id: restaurantId });
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }

  async function remove(restaurantId) {
    const next = ids.filter((id) => id !== restaurantId);
    setIds(next);
    if (user) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("restaurant_id", restaurantId);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
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
