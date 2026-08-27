import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";

const LocationContext = createContext(null);
const STORAGE_KEY = "restostack_location";
const DEFAULT_CITY = "Mumbai";

export function LocationProvider({ children }) {
  const [city, setCityState] = useState(DEFAULT_CITY);
  const [cities, setCities] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.from("cities").select("*");
      const fetchedCities = data || [];
      setCities(fetchedCities);

      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored && fetchedCities.some((c) => c.name === stored)) {
          setCityState(stored);
        }
      } catch {
        // ignore
      }
      setHydrated(true);
    }
    init();
  }, []);

  function setCity(cityName) {
    setCityState(cityName);
    try {
      sessionStorage.setItem(STORAGE_KEY, cityName);
    } catch {
      // ignore
    }
  }

  const cityMeta = cities.find((c) => c.name === city);
  const hasCoverage = !!cityMeta?.covered;

  return (
    <LocationContext.Provider value={{ city, setCity, hasCoverage, hydrated, cities }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useDeliveryLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useDeliveryLocation must be used within LocationProvider");
  return ctx;
}
