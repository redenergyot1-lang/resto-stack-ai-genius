import { Link } from "react-router-dom";
import { SearchX, ShoppingBag } from "lucide-react";
import Thumbnail from "./Thumbnail.jsx";

export function CategoryCircle({ category }) {
  return (
    <Link to={`/restaurants?cuisine=${encodeURIComponent(category.name)}`} className="group flex flex-col items-center gap-3 text-center">
      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-white shadow-card group-hover:shadow-cardHover transition-shadow">
        <Thumbnail
          src={category.image}
          alt={category.name}
          aspect="aspect-square"
          rounded="rounded-full"
          imgClassName="group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div>
        <p className="font-semibold text-ink-900 text-sm sm:text-base">{category.name}</p>
        <p className="text-xs text-ink-300">{category.count} places</p>
      </div>
    </Link>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-card">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 rounded skeleton" />
        <div className="h-3 w-1/2 rounded skeleton" />
        <div className="h-3 w-2/3 rounded skeleton" />
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, subtitle, action }) {
  const Icon = icon || SearchX;
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-16 h-16 rounded-full bg-gold-50 flex items-center justify-center mb-4">
        <Icon size={26} className="text-gold-600" />
      </div>
      <h3 className="font-display text-xl font-semibold text-ink-900">{title}</h3>
      {subtitle && <p className="text-sm text-ink-300 mt-1.5 max-w-sm">{subtitle}</p>}
      {action}
    </div>
  );
}

export function CartEmptyState() {
  return <EmptyState icon={ShoppingBag} title="Your cart is empty" subtitle="Add dishes from a restaurant to see them here." />;
}
