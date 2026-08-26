import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, ChevronDown, Check, X } from "lucide-react";
import FilterDrawer from "./FilterDrawer.jsx";
import { SORT_OPTIONS, countActiveFilters, DEFAULT_FILTERS } from "./filterConfig.js";

/**
 * Dedicated "Filters" trigger (replacing the old always-visible inline
 * filter row) — a single button that shows the active-filter count and
 * opens the FilterDrawer modal, plus the existing sort dropdown alongside
 * it. Filtering still updates the listing instantly once Apply is pressed
 * inside the drawer; this component just owns the open/close state.
 */
export default function FiltersButton({ filters, setFilters, cuisines, sort, setSort }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <button
        onClick={() => setDrawerOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-colors ${
          activeCount > 0
            ? "bg-gold-600 border-gold-600 text-white"
            : "bg-white border-ink-900/15 text-ink-700 hover:border-gold-600"
        }`}
      >
        <SlidersHorizontal size={15} />
        Filters
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center bg-white text-gold-600 text-[11px] font-bold rounded-full w-5 h-5">
            {activeCount}
          </span>
        )}
      </button>

      {activeCount > 0 && (
        <button
          onClick={() => setFilters(DEFAULT_FILTERS)}
          className="inline-flex items-center gap-1 text-sm text-red-600 font-semibold px-3 py-2.5 rounded-full hover:bg-red-50 transition-colors"
        >
          <X size={14} /> Clear All
        </button>
      )}

      <SortDropdown value={sort} onChange={setSort} />

      {drawerOpen && (
        <FilterDrawer
          filters={filters}
          setFilters={setFilters}
          cuisines={cuisines}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}

export function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const current = SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-colors bg-white ${
          open ? "border-gold-600 ring-2 ring-gold-100" : "border-ink-900/15 hover:border-gold-600"
        }`}
      >
        Sort: {current.label} <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 sm:left-0 z-30 mt-2 w-56 bg-white rounded-xl shadow-cardHover border border-ink-900/5 overflow-hidden animate-fadeUp">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between text-left px-4 py-2.5 text-sm hover:bg-cream-100 ${
                o.value === value ? "text-gold-600 font-semibold" : "text-ink-900"
              }`}
            >
              {o.label}
              {o.value === value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
