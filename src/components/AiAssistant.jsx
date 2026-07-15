import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { useCart } from "../context/CartContext.jsx";
import { useDeliveryLocation } from "../context/LocationContext.jsx";
import { buildAiContext, findDish, findRestaurantBySlug } from "../lib/aiContext.js";

const WELCOME = {
  role: "assistant",
  content:
    "Hi! I'm your RestoStack assistant 👋 Ask me for the best biryani, cheapest pizza, restaurants with offers — or say things like *add Margherita Pizza to my cart* or *open my cart*.",
};

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { addItem, removeItem, setQty, clearCart, items } = useCart();
  const { city } = useDeliveryLocation();

  // Build context once per city (compact JSON of that city's data).
  const context = useMemo(() => buildAiContext(city), [city]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy, open]);

  function pushMsg(msg) {
    setMessages((m) => [...m, msg]);
  }

  function executeToolCall(call) {
    let args = {};
    try {
      args = typeof call.function.arguments === "string" ? JSON.parse(call.function.arguments) : call.function.arguments || {};
    } catch { args = {}; }
    const name = call.function.name;

    if (name === "add_to_cart") {
      const found = findDish(args.dishId || args.query || "");
      if (!found) return `I couldn't find that dish in the catalog.`;
      const qty = Math.max(1, Number(args.quantity) || 1);
      for (let i = 0; i < qty; i++) addItem(found.dish, found.restaurant);
      return `Added ${qty} × ${found.dish.name} from ${found.restaurant.name} to your cart.`;
    }
    if (name === "remove_from_cart") {
      const target = items.find(
        (i) => i.id.toLowerCase() === String(args.query).toLowerCase() ||
               i.name.toLowerCase().includes(String(args.query).toLowerCase()),
      );
      if (!target) return `That item isn't in your cart.`;
      removeItem(target.id);
      return `Removed ${target.name}.`;
    }
    if (name === "update_quantity") {
      const target = items.find(
        (i) => i.id.toLowerCase() === String(args.query).toLowerCase() ||
               i.name.toLowerCase().includes(String(args.query).toLowerCase()),
      );
      if (!target) return `That item isn't in your cart.`;
      const next = Math.max(0, target.qty + (Number(args.delta) || 0));
      setQty(target.id, next);
      return next ? `Updated ${target.name} to ${next}.` : `Removed ${target.name}.`;
    }
    if (name === "clear_cart") { clearCart(); return `Cart cleared.`; }
    if (name === "navigate") {
      const t = String(args.target || "").toLowerCase();
      if (t === "cart" || t === "checkout") { navigate("/cart"); return "Opening your cart."; }
      if (t === "restaurants") { navigate("/restaurants"); return "Showing all restaurants."; }
      const r = findRestaurantBySlug(t);
      if (r) { navigate(`/restaurant/${r.slug}`); return `Opening ${r.name}.`; }
      return "I couldn't find that page.";
    }
    return null;
  }

  async function send(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const newMsgs = [...messages, { role: "user", content: text }];
    setMessages(newMsgs);
    setBusy(true);

    try {
      const chatHistory = newMsgs
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { messages: chatHistory, context },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const toolCalls = data?.tool_calls || [];
      if (toolCalls.length) {
        const results = toolCalls.map((c) => executeToolCall(c)).filter(Boolean);
        pushMsg({
          role: "assistant",
          content: [data.content, ...results].filter(Boolean).join("\n\n") ||
            "Done.",
        });
      } else {
        pushMsg({ role: "assistant", content: data?.content || "…" });
      }
    } catch (err) {
      pushMsg({
        role: "assistant",
        content: `Sorry, I hit an error: ${err.message || err}. Please try again.`,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open RestoStack assistant"
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 px-5 py-3.5 rounded-full bg-gold-500 text-cream-50 shadow-cardHover hover:bg-gold-600 transition-all hover:scale-105"
        >
          <Sparkles size={18} className="text-gold-100" />
          <span className="font-semibold text-sm hidden sm:inline">Ask RestoStack AI</span>
          <MessageCircle size={20} className="sm:hidden" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[400px] h-[70vh] sm:h-[560px] flex flex-col bg-cream-50 rounded-2xl shadow-cardHover border border-cream-200 overflow-hidden animate-fadeUp">
          <header className="flex items-center justify-between px-4 py-3 bg-gold-900 text-cream-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold-500 grid place-items-center">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="font-display font-semibold leading-tight">RestoStack AI</div>
                <div className="text-[11px] text-gold-100/80">
                  {city ? `Helping you in ${city}` : "Customer assistant"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="p-1.5 rounded-lg hover:bg-gold-700 transition-colors"
            >
              <X size={18} />
            </button>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-cream-100"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-gold-500 text-cream-50 rounded-br-md"
                    : "bg-cream-50 text-ink-700 border border-cream-200 rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-ink-500 text-sm">
                <Loader2 size={14} className="animate-spin" />
                Thinking…
              </div>
            )}
          </div>

          <form onSubmit={send} className="flex items-center gap-2 p-3 border-t border-cream-200 bg-cream-50">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about food, restaurants, or your cart…"
              className="flex-1 px-3.5 py-2.5 rounded-full bg-cream-100 border border-cream-200 focus:outline-none focus:border-gold-500 text-sm"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="w-10 h-10 rounded-full bg-gold-500 text-cream-50 grid place-items-center hover:bg-gold-600 disabled:opacity-50 transition-colors"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
