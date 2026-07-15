import { Search, X } from "lucide-react";

/**
 * Dedicated search box for a single restaurant's menu. Unlike the global
 * SearchBar, this never navigates anywhere — it just drives a controlled
 * `query` value that the parent page uses to instantly filter the menu
 * list (name, category, and description), so results update on every
 * keystroke with no page reload and no dropdown overlay.
 */
export default function MenuSearchBar({ query, onChange, resultCount, totalCount }) {
  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2.5 rounded-xl bg-white border transition-colors ${
          query ? "border-gold-600 ring-2 ring-gold-100" : "border-ink-900/12"
        }`}
      >
        <Search size={17} className="text-ink-300 ml-4 shrink-0" />
        <input
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search this menu for a dish, category, or description"
          aria-label="Search this restaurant's menu"
          className="w-full py-3 pr-3 bg-transparent outline-none text-sm placeholder:text-ink-300"
        />
        {query && (
          <button
            onClick={() => onChange("")}
            aria-label="Clear menu search"
            className="mr-2 p-1.5 rounded-full text-ink-300 hover:text-ink-700 hover:bg-cream-100 transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        )}
      </div>
      {query && (
        <p className="text-xs text-ink-300 mt-1.5 ml-1">
          {resultCount === 0
            ? `No matches in ${totalCount} dishes`
            : `${resultCount} of ${totalCount} dishes match "${query}"`}
        </p>
      )}
    </div>
  );
}
