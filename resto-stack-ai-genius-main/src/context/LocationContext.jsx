import { createContext, useContext, useEffect, useState } from "react";
import { INDIAN_CITIES, DEFAULT_CITY } from "../data/cities.js";

// Session-only by design ("remember during session") — sessionStorage
// clears when the tab/browser closes, unlike CartContext/AuthContext which
// use localStorage for longer-lived state. Mirrors a real
// `GET/PUT /api/users/me/location`-style API later: the shape here
// (`{ city }`) is intentionally minimal so swapping in a server call is a
// drop-in change.
const LocationContext = createContext(null);
const STORAGE_KEY = "restostack_location";

export function LocationProvider({ children }) {
  const [city, setCityState] = useState(DEFAULT_CITY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored && INDIAN_CITIES.some((c) => c.name === stored)) {
        setCityState(stored);
      }
    } catch {
      /* ignore unavailable sessionStorage (e.g. privacy mode) */
    }
    setHydrated(true);
  }, []);

  function setCity(cityName) {
    setCityState(cityName);
    try {
      sessionStorage.setItem(STORAGE_KEY, cityName);
    } catch {
      /* ignore */
    }
  }

  // Restaurants actually exist for a fixed set of cities in the mock
  // catalog; everything else in INDIAN_CITIES is selectable (a real app
  // would just return zero results from the API) but won't have any
  // listings — `hasCoverage` lets the UI show a friendly "not yet" state
  // instead of pretending the catalog covers every town.
  const cityMeta = INDIAN_CITIES.find((c) => c.name === city);
  const hasCoverage = !!cityMeta?.covered;

  return (
    <LocationContext.Provider value={{ city, setCity, hasCoverage, hydrated }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useDeliveryLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useDeliveryLocation must be used within LocationProvider");
  return ctx;
}
