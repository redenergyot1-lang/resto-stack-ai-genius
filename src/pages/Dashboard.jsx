import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  User, Package, MapPin, Heart, Star, Settings, LifeBuoy, Plus, Trash2, Check,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { EmptyState } from "../components/Misc.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useData } from "../context/DataContext.jsx";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Order History", icon: Package },
  { id: "addresses", label: "Saved Addresses", icon: MapPin },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "reviews", label: "My Reviews", icon: Star },
  { id: "support", label: "Support Tickets", icon: LifeBuoy },
  { id: "settings", label: "Account Settings", icon: Settings },
];

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("profile");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-5 sm:px-8 w-full py-10 grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-1">
          <div className="px-3 pb-4 mb-2 border-b border-ink-900/8">
            <p className="font-display font-bold text-lg text-ink-900">{user?.name}</p>
            <p className="text-xs text-ink-300 truncate">{user?.email}</p>
          </div>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id ? "bg-gold-600 text-white" : "text-ink-700 hover:bg-cream-200"
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </aside>

        <section>
          {tab === "profile" && <ProfileTab user={user} />}
          {tab === "orders" && <OrdersTab />}
          {tab === "addresses" && <AddressesTab />}
          {tab === "wishlist" && <WishlistTab />}
          {tab === "reviews" && <ReviewsTab />}
          {tab === "support" && <SupportTab />}
          {tab === "settings" && <SettingsTab user={user} />}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Card({ children }) {
  return <div className="bg-white rounded-2xl shadow-card p-6">{children}</div>;
}

function ProfileTab({ user }) {
  return (
    <Card>
      <h2 className="font-display text-xl font-bold text-ink-900 mb-5">Profile</h2>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gold-600 text-white flex items-center justify-center font-display text-2xl font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-ink-900">{user?.name}</p>
          <p className="text-sm text-ink-300">{user?.email}</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div><p className="text-ink-300 text-xs mb-1">Full name</p><p className="font-medium">{user?.name}</p></div>
        <div><p className="text-ink-300 text-xs mb-1">Email</p><p className="font-medium">{user?.email}</p></div>
        <div><p className="text-ink-300 text-xs mb-1">Phone</p><p className="font-medium">Not added</p></div>
        <div><p className="text-ink-300 text-xs mb-1">Member since</p><p className="font-medium">2026</p></div>
      </div>
    </Card>
  );
}

