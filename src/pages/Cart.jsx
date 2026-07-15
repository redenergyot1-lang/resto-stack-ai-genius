import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import VegBadge from "../components/VegBadge.jsx";
import { CartEmptyState } from "../components/Misc.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useState } from "react";

export default function Cart() {
  const { items, setQty, removeItem, totals, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  function handleCheckout() {
    if (!isAuthenticated) {
      navigate("/login?next=/cart");
      return;
    }
    setPlacing(true);
    // TODO: replace with Razorpay checkout -> POST /api/orders -> Razorpay order -> verify -> confirm
    setTimeout(() => {
      setPlacing(false);
      setPlaced(true);
      clearCart();
    }, 1200);
  }

  if (placed) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-2xl mx-auto px-5 w-full py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5 text-3xl">
            ✓
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Order placed!</h1>
          <p className="text-ink-300 mt-2">Your food is being prepared. You can track it from your dashboard.</p>
          <Link
            to="/dashboard"
            className="inline-block mt-7 bg-gold-600 hover:bg-gold-700 text-white font-semibold px-7 py-3 rounded-full"
          >
            View order history
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-5 sm:px-8 w-full py-10">
        <h1 className="font-display text-3xl font-bold text-ink-900 mb-7">Your Cart</h1>

        {items.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white rounded-2xl shadow-card divide-y divide-ink-900/8">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-4">
                  <VegBadge isVeg={item.isVeg} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink-900 truncate">{item.name}</p>
                    <p className="text-xs text-ink-300">{item.restaurantName}</p>
                    <p className="text-sm font-semibold text-ink-700 mt-0.5">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-gold-600 text-white rounded-lg px-2 py-1.5">
                    <button onClick={() => setQty(item.id, item.qty - 1)} aria-label="Decrease">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-semibold w-4 text-center">{item.qty}</span>
                    <button onClick={() => setQty(item.id, item.qty + 1)} aria-label="Increase">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-ink-300 hover:text-red-600 p-1.5" aria-label="Remove">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-card p-5 h-fit">
              <h3 className="font-display font-bold text-lg text-ink-900 mb-4">Bill Summary</h3>
              <div className="space-y-2.5 text-sm text-ink-500">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{totals.subtotal}</span></div>
                <div className="flex justify-between"><span>Delivery fee</span><span>₹{totals.deliveryFee}</span></div>
                <div className="flex justify-between"><span>Platform fee</span><span>₹{totals.platformFee}</span></div>
                <div className="flex justify-between"><span>Taxes</span><span>₹{totals.tax}</span></div>
              </div>
              <div className="flex justify-between font-bold text-ink-900 text-base mt-3 pt-3 border-t border-ink-900/8">
                <span>To pay</span><span>₹{totals.total}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={placing}
                className="w-full mt-5 bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                {placing ? "Placing order..." : "Proceed to pay"}
              </button>
              <p className="text-[11px] text-ink-300 text-center mt-3">Secure payments powered by Razorpay</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
