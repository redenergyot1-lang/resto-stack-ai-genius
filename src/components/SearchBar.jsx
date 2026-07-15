import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Loader2 } from "lucide-react";
import { restaurants, allMenuItems, allCuisines } from "../data/restaurants.js";
import { useDeliveryLocation } from "../context/LocationContext.jsx";
import LocationModal from "./LocationModal.jsx";
import VegBadge from "./VegBadge.jsx";
import Thumbnail from "./Thumbnail.jsx";
import { highlightMatch as highlight } from "../utils/highlight.jsx";

export default function SearchBar({ variant = "hero", city, onCityClick }) {
  const { city: selectedCity, hasCoverage } = useDeliveryLocation();
  const displayCity = city || selectedCity;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const navigate = useNavigate();
  const wrapRef = useRef(null);

  // If the parent page doesn't already manage a LocationModal (it passes
  // onCityClick when it does, e.g. Landing), the search bar opens its own
  // — so the "Deliver to" button always does something.
  const handleCityClick = onCityClick || (() => setLocationOpen(true));

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 220);
    return () => clearTimeout(t);
  }, [query]);

  // Restaurant/dish suggestions are scoped to the selected delivery city
  // (falling back to the full catalog if that city has no partners yet),
  // mirroring the listing pages so search-as-you-type never suggests a
  // place the person can't actually order from.
  const cityHasRestaurants = useMemo(
    () => restaurants.some((r) => r.city === displayCity),
    [displayCity]
  );
  const showingFallback = hasCoverage === false || !cityHasRestaurants;
  const scopedRestaurants = useMemo(
    () => (showingFallback ? restaurants : restaurants.filter((r) => r.city === displayCity)),
    [showingFallback, displayCity]
  );
  const scopedDishes = useMemo(
    () => (showingFallback ? allMenuItems : allMenuItems.filter((d) => scopedRestaurants.some((r) => r.slug === d.restaurantSlug))),
    [showingFallback, scopedRestaurants]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { restos: [], dishes: [], cuisines: [] };
    const cuisines = allCuisines.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 3);
    const restos = scopedRestaurants
      .filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisines.some((c) => c.toLowerCase().includes(q))
      )
      .slice(0, 4);
    const dishes = scopedDishes
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.restaurantName.toLowerCase().includes(q)
      )
      .slice(0, 5);
    return { restos, dishes, cuisines };
  }, [query, scopedRestaurants, scopedDishes]);

  const isEmpty =
    query && !loading && results.restos.length === 0 && results.dishes.length === 0 && results.cuisines.length === 0;

  function goSearch(q) {
    if (!q.trim()) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  const popular = ["Pizza", "Noodles", "Salads", "Burgers", "Tacos", "Desserts"];

  return (
    <div ref={wrapRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goSearch(query);
        }}
        className={`flex items-stretch gap-0 rounded-2xl bg-white shadow-card overflow-hidden ${
          variant === "hero" ? "" : "border border-ink-900/10"
        }`}
      >
        <button
          type="button"
          onClick={handleCityClick}
          className="hidden sm:flex items-center gap-2 px-4 border-r border-ink-900/10 text-left shrink-0 hover:bg-cream-100 transition-colors"
        >
          <MapPin size={18} className="text-gold-600" />
          <span className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wide text-ink-300">Deliver to</span>
            <span className="text-sm font-semibold text-ink-900">{displayCity}</span>
          </span>
        </button>
        <div className="flex items-center flex-1 px-4 gap-2">
          {loading ? (
            <Loader2 size={18} className="text-ink-300 animate-spin shrink-0" />
          ) : (
            <Search size={18} className="text-ink-300 shrink-0" />
          )}
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder='Search for "butter chicken"'
            className="w-full py-3.5 bg-transparent outline-none text-sm placeholder:text-ink-300"
          />
        </div>
        <button
          type="submit"
          className="px-6 sm:px-8 bg-gold-600 hover:bg-gold-700 text-white font-semibold text-sm transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {variant === "hero" && (
        <div className="flex items-center gap-2 mt-3 flex-wrap text-sm">
          <span className="text-ink-300">Popular:</span>
          {popular.map((p) => (
            <button
              key={p}
              onClick={() => goSearch(p)}
              className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-ink-700 text-xs sm:text-sm font-medium transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {open && query && (
        <div className="absolute z-40 mt-2 w-full bg-white rounded-2xl shadow-cardHover border border-ink-900/5 overflow-hidden max-h-[26rem] overflow-y-auto animate-fadeUp">
          {isEmpty ? (
            <div className="py-10 text-center px-6">
              <p className="font-display text-lg text-ink-900">No results for "{query}"</p>
              <p className="text-sm text-ink-300 mt-1">Try searching a dish, cuisine, or restaurant name.</p>
            </div>
          ) : (
            <>
              {results.cuisines.length > 0 && (
                <div className="py-2">
                  <p className="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wide text-ink-300 font-semibold">
                    Cuisines
                  </p>
                  {results.cuisines.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setOpen(false);
                        navigate(`/restaurants?cuisine=${encodeURIComponent(c.name)}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-cream-100 text-left transition-colors"
                    >
                      <Thumbnail src={c.image} alt="" aspect="aspect-square" rounded="rounded-lg" className="w-10 shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink-900 truncate">
                          {highlight(c.name, query)}
                        </span>
                        <span className="block text-xs text-ink-300 truncate">{c.count} restaurants</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {results.restos.length > 0 && (
                <div className="py-2">
                  <p className="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wide text-ink-300 font-semibold">
                    Restaurants
                  </p>
                  {results.restos.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setOpen(false);
                        navigate(`/restaurant/${r.slug}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-cream-100 text-left transition-colors"
                    >
                      <Thumbnail src={r.image} alt="" aspect="aspect-square" rounded="rounded-lg" className="w-10 shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink-900 truncate">
                          {highlight(r.name, query)}
                        </span>
                        <span className="block text-xs text-ink-300 truncate">{r.cuisines.join(", ")}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {results.dishes.length > 0 && (
                <div className="py-2 border-t border-ink-900/5">
                  <p className="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wide text-ink-300 font-semibold">
                    Dishes
                  </p>
                  {results.dishes.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setOpen(false);
                        navigate(`/restaurant/${d.restaurantSlug}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-cream-100 text-left transition-colors"
                    >
                      <VegBadge isVeg={d.isVeg} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-ink-900 truncate">
                          {highlight(d.name, query)}
                        </span>
                        <span className="block text-xs text-ink-300 truncate">at {d.restaurantName}</span>
                      </span>
                      <span className="text-sm font-semibold text-ink-700 shrink-0">₹{d.price}</span>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => goSearch(query)}
                className="w-full text-center py-3 text-sm font-semibold text-gold-600 hover:bg-cream-100 border-t border-ink-900/5"
              >
                See all results for "{query}"
              </button>
            </>
          )}
        </div>
      )}

      {!onCityClick && locationOpen && <LocationModal onClose={() => setLocationOpen(false)} />}
    </div>
  );
}
