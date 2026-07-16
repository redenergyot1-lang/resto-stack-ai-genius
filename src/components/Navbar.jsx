import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, LogOut, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import LocationModal from "./LocationModal.jsx";

// Navbar is always a dark "ink" surface now (in `transparent` mode it sits
// directly on the hero photo instead of a solid fill) so the gold wordmark
// and crest logo always render against a near-black backdrop — matching
// the footer's treatment — instead of gold-on-cream, which is what made
// the brand mark hard to read.
export default function Navbar({ transparent = false }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { totals } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 ${
        transparent
          ? "absolute w-full bg-gradient-to-b from-ink-900/85 via-ink-900/55 to-transparent backdrop-blur-[2px]"
          : "bg-ink-900 border-b border-white/10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between gap-3 sm:gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo-mark.png" alt="" className="w-10 h-10 rounded-full object-cover ring-1 ring-white/15 shrink-0" />
          <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-gold-300">
            RestoStack
          </span>
        </Link>

        <button
          onClick={() => setLocationOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white/90 hover:bg-white/10 transition-colors min-w-0 max-w-[220px]"
        >
          <MapPin size={16} className="text-gold-300 shrink-0" />
          <span className="text-sm font-medium truncate">{city}</span>
          <ChevronDown size={14} className="text-white/60 shrink-0" />
        </button>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={() => setLocationOpen(true)}
            className="md:hidden p-2 rounded-full text-white hover:bg-white/10 transition-colors"
            aria-label={`Delivery location: ${city}. Change location`}
          >
            <MapPin size={20} />
          </button>

          <button
            onClick={() => navigate("/restaurants")}
            className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
            aria-label="Search restaurants, dishes and cuisines"
          >
            <Search size={20} />
          </button>

          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 rounded-full text-white hover:bg-white/10 transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {totals.itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold-300 text-ink-900 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                {totals.itemCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-gold-300 text-ink-900 font-semibold text-sm hover:bg-gold-100 transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-ink-900/15 flex items-center justify-center text-xs">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </span>
                <span className="hidden sm:inline">{user?.name?.split(" ")[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-cardHover border border-ink-900/5 overflow-hidden animate-fadeUp">
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-cream-100 text-ink-900"
                  >
                    <User size={16} /> Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      navigate("/");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-cream-100 text-red-600 border-t border-ink-900/5"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 rounded-full bg-gold-300 hover:bg-gold-100 text-ink-900 font-semibold text-sm transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {locationOpen && <LocationModal onClose={() => setLocationOpen(false)} />}
    </header>
  );
}
