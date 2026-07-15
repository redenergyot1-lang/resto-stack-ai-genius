import { restaurants as ALL_RESTAURANTS } from "../data/restaurants.js";

export function buildAiContext(city) {
  const restaurants = ALL_RESTAURANTS.filter((r) => !city || r.city === city);
  const compact = restaurants.map((r) => ({
    id: r.id, name: r.name, slug: r.slug, city: r.city,
    cuisines: r.cuisines, rating: r.rating, reviews: r.reviewCount,
    deliveryMin: r.deliveryTime, costForTwo: r.costForTwo,
    isVeg: r.isVeg, openNow: r.openNow, offer: r.offerText || null,
    popular: r.popularDishes,
    menu: r.menu.map((d) => ({
      id: d.id, name: d.name, category: d.category, price: d.price,
      rating: d.rating, reviews: d.reviewCount, isVeg: d.isVeg,
      bestseller: d.isBestseller, available: d.available,
    })),
  }));
  return JSON.stringify({ city: city || "All", restaurants: compact });
}

export function findDish(query) {
  const q = String(query || "").toLowerCase().trim();
  for (const r of ALL_RESTAURANTS) {
    for (const d of r.menu) {
      if (d.id.toLowerCase() === q || d.name.toLowerCase() === q) return { restaurant: r, dish: d };
    }
  }
  for (const r of ALL_RESTAURANTS) {
    for (const d of r.menu) {
      if (d.name.toLowerCase().includes(q)) return { restaurant: r, dish: d };
    }
  }
  return null;
}

export function findRestaurantBySlug(slug) {
  const s = String(slug || "").toLowerCase();
  return ALL_RESTAURANTS.find((r) => r.slug === s || r.id.toLowerCase() === s) || null;
}
