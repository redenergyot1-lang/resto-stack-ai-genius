import { Leaf, Drumstick, Zap, Tag, Star, TrendingUp, Sparkles, Award } from "lucide-react";

// Single source of truth for the restaurant-listing filters — shared by
// FiltersButton (the trigger + active-count pill) and FilterDrawer (the
// actual modal UI) so the two never drift out of sync.
export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating_desc", label: "Rating: High to Low" },
  { value: "rating_asc", label: "Rating: Low to High" },
  { value: "delivery_time", label: "Fastest Delivery" },
  { value: "cost_asc", label: "Cost: Low to High" },
  { value: "cost_desc", label: "Cost: High to Low" },
];

export const RATING_OPTIONS = [
  { value: "4.5", label: "4.5+ Rating" },
  { value: "4.0", label: "4.0+ Rating" },
  { value: "3.5", label: "3.5+ Rating" },
];

export const DELIVERY_TIME_OPTIONS = [
  { value: "20", label: "Under 20 min" },
  { value: "30", label: "Under 30 min" },
  { value: "45", label: "Under 45 min" },
];

export const COST_OPTIONS = [
  { value: "200", label: "Under ₹200" },
  { value: "400", label: "Under ₹400" },
  { value: "600", label: "Under ₹600" },
];

// Quick-toggle filters shown as checkable rows inside the drawer. Covers
// every item called out in the spec: Veg Only, Non-Veg, Offers, Open Now,
// Fast Delivery, Most Ordered, Newly Added, Top Rated.
export const QUICK_FILTERS = [
  { key: "vegOnly", label: "Veg Only", icon: Leaf },
  { key: "nonVeg", label: "Non-Veg", icon: Drumstick },
  { key: "offers", label: "Offers", icon: Tag },
  { key: "openNow", label: "Open Now", icon: Zap },
  { key: "fastDelivery", label: "Fast Delivery", icon: TrendingUp },
  { key: "mostOrdered", label: "Most Ordered", icon: Award },
  { key: "newlyAdded", label: "Newly Added", icon: Sparkles },
  { key: "topRated", label: "Top Rated", icon: Star },
];

export const DEFAULT_FILTERS = {
  vegOnly: false,
  nonVeg: false,
  openNow: false,
  offers: false,
  topRated: false,
  mostOrdered: false,
  fastDelivery: false,
  newlyAdded: false,
  cuisine: null,
  minRating: null,
  maxDeliveryTime: null,
  maxCost: null,
};

export function countActiveFilters(filters) {
  return (
    QUICK_FILTERS.filter((q) => filters[q.key]).length +
    (filters.cuisine ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.maxDeliveryTime ? 1 : 0) +
    (filters.maxCost ? 1 : 0)
  );
}
