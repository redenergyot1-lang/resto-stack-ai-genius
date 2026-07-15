import { Link } from "react-router-dom";
import { Clock, Leaf, Heart } from "lucide-react";
import StarRating from "./StarRating.jsx";
import Thumbnail from "./Thumbnail.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";

export default function RestaurantCard({ restaurant }) {
  const r = restaurant;
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(r.id);

  return (
    <Link
      to={`/restaurant/${r.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white shadow-card hover:shadow-cardHover transition-shadow duration-300"
    >
      <div className="relative">
        <Thumbnail
          src={r.image}
          alt={r.name}
          aspect="aspect-[4/3]"
          imgClassName="group-hover:scale-105 transition-transform duration-500"
        />
        {!r.openNow && (
          <div className="absolute inset-0 bg-ink-900/60 flex items-center justify-center">
            <span className="text-white font-semibold text-sm tracking-wide">Closed Now</span>
          </div>
        )}
        {r.hasOffer && r.openNow && (
          <span className="absolute bottom-2 left-2 bg-gold-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {r.offerText}
          </span>
        )}
        {r.isVeg && (
          <span className="absolute top-2 right-2 bg-white/95 rounded-full p-1.5" title="Pure Veg">
            <Leaf size={13} className="text-emerald-700" />
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(r.id);
          }}
          aria-pressed={saved}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute top-2 ${r.isVeg ? "right-11" : "right-2"} bg-white/95 rounded-full p-1.5 transition-colors hover:bg-white`}
        >
          <Heart size={13} className={saved ? "fill-red-500 text-red-500" : "text-ink-500"} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-base text-ink-900 leading-snug truncate">
            {r.name}
          </h3>
          <StarRating rating={r.rating} size={14} />
        </div>
        <p className="text-sm text-ink-300 mt-1 truncate">{r.cuisines.join(", ")} · {r.city}</p>
        <div className="flex items-center gap-3 mt-2.5 text-sm text-ink-500">
          <span className="inline-flex items-center gap-1">
            <Clock size={13} /> {r.deliveryTime} min
          </span>
          <span>·</span>
          <span>₹{r.costForTwo} for two</span>
        </div>
      </div>
    </Link>
  );
}
