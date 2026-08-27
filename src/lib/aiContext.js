export function buildAiContext(allRestaurants, city) {
  // Only take top 10 restaurants and remove menus to drastically reduce tokens
  const restaurants = (allRestaurants || []).filter((r) => !city || r.city === city).slice(0, 10);
  const compact = restaurants.map((r) => ({
    id: r.id, name: r.name, slug: r.slug,
    cuisines: r.cuisines, rating: r.rating,
    costForTwo: r.costForTwo
  }));
  return JSON.stringify({ city: city || "All", top10Restaurants: compact, note: "Menus are omitted to save tokens. Use navigate tool to open restaurants." });
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
