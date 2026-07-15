import { useEffect, useState } from "react";
import { X, Check, RotateCcw } from "lucide-react";
import {
  QUICK_FILTERS,
  RATING_OPTIONS,
  DELIVERY_TIME_OPTIONS,
  COST_OPTIONS,
  DEFAULT_FILTERS,
  countActiveFilters,
} from "./filterConfig.js";

/**
 * Dedicated filter drawer, in the style of modern food-delivery apps
 * (Swiggy/Zomato/Uber Eats "Filters" sheet): slides in from the right,
 * holds its own staged copy of the filters so nothing on the page changes
 * until "Apply Filters" is pressed, and offers a separate "Reset" (back to
 * how the drawer opened) vs "Clear All" (back to no filters at all).
 */
export default function FilterDrawer({ filters, setFilters, cuisines, onClose }) {
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const toggle = (key) => setDraft((f) => ({ ...f, [key]: !f[key] }));
  const setSingle = (key, value) => setDraft((f) => ({ ...f, [key]: f[key] === value ? null : value }));
  const activeCount = countActiveFilters(draft);

  function apply() {
    setFilters(draft);
    onClose();
  }

  function reset() {
    // Back to whatever was already applied when the drawer opened —
    // distinct from "Clear All", which zeroes everything out.
    setDraft(filters);
  }

  function clearAll() {
    setDraft(DEFAULT_FILTERS);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-ink-900/50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white w-full max-w-sm h-full shadow-cardHover flex flex-col animate-fadeUp"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Filter restaurants"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-900/8 shrink-0">
          <h2 className="font-display text-lg font-bold text-ink-900">
            Filters {activeCount > 0 && <span className="text-gold-600">({activeCount})</span>}
          </h2>
          <button onClick={onClose} aria-label="Close filters" className="text-ink-300 hover:text-ink-900 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-7">
          <section>
            <h3 className="text-xs uppercase tracking-wide text-ink-300 font-semibold mb-3">Quick filters</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_FILTERS.map((q) => (
                <QuickFilterRow key={q.key} icon={q.icon} label={q.label} active={!!draft[q.key]} onClick={() => toggle(q.key)} />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs uppercase tracking-wide text-ink-300 font-semibold mb-3">Rating</h3>
            <OptionGrid options={RATING_OPTIONS} value={draft.minRating} onChange={(v) => setSingle("minRating", v)} />
          </section>

          <section>
            <h3 className="text-xs uppercase tracking-wide text-ink-300 font-semibold mb-3">Delivery time</h3>
            <OptionGrid
              options={DELIVERY_TIME_OPTIONS}
              value={draft.maxDeliveryTime}
              onChange={(v) => setSingle("maxDeliveryTime", v)}
            />
          </section>

          <section>
            <h3 className="text-xs uppercase tracking-wide text-ink-300 font-semibold mb-3">Cost for two</h3>
            <OptionGrid options={COST_OPTIONS} value={draft.maxCost} onChange={(v) => setSingle("maxCost", v)} />
          </section>

          <section>
            <h3 className="text-xs uppercase tracking-wide text-ink-300 font-semibold mb-3">Cuisine</h3>
            <div className="flex flex-wrap gap-2">
              {cuisines.map((c) => (
                <button
                  key={c}
                  onClick={() => setSingle("cuisine", c)}
                  aria-pressed={draft.cuisine === c}
                  className={`px-3.5 py-2 rounded-full border text-sm font-medium transition-colors ${
                    draft.cuisine === c
                      ? "bg-gold-600 border-gold-600 text-white"
                      : "bg-white border-ink-900/15 text-ink-700 hover:border-gold-600"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="px-5 py-4 border-t border-ink-900/8 shrink-0 space-y-2.5">
          <button
            onClick={apply}
            className="w-full bg-gold-600 hover:bg-gold-700 text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            Apply Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
          <div className="flex items-center gap-2.5">
            <button
              onClick={reset}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-ink-700 hover:bg-cream-100 py-2.5 rounded-xl transition-colors border border-ink-900/10"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              onClick={clearAll}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 py-2.5 rounded-xl transition-colors border border-ink-900/10"
            >
              <X size={14} /> Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickFilterRow({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-colors ${
        active ? "bg-gold-600 border-gold-600 text-white" : "bg-white border-ink-900/15 text-ink-700 hover:border-gold-600"
      }`}
    >
      <Icon size={15} className={active ? "text-white" : "text-gold-600"} />
      <span className="flex-1 truncate">{label}</span>
      {active && <Check size={14} className="shrink-0" />}
    </button>
  );
}

function OptionGrid({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`px-3.5 py-2 rounded-full border text-sm font-medium transition-colors ${
            value === o.value
              ? "bg-gold-600 border-gold-600 text-white"
              : "bg-white border-ink-900/15 text-ink-700 hover:border-gold-600"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
