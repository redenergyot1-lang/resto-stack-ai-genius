import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook } from "lucide-react";

const SOCIAL_LINKS = [
  { Icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { Icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { Icon: Facebook, label: "Facebook", href: "https://facebook.com" },
];

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-cream-100 mt-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-2 sm:grid-cols-4 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <img src="/logo-mark.png" alt="" className="w-9 h-9 rounded-full object-cover ring-1 ring-white/15" />
            <span className="font-display text-xl font-bold text-gold-300">RestoStack</span>
          </div>
          <p className="text-sm text-cream-100/60 max-w-xs">
            Curated menus from the city's most exclusive restaurants, delivered to your door.
          </p>
          <div className="flex items-center gap-3 mt-5">
            {SOCIAL_LINKS.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`RestoStack on ${label}`}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold-600 transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="font-semibold mb-3 text-sm">Company</p>
          <ul className="space-y-2 text-sm text-cream-100/60">
            <li><Link to="/info/about" className="hover:text-gold-300">About us</Link></li>
            <li><Link to="/info/careers" className="hover:text-gold-300">Careers</Link></li>
            <li><Link to="/info/partner" className="hover:text-gold-300">Partner with us</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3 text-sm">Support</p>
          <ul className="space-y-2 text-sm text-cream-100/60">
            <li><Link to="/dashboard" className="hover:text-gold-300">Raise a ticket</Link></li>
            <li><Link to="/info/refunds" className="hover:text-gold-300">Refunds &amp; cancellations</Link></li>
            <li><Link to="/contact" className="hover:text-gold-300">Contact us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-cream-100/40">
        © {new Date().getFullYear()} RestoStack. All rights reserved.
      </div>
    </footer>
  );
}
