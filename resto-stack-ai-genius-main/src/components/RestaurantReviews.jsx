import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, MessageSquarePlus, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useReviews } from "../hooks/useReviews.js";
import ReviewModal from "./ReviewModal.jsx";

/**
 * Restaurant-level rating + reviews section. Reuses the same generic
 * `useReviews`/`ReviewModal` machinery as dish reviews — passing the
 * restaurant's id keeps it in its own bucket in localStorage (dish ids are
 * "D1..", restaurant ids are "R1..", so there's no collision). Writing a
 * review is gated to signed-in users; a user can only ever have one review
 * per restaurant (editing replaces it in place rather than adding a new one).
 */
export default function RestaurantReviews({ restaurant }) {
  const { isAuthenticated } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const { allReviews, avgRating, saveReview, userReviews } = useReviews(
    restaurant.id,
    restaurant.rating,
    restaurant.reviewCount
  );
  const myReview = userReviews[0];

  return (
    <section className="py-10 border-t border-ink-900/8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">Ratings &amp; Reviews</h2>
          <p className="text-sm text-ink-300 mt-1">
            <span className="inline-flex items-center gap-1 font-semibold text-ink-900">
              <Star size={14} className="fill-gold-300 text-gold-300" /> {avgRating.toFixed(1)}
            </span>{" "}
            average · {allReviews.length.toLocaleString("en-IN")} reviews
          </p>
        </div>

        {isAuthenticated ? (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-gold-600 hover:bg-gold-700 text-white font-semibold text-sm px-4 py-2.5 rounded-full transition-colors"
          >
            <MessageSquarePlus size={15} /> {myReview ? "Edit your review" : "Rate this restaurant"}
          </button>
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 border border-gold-600 text-gold-600 hover:bg-gold-50 font-semibold text-sm px-4 py-2.5 rounded-full transition-colors"
          >
            <LogIn size={15} /> Sign in to write a review
          </Link>
        )}
      </div>

      {allReviews.length === 0 ? (
        <p className="text-sm text-ink-300">No reviews yet. Be the first to rate this restaurant.</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {allReviews.slice(0, visibleCount).map((r) => (
              <div key={r.id} className="border border-ink-900/8 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink-900 text-sm">
                    {r.author}
                    {!r.mock && r.id === myReview?.id ? " (You)" : ""}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-xs text-gold-600 font-semibold">
                    <Star size={12} className="fill-gold-300 text-gold-300" /> {r.rating}
                  </span>
                </div>
                <p className="text-sm text-ink-700 mt-1.5">{r.comment}</p>
                <p className="text-xs text-ink-300 mt-1.5">{new Date(r.date).toLocaleDateString("en-IN")}</p>
              </div>
            ))}
          </div>
          {visibleCount < allReviews.length && (
            <button
              onClick={() => setVisibleCount((v) => v + 6)}
              className="mt-5 text-sm font-semibold text-gold-600 hover:underline"
            >
              Show more reviews
            </button>
          )}
        </>
      )}

      {modalOpen && (
        <ReviewModal
          subject={{ id: restaurant.id, name: restaurant.name, kind: "restaurant" }}
          existing={myReview}
          onClose={() => setModalOpen(false)}
          onSave={(review) => {
            saveReview(review);
            setModalOpen(false);
          }}
        />
      )}
    </section>
  );
}
