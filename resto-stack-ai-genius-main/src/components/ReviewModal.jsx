import { useState } from "react";
import { Star, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function ReviewModal({ subject, existing, onClose, onSave }) {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(existing?.rating || 5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existing?.comment || "");

  function handleSubmit(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    onSave({
      id: existing?.id || `${subject.id}-user-${Date.now()}`,
      author: isAuthenticated ? user.name : "You",
      rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
      mock: false,
    });
  }

  return (
    <div className="fixed inset-0 z-[100] bg-ink-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-cardHover animate-fadeUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-lg font-bold text-ink-900">
            {existing ? "Edit your review" : `Rate this ${subject.kind || "dish"}`}
          </h3>
          <button onClick={onClose} className="text-ink-300 hover:text-ink-900">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-ink-300 mb-4">{subject.name}</p>

        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-1.5 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  size={28}
                  className={(hover || rating) >= n ? "fill-gold-300 text-gold-300" : "text-ink-900/15"}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others what you thought..."
            rows={3}
            className="w-full border border-ink-900/15 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-gold-600 resize-none"
          />
          <button
            type="submit"
            disabled={!comment.trim()}
            className="w-full mt-4 bg-gold-600 hover:bg-gold-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {existing ? "Update review" : "Submit review"}
          </button>
        </form>
      </div>
    </div>
  );
}
