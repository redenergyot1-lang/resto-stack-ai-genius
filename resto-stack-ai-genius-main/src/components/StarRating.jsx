import { Star } from "lucide-react";

export default function StarRating({ rating, size = 14, showNumber = true, reviewCount }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-700/90 px-1.5 py-0.5 text-white">
        <Star size={size - 4} className="fill-white" strokeWidth={0} />
        {showNumber && <span className="text-xs font-semibold">{rating.toFixed(1)}</span>}
      </span>
      {reviewCount !== undefined && (
        <span className="text-xs text-ink-300">({reviewCount.toLocaleString("en-IN")})</span>
      )}
    </span>
  );
}
