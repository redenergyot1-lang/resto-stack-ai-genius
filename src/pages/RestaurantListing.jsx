import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import SearchBar from "../components/SearchBar.jsx";
import RestaurantCard from "../components/RestaurantCard.jsx";
import { RestaurantCardSkeleton, EmptyState } from "../components/Misc.jsx";
import FiltersButton from "../components/FiltersButton.jsx";
import { DEFAULT_FILTERS } from "../components/filterConfig.js";
import { useDeliveryLocation } from "../context/LocationContext.jsx";
import { restaurants, allCuisines } from "../data/restaurants.js";
import { MapPin, SearchX } from "lucide-react";

export default function RestaurantListing() {
  const [params] = useSearchParams();
  const { city, hasCoverage } = useDeliveryLocation();
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(params.get("sort") || "relevance");
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    offers: !!params.get("offers"),
    cuisine: params.get("cuisine") || null,
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  // Every cuisine actually present across restaurants, not just the
  // curated "Culinary Journeys" categories shown on the landing page — a
  // few cuisines (e.g. Mughlai, Continental, Bakery & Cafe) only existed
  // as restaurant data and were missing from the filter dropdown otherwise.
  const cuisineList = useMemo(() => allCuisines.map((c) => c.name), []);

  const cityHasRestaurants = useMemo(() => restaurants.some((r) => r.city === city), [city]);
  const showingFallback = hasCoverage === false || !cityHasRestaurants;

  const filtered = useMemo(() => {
    let list = showingFallback ? [...restaurants] : restaurants.filter((r) => r.city === city);
    if (filters.vegOnly) list = list.filter((r) => r.isVeg);
    if (filters.nonVeg) list = list.filter((r) => !r.isVeg);
    if (filters.openNow) list = list.filter((r) => r.openNow);
    if (filters.offers) list = list.filter((r) => r.hasOffer);
    if (filters.topRated) list = list.filter((r) => r.rating >= 4.5);
    if (filters.mostOrdered) list = list.filter((r) => r.reviewCount >= 1000);
    if (filters.fastDelivery) list = list.filter((r) => r.deliveryTime <= 30);
    if (filters.newlyAdded) {
      list = list.filter((r) => parseInt(r.id.replace("R", ""), 10) > restaurants.length - 12);
    }
    if (filters.cuisine) list = list.filter((r) => r.cuisines.includes(filters.cuisine));
    if (filters.minRating) list = list.filter((r) => r.rating >= parseFloat(filters.minRating));
    if (filters.maxDeliveryTime) list = list.filter((r) => r.deliveryTime <= parseInt(filters.maxDeliveryTime, 10));
    if (filters.maxCost) list = list.filter((r) => r.costForTwo <= parseInt(filters.maxCost, 10));

    switch (sort) {
      case "rating_desc": list.sort((a, b) => b.rating - a.rating); break;
      case "rating_asc": list.sort((a, b) => a.rating - b.rating); break;
      case "delivery_time": list.sort((a, b) => a.deliveryTime - b.deliveryTime); break;
      case "cost_asc": list.sort((a, b) => a.costForTwo - b.costForTwo); break;
      case "cost_desc": list.sort((a, b) => b.costForTwo - a.costForTwo); break;
      default: break;
    }
    return list;
  }, [filters, sort, city, showingFallback]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-5 sm:px-8 w-full py-8">
        <div className="max-w-2xl mb-7">
          <SearchBar variant="compact" />
        </div>

        {showingFallback && (
          <div className="flex items-start gap-3 bg-gold-50 border border-gold-100 rounded-2xl p-4 mb-5 text-sm text-ink-700">
            <MapPin size={16} className="text-gold-600 shrink-0 mt-0.5" />
            <span>
              No partner restaurants in <strong>{city}</strong> yet — showing all restaurants instead.
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h1 className="font-display text-3xl font-bold text-ink-900">
            {filtered.length} restaurants{" "}
            {filters.cuisine ? `for "${filters.cuisine}"` : showingFallback ? "" : `in ${city}`}
          </h1>
          <div className="flex items-center gap-2.5">
            <FiltersButton filters={filters} setFilters={setFilters} cuisines={cuisineList} sort={sort} setSort={setSort} />
          </div>
        </div>

        <div className="pt-2">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No restaurants match your filters"
              subtitle="Try clearing a few filters to see more options."
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
