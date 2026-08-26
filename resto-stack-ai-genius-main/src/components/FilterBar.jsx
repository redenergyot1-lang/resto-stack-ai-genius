import { Check } from "lucide-react";

// Only FilterChip survives here — the restaurant-listing filter row this
// file used to export (FilterBar, SortDropdown, RATING_OPTIONS, etc.) has
// been replaced by the dedicated Filters button + drawer
// (FiltersButton.jsx / FilterDrawer.jsx / filterConfig.js). FilterChip
// itself is still used by RestaurantDetail's per-restaurant menu filter
// row (Veg / Bestseller / category chips), which is a separate feature
// from the listing filters and is left as-is.

/**
 * Premium pill chip. Active state shows a check mark and filled gold
 * background; an optional icon gives the chip more visual identity at a
 * glance (veg leaf, lightning for fast delivery, etc) in the style of
 * Swiggy / Uber Eats filter rows.
 */
export function FilterChip({ label, active, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-sm font-medium whitespace-nowrap transition-all duration-200 ${
        active
          ? "bg-gold-600 border-gold-600 text-white shadow-sm"
          : "bg-white border-ink-900/15 text-ink-700 hover:border-gold-600 hover:bg-gold-50/60"
      }`}
    >
      {Icon && <Icon size={14} className={active ? "text-white" : "text-gold-600"} />}
      {label}
      {active && <Check size={13} className="ml-0.5" />}
    </button>
  );
}
