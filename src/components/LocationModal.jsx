import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Search, X, Check, Navigation } from "lucide-react";
import { INDIAN_CITIES } from "../data/cities.js";
import { useDeliveryLocation } from "../context/LocationContext.jsx";

/**
 * Full city search + select modal, in the same visual language as
 * ReviewModal (centered overlay, click-outside-to-close, animate-fadeUp).
 * Covered cities (the 10 with real restaurants in the mock catalog) are
 * shown first so the common case is one tap away; everything else in
 * INDIAN_CITIES is still searchable/selectable.
 */
export default function LocationModal({ onClose }) {
  const { city, setCity } = useDeliveryLocation();
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? INDIAN_CITIES.filter(
          (c) => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
        )
      : INDIAN_CITIES;
    // Covered (serviceable) cities first, then alphabetical within each group.
    return [...list].sort((a, b) => {
      if (!!a.covered !== !!b.covered) return a.covered ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [query]);

  const covered = results.filter((c) => c.covered);
  const others = results.filter((c) => !c.covered);

  function choose(cityName) {
    setCity(cityName);
    onClose();
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocateError("Location access isn't available in this browser.");
      return;
    }
    setLocating(true);
    setLocateError("");
    navigator.geolocation.getCurrentPosition(
      () => {
        // We deliberately don't call a third-party reverse-geocoding API
        // here (no key configured in this environment) — once one is
        // wired in, swap this block for a lookup from {latitude,
        // longitude} to a city name and call setCity(resolvedCity).
        setLocating(false);
        setLocateError("Got your location — search for your city below to confirm it.");
        inputRef.current?.focus();
      },
      (err) => {
        setLocating(false);
        setLocateError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was denied — search for your city instead."
            : "Couldn't detect your location — search for your city instead."
        );
      },
      { timeout: 8000 }
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-ink-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-cardHover animate-fadeUp overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="font-display text-lg font-bold text-ink-900">Choose delivery location</h3>
          <button onClick={onClose} aria-label="Close" className="text-ink-300 hover:text-ink-900">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-ink-900/15 focus-within:border-gold-600 transition-colors">
            <Search size={16} className="text-ink-300 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for your city or town"
              className="w-full outline-none text-sm bg-transparent"
            />
          </div>
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="w-full mt-2.5 flex items-center gap-2 text-sm font-semibold text-gold-600 hover:bg-gold-50/60 rounded-xl px-3.5 py-2.5 transition-colors disabled:opacity-60"
          >
            <Navigation size={15} className={locating ? "animate-pulse" : ""} />
            {locating ? "Detecting your location…" : "Use current location"}
          </button>
          {locateError && <p className="text-xs text-ink-300 px-3.5 mt-1">{locateError}</p>}
        </div>

        <div className="overflow-y-auto px-2 pb-3 flex-1">
          {results.length === 0 ? (
            <div className="text-center py-10 px-5">
              <p className="font-display text-base text-ink-900">No cities found</p>
              <p className="text-sm text-ink-300 mt-1">Try a different spelling or nearby city name.</p>
            </div>
          ) : (
            <>
              {covered.length > 0 && (
                <div className="mb-1">
                  <p className="px-3.5 pt-2 pb-1 text-[11px] uppercase tracking-wide text-ink-300 font-semibold">
                    Popular cities
                  </p>
                  {covered.map((c) => (
                    <CityRow key={c.name} city={c} active={c.name === city} onClick={() => choose(c.name)} />
                  ))}
                </div>
              )}
              {others.length > 0 && (
                <div>
                  <p className="px-3.5 pt-2 pb-1 text-[11px] uppercase tracking-wide text-ink-300 font-semibold">
                    Other cities &amp; towns
                  </p>
                  {others.map((c) => (
                    <CityRow key={c.name} city={c} active={c.name === city} onClick={() => choose(c.name)} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CityRow({ city, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors ${
        active ? "bg-gold-50" : "hover:bg-cream-100"
      }`}
    >
      <MapPin size={16} className={active ? "text-gold-600" : "text-ink-300"} />
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-medium ${active ? "text-gold-600" : "text-ink-900"}`}>
          {city.name}
        </span>
        <span className="block text-xs text-ink-300">{city.state}</span>
      </span>
      {!city.covered && (
        <span className="text-[10px] text-ink-300 bg-cream-200 px-2 py-0.5 rounded-full shrink-0">
          Coming soon
        </span>
      )}
      {active && <Check size={15} className="text-gold-600 shrink-0" />}
    </button>
  );
}
