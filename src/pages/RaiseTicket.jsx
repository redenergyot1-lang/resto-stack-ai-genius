import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Ticket } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../integrations/supabase/client";

const CATEGORIES = ["Order Issue", "Refund Request", "Payment Problem", "Delivery Delay", "Other"];

export default function RaiseTicket() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: "", category: "Order Issue", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      setError("Please add a subject and describe your issue.");
      return;
    }
    setSaving(true);
    setError("");
    const { error: err } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject: form.subject.trim(),
      category: form.category,
      description: form.description.trim(),
      status: "Open",
    });
    setSaving(false);
    if (err) {
      setError(err.message || "Could not submit your ticket. Please try again.");
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/support/tickets"), 1200);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-5 sm:px-8 w-full py-12">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-11 h-11 rounded-full bg-gold-600 text-white flex items-center justify-center">
            <Ticket size={20} />
          </span>
          <h1 className="font-display text-3xl font-bold text-ink-900">Raise a Ticket</h1>
        </div>
        <p className="text-ink-300 mb-7">
          Our support team replies within 24 hours. See <Link to="/support/tickets" className="text-gold-600 font-medium">My Tickets</Link> to track progress.
        </p>

        <div className="bg-white rounded-2xl shadow-card p-6">
          {done && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm px-3.5 py-2.5 rounded-xl mb-4">
              <Check size={15} /> Ticket submitted — taking you to My Tickets.
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3.5 py-2.5 rounded-xl mb-4">{error}</div>
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
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the issue..."
              rows={5}
              className="w-full px-3.5 py-2.5 rounded-lg border border-ink-900/15 text-sm outline-none focus:border-gold-600 resize-none"
            />
            <button
              disabled={saving}
              className="bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              {saving ? "Submitting..." : "Submit ticket"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
