import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { categories } from "../data/restaurants.js";

const DataContext = createContext(null);

function mapDish(m, r) {
  return {
    id: m.id,
    restaurantId: m.restaurant_id,
    restaurantName: r ? r.name : undefined,
    restaurantSlug: r ? r.slug : undefined,
    name: m.name,
    description: m.description || "",
    category: m.category || "",
    price: m.price,
    isVeg: m.is_veg,
    isBestseller: m.is_bestseller,
    available: m.available,
    image: m.image,
    rating: Number(m.rating) || 0,
    reviewCount: m.review_count || 0,
  };
}

function mapRestaurant(r) {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    cuisines: r.cuisines || [],
    rating: Number(r.rating) || 0,
    reviewCount: r.review_count || 0,
    deliveryTime: r.delivery_time,
    costForTwo: r.cost_for_two,
    isVeg: r.is_veg,
    isNonVegAvailable: r.is_non_veg_available,
    hasOffer: r.has_offer,
    offerText: r.offer_text,
    openNow: r.open_now,
    city: r.city,
    address: r.address,
    popularDishes: r.popular_dishes || [],
    image: r.image,
    banner: r.banner,
    menu: [],
  };
}

export function DataProvider({ children }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: rRows, error: rErr }, { data: mRows, error: mErr }] = await Promise.all([
        supabase.from("restaurants").select("*"),
        supabase.from("menu_items").select("*"),
      ]);
      if (cancelled) return;
      if (rErr || mErr) {
        setError(rErr || mErr);
        setLoading(false);
        return;
      }
      const mapped = (rRows || []).map(mapRestaurant);
      const byId = Object.fromEntries(mapped.map((r) => [r.id, r]));
      (mRows || []).forEach((m) => {
        const r = byId[m.restaurant_id];
        if (r) r.menu.push(mapDish(m, r));
      });
      setRestaurants(mapped);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const catImages = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c.name] = c.image; });
    return map;
  }, []);

  const allMenuItems = useMemo(
    () => restaurants.flatMap((r) => r.menu),
    [restaurants]
  );

  const allCuisines = useMemo(() => {
    const counts = {};
    restaurants.forEach((r) => r.cuisines.forEach((c) => { counts[c] = (counts[c] || 0) + 1; }));
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, image: catImages[name] || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&h=400&q=80" }))
      .sort((a, b) => b.count - a.count);
  }, [restaurants, catImages]);

  return (
    <DataContext.Provider value={{ restaurants, categories, allMenuItems, allCuisines, loading, error }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}