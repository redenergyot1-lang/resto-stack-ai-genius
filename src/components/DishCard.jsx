import { useState } from "react";
import { Star, Plus, Minus, MessageSquarePlus, ChevronDown, ChevronUp, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import VegBadge from "./VegBadge.jsx";
import Thumbnail from "./Thumbnail.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useReviews } from "../hooks/useReviews.js";
import ReviewModal from "./ReviewModal.jsx";
import { highlightMatch } from "../utils/highlight.jsx";

export default function DishCard({ dish, restaurant, highlightQuery = "" }) {
  const { items, addItem, setQty } = useCart();
  const { isAuthenticated } = useAuth();
  const [showReviews, setShowReviews] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { allReviews, avgRating, saveReview, userReviews } = useReviews(dish.id, dish.rating, dish.reviewCount);

  const cartItem = items.find((i) => i.id === dish.id);
  const myReview = userReviews[0];

  return (
    <div className="border-b border-ink-900/8 py-5 flex gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <VegBadge isVeg={dish.isVeg} />
          {dish.isBestseller && (
            <span className="text-[10px] font-bold tracking-wide uppercase text-gold-600 bg-gold-50 px-1.5 py-0.5 rounded">
              Bestseller
            </span>
          )}
          <span className="text-[11px] text-ink-300">{highlightMatch(dish.category, highlightQuery)}</span>
        </div>
        <h4 className="font-semibold text-ink-900 truncate">{highlightMatch(dish.name, highlightQuery)}</h4>
        <p className="text-sm font-medium text-ink-700 mt-0.5">₹{dish.price}</p>
        <button
          onClick={() => setShowReviews((v) => !v)}
          className="inline-flex items-center gap-1 text-xs text-ink-500 mt-1.5 hover:text-gold-600"
        >
          <Star size={12} className="fill-gold-300 text-gold-300" />
          {avgRating.toFixed(1)} ({allReviews.length} reviews)
          {showReviews ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        <p className="text-sm text-ink-300 mt-1.5 line-clamp-2">{highlightMatch(dish.description, highlightQuery)}</p>

        {!dish.available && (
          <p className="text-xs font-semibold text-red-500 mt-2">Currently unavailable</p>
        )}

        {showReviews && (
          <div className="mt-3 space-y-2.5 bg-cream-100 rounded-xl p-3.5 animate-fadeUp">
            {isAuthenticated ? (
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-600"
              >
                <MessageSquarePlus size={13} /> {myReview ? "Edit your review" : "Write a review"}
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-600"
              >
                <LogIn size={13} /> Sign in to write a review
              </Link>
            )}
            {allReviews.slice(0, 3).map((r) => (
              <div key={r.id} className="text-sm border-t border-ink-900/5 pt-2 first:border-0 first:pt-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink-900">{r.author}{!r.mock && r.id === myReview?.id ? " (You)" : ""}</span>
                  <span className="inline-flex items-center gap-0.5 text-xs text-gold-600 font-semibold">
                    <Star size={11} className="fill-gold-300 text-gold-300" /> {r.rating}
                  </span>
                </div>
                <p className="text-ink-300 text-xs mt-0.5">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 shrink-0 w-28">
        <Thumbnail src={dish.image} alt={dish.name} aspect="aspect-[4/3.4]" rounded="rounded-xl" className="w-28" />
        {dish.available && (
          cartItem ? (
            <div className="flex items-center gap-2 bg-gold-600 text-white rounded-lg px-2 py-1.5 w-full justify-center -mt-3 shadow-card">
              <button onClick={() => setQty(dish.id, cartItem.qty - 1)} aria-label="Decrease quantity">
                <Minus size={14} />
              </button>
              <span className="text-sm font-semibold w-4 text-center">{cartItem.qty}</span>
              <button onClick={() => setQty(dish.id, cartItem.qty + 1)} aria-label="Increase quantity">
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addItem(dish, restaurant)}
              className="flex items-center gap-1 bg-white border border-gold-600 text-gold-600 font-semibold text-sm px-4 py-1.5 rounded-lg -mt-3 shadow-card hover:bg-gold-50 transition-colors w-full justify-center"
            >
              <Plus size={14} /> Add
            </button>
          )
        )}
      </div>

      {modalOpen && (
        <ReviewModal
          subject={{ id: dish.id, name: dish.name, kind: "dish" }}
          existing={myReview}
          onClose={() => setModalOpen(false)}
          onSave={(review) => {
            saveReview(review);
            setModalOpen(false);
            setShowReviews(true);
          }}
        />
      )}
    </div>
  );
}
