import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Clock, MapPin, ChevronDown, Leaf, Drumstick, Award, Star, Wallet, X, SearchX, Check, Heart } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import DishCard from "../components/DishCard.jsx";
import StarRating from "../components/StarRating.jsx";
import Thumbnail from "../components/Thumbnail.jsx";
import MenuSearchBar from "../components/MenuSearchBar.jsx";
import RestaurantReviews from "../components/RestaurantReviews.jsx";
import { FilterChip } from "../components/FilterBar.jsx";
import { EmptyState } from "../components/Misc.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useData } from "../context/DataContext.jsx";
import { UtensilsCrossed } from "lucide-react";

const MENU_SORTS = [
  { value: "default", label: "Recommended" },
  { value: "rating_desc", label: "Rating: High to Low" },
  { value: "rating_asc", label: "Rating: Low to High" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const MENU_QUICK_FILTERS = [
  { key: "veg", label: "Veg", icon: Leaf },
  { key: "nonVeg", label: "Non-Veg", icon: Drumstick },
  { key: "bestseller", label: "Bestseller", icon: Award },
  { key: "topRated", label: "Top Rated", icon: Star },
  { key: "budget", label: "Budget Friendly", icon: Wallet },
];

const DEFAULT_MENU_FILTERS = { veg: false, nonVeg: false, bestseller: false, topRated: false, budget: false, category: null };

export default function RestaurantDetail() {
  const { slug } = useParams();
  const { restaurants, loading } = useData();
  const restaurant = restaurants.find((r) => r.slug === slug);
  const { isSaved, toggle: toggleWishlist } = useWishlist();
  const [menuFilters, setMenuFilters] = useState(DEFAULT_MENU_FILTERS);
  const [menuSort, setMenuSort] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");

  const categoriesInMenu = useMemo(
    () => (restaurant ? [...new Set(restaurant.menu.map((d) => d.category))] : []),
    [restaurant]
  );

  // Filters (veg/bestseller/category/etc) and sort apply first, independent
  // of the search box, so toggling a filter while a search is active still
  // narrows correctly.
  const filteredMenu = useMemo(() => {
    if (!restaurant) return [];
    let list = [...restaurant.menu];
    if (menuFilters.veg) list = list.filter((d) => d.isVeg);
    if (menuFilters.nonVeg) list = list.filter((d) => !d.isVeg);
    if (menuFilters.bestseller) list = list.filter((d) => d.isBestseller);
    if (menuFilters.topRated) list = list.filter((d) => d.rating >= 4.5);
    if (menuFilters.budget) list = list.filter((d) => d.price <= 199);
    if (menuFilters.category) list = list.filter((d) => d.category === menuFilters.category);

    switch (menuSort) {
      case "rating_desc": list.sort((a, b) => b.rating - a.rating); break;
      case "rating_asc": list.sort((a, b) => a.rating - b.rating); break;
      case "price_asc": list.sort((a, b) => a.price - b.price); break;
      case "price_desc": list.sort((a, b) => b.price - a.price); break;
      default: break;
    }
    return list;
  }, [restaurant, menuFilters, menuSort]);

  // Restaurant-specific search: name, category, and description — applied
  // on top of the filtered/sorted list, so search narrows whatever the
  // filters already show. Pure client-side, no navigation, instant on
  // every keystroke.
  const searchedMenu = useMemo(() => {
    const q = menuQuery.trim().toLowerCase();
    if (!q) return filteredMenu;
    return filteredMenu.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
    );
  }, [filteredMenu, menuQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-ink-300">Loading…</div>
        <Footer />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <EmptyState title="Restaurant not found" subtitle="It may have been removed or the link is incorrect." />
        <Footer />
      </div>
    );
  }

  const toggle = (key) => setMenuFilters((f) => ({ ...f, [key]: !f[key] }));
  const activeFilterCount =
    MENU_QUICK_FILTERS.filter((q) => menuFilters[q.key]).length + (menuFilters.category ? 1 : 0);
  const anyFilterActive = activeFilterCount > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="relative h-64 sm:h-80">
        <Thumbnail
          src={restaurant.banner}
          alt={restaurant.name}
          aspect=""
          className="absolute inset-0 w-full h-full"
          imgClassName=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full max-w-7xl mx-auto px-5 sm:px-8 pb-6 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">{restaurant.name}</h1>
            <button
              onClick={() => toggleWishlist(restaurant.id)}
              aria-pressed={isSaved(restaurant.id)}
              aria-label={isSaved(restaurant.id) ? "Remove from wishlist" : "Save to wishlist"}
              className="bg-white/15 hover:bg-white/25 rounded-full p-2.5 transition-colors"
            >
              <Heart size={18} className={isSaved(restaurant.id) ? "fill-red-500 text-red-500" : "text-white"} />
            </button>
          </div>
          <p className="text-cream-100/80 text-sm mt-1.5">{restaurant.cuisines.join(", ")}</p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-5 sm:px-8 w-full">
        <div className="flex flex-wrap items-center gap-4 py-5 border-b border-ink-900/8 text-sm">
          <StarRating rating={restaurant.rating} reviewCount={restaurant.reviewCount} />
          <span className="inline-flex items-center gap-1.5 text-ink-500">
            <Clock size={14} /> {restaurant.deliveryTime} min delivery
          </span>
          <span className="text-ink-500">₹{restaurant.costForTwo} for two</span>
          <span className="inline-flex items-center gap-1.5 text-ink-500">
            <MapPin size={14} /> {restaurant.address}
          </span>
          {restaurant.hasOffer && (
            <span className="bg-gold-50 text-gold-700 font-semibold px-3 py-1 rounded-full text-xs">{restaurant.offerText}</span>
          )}
          {!restaurant.openNow && (
            <span className="bg-red-50 text-red-600 font-semibold px-3 py-1 rounded-full text-xs">Closed now</span>
          )}
        </div>

        <div className="py-5">
          <p className="text-xs uppercase tracking-wide text-ink-300 font-semibold mb-2">Popular dishes</p>
          <div className="flex flex-wrap gap-2">
            {restaurant.popularDishes.map((d) => (
              <span key={d} className="inline-flex items-center gap-1.5 bg-cream-100 px-3 py-1.5 rounded-full text-sm text-ink-700">
                <UtensilsCrossed size={12} className="text-gold-600" /> {d}
              </span>
            ))}
          </div>
        </div>

        <div className="sticky top-[72px] z-20 bg-cream-100/95 backdrop-blur supports-[backdrop-filter]:bg-cream-100/80 -mx-5 sm:-mx-8 px-5 sm:px-8 pt-4 pb-3 border-b border-ink-900/5">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3.5">
            <h2 className="font-display text-2xl font-bold text-ink-900">Menu</h2>
            <div className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium bg-white transition-colors ${
                  sortOpen ? "border-gold-600 ring-2 ring-gold-100" : "border-ink-900/15 hover:border-gold-600"
                }`}
              >
                Sort: {MENU_SORTS.find((s) => s.value === menuSort).label}
                <ChevronDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 z-30 mt-2 w-52 bg-white rounded-xl shadow-cardHover border border-ink-900/5 overflow-hidden animate-fadeUp">
                  {MENU_SORTS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => { setMenuSort(s.value); setSortOpen(false); }}
                      className={`w-full flex items-center justify-between text-left px-4 py-2.5 text-sm hover:bg-cream-100 ${s.value === menuSort ? "text-gold-600 font-semibold" : "text-ink-900"}`}
                    >
                      {s.label}
                      {s.value === menuSort && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-3.5">
            <MenuSearchBar
              query={menuQuery}
              onChange={setMenuQuery}
              resultCount={searchedMenu.length}
              totalCount={restaurant.menu.length}
            />
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center bg-gold-600 text-white text-[11px] font-bold rounded-full w-5 h-5 shrink-0">
                {activeFilterCount}
              </span>
            )}
            {MENU_QUICK_FILTERS.map((f) => (
              <FilterChip key={f.key} label={f.label} icon={f.icon} active={menuFilters[f.key]} onClick={() => toggle(f.key)} />
            ))}
            <div className="w-px h-6 bg-ink-900/10 shrink-0" />
            {categoriesInMenu.map((c) => (
              <FilterChip
                key={c}
                label={c}
                active={menuFilters.category === c}
                onClick={() => setMenuFilters((f) => ({ ...f, category: f.category === c ? null : c }))}
              />
            ))}
            {anyFilterActive && (
              <button
                onClick={() => setMenuFilters(DEFAULT_MENU_FILTERS)}
                className="inline-flex items-center gap-1 text-sm text-red-600 font-semibold shrink-0 px-3 py-2.5 rounded-full hover:bg-red-50 transition-colors"
              >
                <X size={14} /> Clear All
              </button>
            )}
          </div>
        </div>

        <div className="pt-6">
          {searchedMenu.length === 0 ? (
            menuQuery ? (
              <EmptyState
                icon={SearchX}
                title="No matching dishes found"
                subtitle={`Nothing on the menu matches "${menuQuery}". Try a different dish, category, or description keyword.`}
                action={
                  <button
                    onClick={() => setMenuQuery("")}
                    className="mt-4 px-5 py-2.5 rounded-full bg-gold-600 hover:bg-gold-700 text-white font-semibold text-sm transition-colors"
                  >
                    Clear search
                  </button>
                }
              />
            ) : (
              <EmptyState
                title="No dishes match these filters"
                subtitle="Try clearing a filter to see the full menu."
                action={
                  <button
                    onClick={() => setMenuFilters(DEFAULT_MENU_FILTERS)}
                    className="mt-4 px-5 py-2.5 rounded-full bg-gold-600 hover:bg-gold-700 text-white font-semibold text-sm transition-colors"
                  >
                    Clear filters
                  </button>
                }
              />
            )
          ) : (
            <div className="pb-16">
              {searchedMenu.map((dish) => (
                <DishCard key={dish.id} dish={dish} restaurant={restaurant} highlightQuery={menuQuery} />
              ))}
            </div>
          )}
        </div>

        <RestaurantReviews restaurant={restaurant} />
      </main>
      <Footer />
    </div>
  );
}
