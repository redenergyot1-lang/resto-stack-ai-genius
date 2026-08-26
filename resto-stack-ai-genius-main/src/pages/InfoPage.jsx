import { useParams, Navigate, Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

// Lightweight static content for the footer's "Company"/"Support" links
// (About us, Careers, Partner with us, Refunds & cancellations, Contact
// us) so every footer link goes somewhere real instead of a dead `href="#"`
// — without inventing a full CMS or new design system for what is, on a
// real food-delivery site, mostly boilerplate informational copy.
const PAGES = {
  about: {
    title: "About RestoStack",
    body: [
      "RestoStack connects you with the finest restaurants in your city, bringing restaurant-quality meals straight to your door.",
      "We started with a simple idea: great food deserves a great delivery experience. From curated menus to real-time order tracking, every part of RestoStack is built around that promise.",
    ],
  },
  careers: {
    title: "Careers at RestoStack",
    body: [
      "We're a small team obsessed with food, technology, and great customer experiences — and we're always looking for people who share that obsession.",
      "We don't have any open roles listed right now, but we're happy to hear from you. Reach out via the contact page and tell us what you'd love to work on.",
    ],
  },
  partner: {
    title: "Partner with RestoStack",
    body: [
      "Own a restaurant and want to reach more diners? RestoStack partners get a dedicated storefront, menu management tools, and access to our delivery network.",
      "Tell us a bit about your restaurant via the contact page and our partnerships team will follow up with onboarding details.",
    ],
  },
  refunds: {
    title: "Refunds & Cancellations",
    body: [
      "Orders can be cancelled free of charge before a restaurant accepts them. Once an order is being prepared, cancellation is at the restaurant's discretion and may incur a partial charge.",
      "If an order arrives incorrect, incomplete, or significantly delayed, raise a support ticket from your dashboard with your order ID — most refund requests are resolved within 3–5 business days.",
    ],
  },
};

export function InfoPage() {
  const { slug } = useParams();
  const page = PAGES[slug];
  if (!page) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-5 sm:px-8 w-full py-14">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-6">{page.title}</h1>
        <div className="space-y-4 text-ink-700 leading-relaxed">
          {page.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-5 sm:px-8 w-full py-14">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-3">Contact us</h1>
        <p className="text-ink-300 mb-8">
          Have a question about an order, a partnership, or anything else? Reach us through any of the channels
          below, or{" "}
          <Link to="/dashboard" className="text-gold-600 font-semibold hover:underline">
            raise a support ticket
          </Link>{" "}
          from your dashboard for order-specific issues.
        </p>
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white rounded-xl shadow-card p-4">
            <span className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center shrink-0">
              <Mail size={18} className="text-gold-600" />
            </span>
            <div>
              <p className="text-xs text-ink-300">Email</p>
              <p className="font-medium text-ink-900">support@restostack.in</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl shadow-card p-4">
            <span className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-gold-600" />
            </span>
            <div>
              <p className="text-xs text-ink-300">Phone</p>
              <p className="font-medium text-ink-900">1800-123-4567 (toll-free, 9am–9pm IST)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl shadow-card p-4">
            <span className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-gold-600" />
            </span>
            <div>
              <p className="text-xs text-ink-300">Registered office</p>
              <p className="font-medium text-ink-900">RestoStack Technologies, Bengaluru, India</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
