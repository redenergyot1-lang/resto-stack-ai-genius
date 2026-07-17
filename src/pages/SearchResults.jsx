import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SearchX, MapPin } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import SearchBar from "../components/SearchBar.jsx";
import RestaurantCard from "../components/RestaurantCard.jsx";
import VegBadge from "../components/VegBadge.jsx";
import Thumbnail from "../components/Thumbnail.jsx";
import { EmptyState } from "../components/Misc.jsx";
import { useDeliveryLocation } from "../context/LocationContext.jsx";
import { useData } from "../context/DataContext.jsx";
import { highlightMatch } from "../utils/highlight.jsx";

export default function SearchResults() {
  const [params] = useSearchParams();
  const { city, hasCoverage } = useDeliveryLocation();
  const { restaurants, allMenuItems, allCuisines } = useData();
  const q = (params.get("q") || "").trim();
  const ql = q.toLowerCase();

  const cityHasRestaurants = useMemo(() => restaurants.some((r) => r.city === city), [city, restaurants]);
  const showingFallback = hasCoverage === false || !cityHasRestaurants;
  const scopedRestaurants = showingFallback ? restaurants : restaurants.filter((r) => r.city === city);
  const scopedDishes = useMemo(
    () => allMenuItems.filter((d) => scopedRestaurants.some((r) => r.slug === d.restaurantSlug)),
    [scopedRestaurants, allMenuItems]
  );

  const matchedCuisines = useMemo(
    () => (ql ? allCuisines.filter((c) => c.name.toLowerCase().includes(ql)) : []),
    [ql, allCuisines]
  );

  const matchedRestaurants = useMemo(
    () =>
      ql
        ? scopedRestaurants.filter(
            (r) => r.name.toLowerCase().includes(ql) || r.cuisines.some((c) => c.toLowerCase().includes(ql))
          )
        : [],
    [ql, scopedRestaurants]
  );

  const matchedDishes = useMemo(
    () =>
      ql
        ? scopedDishes.filter(
            (d) =>
              d.name.toLowerCase().includes(ql) ||
              d.category.toLowerCase().includes(ql) ||
              d.restaurantName.toLowerCase().includes(ql)
          )
        : [],
    [ql, scopedDishes]
  );

  const isEmpty = matchedRestaurants.length === 0 && matchedDishes.length === 0 && matchedCuisines.length === 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-5 sm:px-8 w-full py-8">
        <div className="max-w-2xl mb-8">
          <SearchBar variant="compact" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-1">
          Results for "{q}"
        </h1>
        <p className="text-sm text-ink-300 mb-3">
          {matchedCuisines.length > 0 && `${matchedCuisines.length} cuisines · `}
          {matchedRestaurants.length} restaurants · {matchedDishes.length} dishes
          {!showingFallback && <> in {city}</>}
        </p>
        {showingFallback && (
          <div className="flex items-start gap-3 bg-gold-50 border border-gold-100 rounded-2xl p-4 mb-6 text-sm text-ink-700">
            <MapPin size={16} className="text-gold-600 shrink-0 mt-0.5" />
            <span>
              No partner restaurants in <strong>{city}</strong> yet — searching across all cities instead.
            </span>
          </div>
        )}

        {isEmpty ? (
          <EmptyState
            icon={SearchX}
            title={`No results for "${q}"`}
            subtitle="Try a different dish, cuisine, or restaurant name."
          />
        ) : (
          <div className="space-y-12">
            {matchedCuisines.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-bold text-ink-900 mb-5">Cuisines</h2>
                <div className="flex flex-wrap gap-4">
                  {matchedCuisines.map((c) => (
                    <Link
                      key={c.name}
                      to={`/restaurants?cuisine=${encodeURIComponent(c.name)}`}
                      className="flex items-center gap-3 bg-white rounded-xl p-3 pr-5 shadow-card hover:shadow-cardHover transition-shadow"
                    >
                      <Thumbnail src={c.image} alt={c.name} aspect="aspect-square" rounded="rounded-lg" className="w-12 shrink-0" />
                      <div>
                        <p className="font-medium text-ink-900 text-sm">{highlightMatch(c.name, q)}</p>
                        <p className="text-xs text-ink-300">{c.count} restaurants</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {matchedRestaurants.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-bold text-ink-900 mb-5">Restaurants</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchedRestaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
                </div>
              </section>
            )}
            {matchedDishes.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-bold text-ink-900 mb-5">Dishes</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matchedDishes.map((d) => (
                    <Link
                      key={d.id}
                      to={`/restaurant/${d.restaurantSlug}`}
                      className="flex gap-3 bg-white rounded-xl p-3.5 shadow-card hover:shadow-cardHover transition-shadow"
                    >
                      <Thumbnail src={d.image} alt={d.name} aspect="aspect-square" rounded="rounded-lg" className="w-16 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <VegBadge isVeg={d.isVeg} size={12} />
                          <p className="font-medium text-ink-900 text-sm truncate">{highlightMatch(d.name, q)}</p>
                        </div>
                        <p className="text-xs text-ink-300 truncate">at {d.restaurantName}</p>
                        <p className="text-sm font-semibold text-ink-700 mt-1">₹{d.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
