import { Link } from "react-router-dom";
import { LifeBuoy, Ticket, ListChecks } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const FAQS = [
  {
    q: "How do I track my order?",
    a: "Open your Dashboard and go to Order History. Every placed order shows its restaurant, items and current status.",
  },
  {
    q: "My order is late. What should I do?",
    a: "Delivery times are estimates. If your order is more than 15 minutes late, raise a ticket and our team will follow up with the restaurant.",
  },
  {
    q: "How do refunds work?",
    a: "Refunds for cancelled or incorrect orders are processed back to the original payment method within 5–7 business days.",
  },
  {
    q: "Can I order from two restaurants at once?",
    a: "A single cart holds items from one restaurant. Starting a new restaurant clears the current cart.",
  },
  {
    q: "How do offers apply?",
    a: "Offers shown on a restaurant card are applied by the restaurant at checkout. Use the Offers menu to browse deals.",
  },
];

export default function HelpCenter() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-5 sm:px-8 w-full py-12">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-11 h-11 rounded-full bg-gold-600 text-white flex items-center justify-center">
            <LifeBuoy size={20} />
          </span>
          <h1 className="font-display text-3xl font-bold text-ink-900">Help Center</h1>
        </div>
        <p className="text-ink-300 mb-8">Answers to the most common RestoStack questions.</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <Link
            to="/support/new"
            className="bg-white rounded-2xl shadow-card p-5 hover:shadow-cardHover transition-shadow flex items-start gap-3"
          >
            <Ticket size={18} className="text-gold-600 mt-0.5" />
            <span>
              <span className="block font-semibold text-ink-900">Raise a Ticket</span>
              <span className="block text-sm text-ink-300">Tell us what went wrong and we'll take it from there.</span>
            </span>
          </Link>
          <Link
            to="/support/tickets"
            className="bg-white rounded-2xl shadow-card p-5 hover:shadow-cardHover transition-shadow flex items-start gap-3"
          >
            <ListChecks size={18} className="text-gold-600 mt-0.5" />
            <span>
              <span className="block font-semibold text-ink-900">My Tickets</span>
              <span className="block text-sm text-ink-300">Track the status of requests you've already raised.</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-card divide-y divide-ink-900/8">
          {FAQS.map((f) => (
            <details key={f.q} className="p-5 group">
              <summary className="cursor-pointer font-medium text-ink-900 list-none flex justify-between gap-4">
                {f.q}
                <span className="text-gold-600 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-ink-500 mt-2.5">{f.a}</p>
            </details>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
