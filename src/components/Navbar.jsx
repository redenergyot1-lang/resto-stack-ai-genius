import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, User, LogOut, Search, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const NAV_LINKS = [
  { label: "Cuisines", to: "/#cuisines" },
  { label: "Offers", to: "/restaurants?offers=1" },
  { label: "Support", to: "/contact" },
];



// Navbar sits directly on top of the hero image with no own background,
// border, or shadow so the hero flows continuously behind it.
export default function Navbar({ transparent = false }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { totals } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname, location.search, location.hash]);

  const linkClass =
    "relative px-3 py-2 text-sm font-medium text-cream-100/90 hover:text-gold-300 transition-colors duration-200 [text-shadow:0_1px_3px_rgba(0,0,0,0.65)] after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-px after:bg-gold-300 after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100";

  return (
    <header
      className={`top-0 z-50 ${
        transparent ? "absolute w-full bg-transparent" : "sticky bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between gap-3 sm:gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo-mark.png" alt="" className="w-10 h-10 rounded-full object-cover ring-1 ring-white/15 shrink-0" />
          <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-gold-300 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
            RestoStack
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} to={l.to} className={linkClass}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">

          <button
            onClick={() => navigate("/restaurants")}
            className="p-2 rounded-full text-cream-100 hover:text-gold-300 transition-colors [text-shadow:0_1px_3px_rgba(0,0,0,0.65)]"
            aria-label="Search restaurants, dishes and cuisines"
          >
            <Search size={20} />
          </button>

          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 rounded-full text-cream-100 hover:text-gold-300 transition-colors [text-shadow:0_1px_3px_rgba(0,0,0,0.65)]"
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

          <button
            onClick={() => setNavOpen((v) => !v)}
            className="md:hidden p-2 rounded-full text-cream-100 hover:text-gold-300 transition-colors [text-shadow:0_1px_3px_rgba(0,0,0,0.65)]"
            aria-label="Menu"
            aria-expanded={navOpen}
          >
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {navOpen && (
        <div className="md:hidden bg-ink-900/80 backdrop-blur-[2px] animate-fadeUp">
          <nav className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex flex-col">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setNavOpen(false)}
                className="py-3 text-sm font-medium text-cream-100/90 hover:text-gold-300 transition-colors border-b border-white/5 last:border-0 [text-shadow:0_1px_3px_rgba(0,0,0,0.65)]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>

  );
}