function OrdersTab() {
  if (MOCK_ORDERS.length === 0) {
    return <EmptyState icon={Package} title="No orders yet" subtitle="Your past orders will show up here." />;
  }
  return (
    <Card>
      <h2 className="font-display text-xl font-bold text-ink-900 mb-5">Order History</h2>
      <div className="divide-y divide-ink-900/8">
        {MOCK_ORDERS.map((o) => (
          <div key={o.id} className="flex items-center justify-between py-4 flex-wrap gap-2">
            <div>
              <p className="font-medium text-ink-900">{o.restaurant}</p>
              <p className="text-xs text-ink-300 mt-0.5">{o.id} · {o.items} items · {o.date}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-ink-900">₹{o.total}</p>
              <span
                className={`text-xs font-semibold ${o.status === "Delivered" ? "text-emerald-600" : "text-red-500"}`}
              >
                {o.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AddressesTab() {
  const [addresses, setAddresses] = useState(() =>
    loadJSON("restostack_addresses", [
      { id: 1, label: "Home", line: "402, Hibiscus Heights, Andheri West, Mumbai - 400053" },
    ])
  );
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ label: "", line: "" });

  useEffect(() => localStorage.setItem("restostack_addresses", JSON.stringify(addresses)), [addresses]);

  function addAddress(e) {
    e.preventDefault();
    if (!form.label.trim() || !form.line.trim()) return;
    setAddresses((a) => [...a, { id: Date.now(), ...form }]);
    setForm({ label: "", line: "" });
    setAdding(false);
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl font-bold text-ink-900">Saved Addresses</h2>
        <button onClick={() => setAdding((v) => !v)} className="inline-flex items-center gap-1.5 text-gold-600 font-semibold text-sm">
          <Plus size={15} /> Add new
        </button>
      </div>

      {adding && (
        <form onSubmit={addAddress} className="bg-cream-100 rounded-xl p-4 mb-5 space-y-2.5">
          <input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Label (e.g. Home, Work)"
            className="w-full px-3.5 py-2.5 rounded-lg border border-ink-900/15 text-sm outline-none focus:border-gold-600"
          />
          <textarea
            value={form.line}
            onChange={(e) => setForm({ ...form, line: e.target.value })}
            placeholder="Full address"
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-lg border border-ink-900/15 text-sm outline-none focus:border-gold-600 resize-none"
          />
          <button className="bg-gold-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">Save address</button>
        </form>
      )}

      {addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No saved addresses" subtitle="Add an address for faster checkout." />
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-3 border border-ink-900/8 rounded-xl p-4">
              <div>
                <p className="font-semibold text-ink-900 text-sm">{a.label}</p>
                <p className="text-sm text-ink-300 mt-0.5">{a.line}</p>
              </div>
              <button onClick={() => setAddresses((list) => list.filter((x) => x.id !== a.id))} className="text-ink-300 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function WishlistTab() {
  const { ids, remove } = useWishlist();
  const favourites = restaurants.filter((r) => ids.includes(r.id));
  return (
    <Card>
      <h2 className="font-display text-xl font-bold text-ink-900 mb-5">Wishlist</h2>
      {favourites.length === 0 ? (
        <EmptyState icon={Heart} title="Your wishlist is empty" subtitle="Tap the heart on a restaurant to save it here." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {favourites.map((r) => (
            <Link
              key={r.id}
              to={`/restaurant/${r.slug}`}
              className="flex items-center gap-3 border border-ink-900/8 rounded-xl p-3 hover:border-gold-600 transition-colors"
            >
              <img src={r.image} alt={r.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink-900 text-sm truncate">{r.name}</p>
                <p className="text-xs text-ink-300 truncate">{r.cuisines.join(", ")}</p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  remove(r.id);
                }}
                aria-label="Remove from wishlist"
                className="text-ink-300 hover:text-red-600 p-1.5 shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

function ReviewsTab() {
  const userReviews = loadJSON("restostack_user_reviews", {});
  const flat = Object.entries(userReviews).flatMap(([entityId, reviews]) =>
    reviews.map((r) => {
      // Dish ids look like "D123", restaurant ids look like "R12" — used
      // purely to label each review with what it was actually written for.
      const isRestaurant = entityId.startsWith("R");
      const restaurant = isRestaurant
        ? restaurants.find((rest) => rest.id === entityId)
        : restaurants.find((rest) => rest.menu.some((d) => d.id === entityId));
      const dish = isRestaurant ? null : restaurant?.menu.find((d) => d.id === entityId);
      return {
        ...r,
        entityId,
        subjectName: isRestaurant ? restaurant?.name : dish?.name,
        subjectKind: isRestaurant ? "Restaurant" : "Dish",
      };
    })
  );

  if (flat.length === 0) {
    return <EmptyState icon={Star} title="You haven't written any reviews" subtitle="Reviews you leave on restaurants and dishes will appear here." />;
  }
  return (
    <Card>
      <h2 className="font-display text-xl font-bold text-ink-900 mb-5">My Reviews</h2>
      <div className="space-y-3">
        {flat.map((r) => (
          <div key={r.id} className="border border-ink-900/8 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink-900 truncate">
                {r.subjectKind}: {r.subjectName || "Item no longer available"}
              </span>
              <span className="inline-flex items-center gap-1 text-gold-600 font-semibold text-sm shrink-0">
                <Star size={13} className="fill-gold-300 text-gold-300" /> {r.rating}
              </span>
            </div>
            <p className="text-sm text-ink-700 mt-1.5">{r.comment}</p>
            <p className="text-xs text-ink-300 mt-1.5">{new Date(r.date).toLocaleDateString("en-IN")}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SupportTab() {
  const [tickets, setTickets] = useState(() => loadJSON("restostack_tickets", []));
  const [form, setForm] = useState({ subject: "", category: "Order Issue", description: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => localStorage.setItem("restostack_tickets", JSON.stringify(tickets)), [tickets]);

  function submit(e) {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    const ticket = { id: `TKT${Math.floor(Math.random() * 90000 + 10000)}`, ...form, status: "Open", date: new Date().toISOString() };
    setTickets((t) => [ticket, ...t]);
    setForm({ subject: "", category: "Order Issue", description: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-xl font-bold text-ink-900 mb-5">Raise a Support Ticket</h2>
        {submitted && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm px-3.5 py-2.5 rounded-xl mb-4">
            <Check size={15} /> Ticket submitted — our team will get back to you within 24 hours.
          </div>
        )}
        <form onSubmit={submit} className="space-y-3.5">
          <input
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Subject"
            className="w-full px-3.5 py-2.5 rounded-lg border border-ink-900/15 text-sm outline-none focus:border-gold-600"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-ink-900/15 text-sm outline-none focus:border-gold-600 bg-white"
          >
            <option>Order Issue</option>
            <option>Refund Request</option>
            <option>Payment Problem</option>
            <option>Delivery Delay</option>
            <option>Other</option>
          </select>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the issue..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg border border-ink-900/15 text-sm outline-none focus:border-gold-600 resize-none"
          />
          <button className="bg-gold-600 hover:bg-gold-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
            Submit ticket
          </button>
        </form>
      </Card>

      <Card>
        <h3 className="font-display text-lg font-bold text-ink-900 mb-4">Your Tickets</h3>
        {tickets.length === 0 ? (
          <p className="text-sm text-ink-300">No tickets raised yet.</p>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between border border-ink-900/8 rounded-xl p-3.5">
                <div>
                  <p className="font-medium text-ink-900 text-sm">{t.subject}</p>
                  <p className="text-xs text-ink-300">{t.id} · {t.category}</p>
                </div>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{t.status}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function SettingsTab({ user }) {
  const { logout, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <h2 className="font-display text-xl font-bold text-ink-900 mb-5">Account Settings</h2>
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm px-3.5 py-2.5 rounded-xl mb-4">
          <Check size={15} /> Profile updated.
        </div>
      )}
      <form onSubmit={handleSave} className="space-y-4 max-w-sm">
        <div>
          <label className="text-xs text-ink-300 mb-1 block">Full name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-ink-900/15 text-sm outline-none focus:border-gold-600"
          />
        </div>
        <div>
          <label className="text-xs text-ink-300 mb-1 block">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-ink-900/15 text-sm outline-none focus:border-gold-600"
          />
        </div>
        <button type="submit" className="bg-gold-600 hover:bg-gold-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
          Save changes
        </button>
        <div className="pt-4 border-t border-ink-900/8">
          <button type="button" onClick={logout} className="text-red-600 font-semibold text-sm">Sign out</button>
        </div>
      </form>
    </Card>
  );
}
