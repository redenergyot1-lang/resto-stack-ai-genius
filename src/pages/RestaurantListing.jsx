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
import { useData } from "../context/DataContext.jsx";
import { MapPin, SearchX } from "lucide-react";

// Offer-driven quick views reachable from the navbar "Offers" dropdown.
// Each one narrows the listing differently so no two links land on the
// same set of restaurants.
const DEAL_LABELS = {
  under150: "meals under ₹150",
  discount20: "20%+ OFF",
  discount30: "30%+ OFF",
  freeDelivery: "free delivery",
  best: "best deals",
};

function offerPercent(r) {
  const m = /(\d+)\s*%/.exec(r.offerText || "");
  return m ? parseInt(m[1], 10) : 0;
}
function hasFreeDelivery(r) {
  return /free delivery/i.test(r.offerText || "");
}
function cheapestDish(r) {
  const prices = (r.menu || []).filter((d) => d.available !== false).map((d) => d.price);
  return prices.length ? Math.min(...prices) : Infinity;
}
function dealScore(r) {
  return (
    r.rating * 2 +
    offerPercent(r) / 10 +
    (hasFreeDelivery(r) ? 1.5 : 0) +
    Math.max(0, (800 - r.costForTwo) / 200) +
    Math.max(0, (50 - r.deliveryTime) / 20)
  );
}

export default function RestaurantListing() {
  const [params] = useSearchParams();
  const { city, hasCoverage } = useDeliveryLocation();
  const { restaurants, allCuisines, loading: dataLoading } = useData();
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(params.get("sort") || "relevance");
  const deal = params.get("deal");
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    offers: !!params.get("offers"),
    cuisine: params.get("cuisine") || null,
  });

  useEffect(() => {
    setLoading(dataLoading);
  }, [dataLoading]);

  // Keep the filter state in sync when the navbar links change the query
  // string while this page is already mounted.
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      offers: !!params.get("offers"),
      cuisine: params.get("cuisine") || null,
    }));
    setSort(params.get("sort") || "relevance");
  }, [params]);

  // Every cuisine actually present across restaurants, not just the
  // curated "Culinary Journeys" categories shown on the landing page — a
  // few cuisines (e.g. Mughlai, Continental, Bakery & Cafe) only existed
  // as restaurant data and were missing from the filter dropdown otherwise.
  const cuisineList = useMemo(() => allCuisines.map((c) => c.name), [allCuisines]);

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

    // Offer-dropdown deal views
    if (deal === "under150") {
      list = list.filter((r) => cheapestDish(r) <= 150);
      list.sort((a, b) => cheapestDish(a) - cheapestDish(b));
    } else if (deal === "discount20") {
      list = list.filter((r) => offerPercent(r) >= 20);
      list.sort((a, b) => offerPercent(b) - offerPercent(a));
    } else if (deal === "discount30") {
      list = list.filter((r) => offerPercent(r) >= 30);
      list.sort((a, b) => offerPercent(b) - offerPercent(a));
    } else if (deal === "freeDelivery") {
      list = list.filter(hasFreeDelivery);
      list.sort((a, b) => b.rating - a.rating);
    } else if (deal === "best") {
      list = list.filter((r) => r.hasOffer && r.rating >= 4);
      list.sort((a, b) => dealScore(b) - dealScore(a));
      list = list.slice(0, 24);
    }

    switch (sort) {
      case "rating_desc": list.sort((a, b) => b.rating - a.rating); break;
      case "rating_asc": list.sort((a, b) => a.rating - b.rating); break;
      case "delivery_time": list.sort((a, b) => a.deliveryTime - b.deliveryTime); break;
      case "cost_asc": list.sort((a, b) => a.costForTwo - b.costForTwo); break;
      case "cost_desc": list.sort((a, b) => b.costForTwo - a.costForTwo); break;
      default: break;
    }
    return list;
  }, [filters, sort, city, showingFallback, restaurants, deal]);


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
