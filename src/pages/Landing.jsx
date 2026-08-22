import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { Star, Clock, Store, MapPin } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import SearchBar from "../components/SearchBar.jsx";
import RestaurantCard from "../components/RestaurantCard.jsx";
import { CategoryCircle, EmptyState } from "../components/Misc.jsx";
import LocationModal from "../components/LocationModal.jsx";
import { useDeliveryLocation } from "../context/LocationContext.jsx";
import { useData } from "../context/DataContext.jsx";

export default function Landing() {
  const { city, hasCoverage } = useDeliveryLocation();
  const { restaurants, categories } = useData();
  const [locationOpen, setLocationOpen] = useState(false);
  const { hash } = useLocation();

  // Navbar "Cuisines" link points at /#cuisines — scroll to the section
  // when the hash is present (including navigations from other pages).
  useEffect(() => {
    if (hash !== "#cuisines") return;
    const el = document.getElementById("cuisines");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash, categories]);


  // Restaurant listings update to the selected delivery city. When the
  // chosen city has no partners yet (most of INDIAN_CITIES — only the 10
  // "covered" cities have catalog data) we fall back to showing the full
  // catalog with a callout, rather than rendering a dead, empty homepage.
  const cityRestaurants = useMemo(
    () => restaurants.filter((r) => r.city === city),
    [city, restaurants]
  );
  const showingFallback = hasCoverage === false || cityRestaurants.length === 0;
  const baseList = showingFallback ? restaurants : cityRestaurants;

  const topRated = useMemo(
    () => [...baseList].sort((a, b) => b.rating - a.rating).slice(0, 8),
    [baseList]
  );
  const offers = useMemo(() => baseList.filter((r) => r.hasOffer).slice(0, 8), [baseList]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative">
        <Navbar transparent />
        <div className="relative min-h-[640px] flex items-center overflow-hidden">
          <img
            src="https://placehold.co/1600x900/1C1A16/1C1A16/png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-0"
          />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(110deg, rgba(20,18,14,0.92) 0%, rgba(20,18,14,0.75) 45%, rgba(20,18,14,0.35) 100%), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=60')",
            }}
          />
          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full pt-20 pb-16">
            <div className="max-w-xl">
              <button
                onClick={() => setLocationOpen(true)}
                className="inline-flex items-center gap-2 text-gold-300 text-sm font-medium mb-5 hover:text-gold-100 transition-colors"
              >
                <MapPin size={14} /> Delivering to {city}
                <span className="underline underline-offset-2 text-cream-100/70">Change</span>
              </button>
              <h1 className="font-display text-5xl sm:text-6xl font-bold text-white leading-[1.08]">
                Experience <span className="text-gold-300 italic">fine dining</span> at home.
              </h1>
              <p className="text-cream-100/70 text-base sm:text-lg mt-5">
                Curated menus from {city}'s most exclusive restaurants.
              </p>
              <div className="mt-8">
                <SearchBar variant="hero" city={city} onCityClick={() => setLocationOpen(true)} />
              </div>
              <div className="flex items-center gap-6 mt-7 text-sm text-cream-100/80">
                <span className="inline-flex items-center gap-1.5">
                  <Star size={15} className="text-gold-300 fill-gold-300" /> 4.8 avg rating
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={15} className="text-gold-300" /> 30 min avg delivery
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Store size={15} className="text-gold-300" /> {restaurants.length} partner restaurants
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-5 sm:px-8 w-full">
        <section id="cuisines" className="py-16 scroll-mt-24">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-10">Culinary Journeys</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-10">
            {categories.map((c) => (
              <CategoryCircle key={c.name} category={c} />
            ))}
          </div>
        </section>

        {showingFallback && (
          <div className="flex items-start gap-3 bg-gold-50 border border-gold-100 rounded-2xl p-4 mb-2 text-sm text-ink-700">
            <MapPin size={16} className="text-gold-600 shrink-0 mt-0.5" />
            <span>
              We don't have partner restaurants in <strong>{city}</strong> just yet — showing top picks from
              across India instead.{" "}
              <button onClick={() => setLocationOpen(true)} className="text-gold-600 font-semibold underline">
                Change location
              </button>
            </span>
          </div>
        )}

        <section className="py-10">
          <div className="flex items-center justify-between mb-7">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
              {showingFallback ? "Top rated across India" : `Top rated in ${city}`}
            </h2>
            <Link to="/restaurants?sort=rating_desc" className="text-gold-600 font-semibold text-sm hover:underline">
              View all
            </Link>
          </div>
          {topRated.length === 0 ? (
            <EmptyState title="No restaurants here yet" subtitle="Try another city to see what's available." />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topRated.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          )}
        </section>

        <section className="py-10 pb-20">
          <div className="flex items-center justify-between mb-7">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">Offers for you</h2>
            <Link to="/restaurants?offers=1" className="text-gold-600 font-semibold text-sm hover:underline">
              View all
            </Link>
          </div>
          {offers.length === 0 ? (
            <EmptyState title="No active offers right now" subtitle="Check back soon for new deals." />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {offers.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
      {locationOpen && <LocationModal onClose={() => setLocationOpen(false)} />}
    </div>
  );
}
