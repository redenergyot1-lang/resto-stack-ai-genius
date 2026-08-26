import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ListChecks } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { EmptyState } from "../components/Misc.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../integrations/supabase/client";

function statusClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "resolved" || s === "closed") return "bg-emerald-50 text-emerald-700";
  if (s === "in progress") return "bg-blue-50 text-blue-700";
  return "bg-gold-100 text-gold-700";
}

export default function MyTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setTickets(data || []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-5 sm:px-8 w-full py-12">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-7">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-gold-600 text-white flex items-center justify-center">
              <ListChecks size={20} />
            </span>
            <h1 className="font-display text-3xl font-bold text-ink-900">My Tickets</h1>
          </div>
          <Link
            to="/support/new"
            className="bg-gold-600 hover:bg-gold-700 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            Raise a ticket
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-ink-300">Loading your tickets...</p>
        ) : tickets.length === 0 ? (
          <EmptyState icon={ListChecks} title="No tickets yet" subtitle="Raise a ticket and it will show up here." />
        ) : (
          <div className="bg-white rounded-2xl shadow-card divide-y divide-ink-900/8">
            {tickets.map((t) => (
              <div key={t.id} className="p-5 flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900">{t.subject}</p>
                  <p className="text-xs text-ink-300 mt-0.5">
                    #{t.id.slice(0, 8)} · {t.category} · {new Date(t.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-ink-500 mt-2">{t.description}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClass(t.status)}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
