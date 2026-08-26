export function buildAiContext(allRestaurants, city) {
  const restaurants = (allRestaurants || []).filter((r) => !city || r.city === city);
  const compact = restaurants.map((r) => ({
    id: r.id, name: r.name, slug: r.slug, city: r.city,
    cuisines: r.cuisines, rating: r.rating, reviews: r.reviewCount,
    deliveryMin: r.deliveryTime, costForTwo: r.costForTwo,
    isVeg: r.isVeg, openNow: r.openNow, offer: r.offerText || null,
    popular: r.popularDishes,
    menu: (r.menu || []).map((d) => ({
      id: d.id, name: d.name, category: d.category, price: d.price,
      rating: d.rating, reviews: d.reviewCount, isVeg: d.isVeg,
      bestseller: d.isBestseller, available: d.available,
    })),
  }));
  return JSON.stringify({ city: city || "All", restaurants: compact });
}

export function findDish(allRestaurants, query) {
  const q = String(query || "").toLowerCase().trim();
  for (const r of allRestaurants || []) {
    for (const d of r.menu || []) {
      if (d.id.toLowerCase() === q || d.name.toLowerCase() === q) return { restaurant: r, dish: d };
    }
  }
  for (const r of allRestaurants || []) {
    for (const d of r.menu || []) {
      if (d.name.toLowerCase().includes(q)) return { restaurant: r, dish: d };
    }
  }
  return null;
}

export function findRestaurantBySlug(allRestaurants, slug) {
  const s = String(slug || "").toLowerCase();
  return (allRestaurants || []).find((r) => r.slug === s || r.id.toLowerCase() === s) || null;
}
