export default function VegBadge({ isVeg, size = 14 }) {
  return (
    <span
      className={`inline-flex items-center justify-center border ${
        isVeg ? "border-emerald-600" : "border-red-600"
      } rounded-sm shrink-0`}
      style={{ width: size, height: size }}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span
        className={`rounded-full ${isVeg ? "bg-emerald-600" : "bg-red-600"}`}
        style={{ width: size * 0.45, height: size * 0.45 }}
      />
    </span>
  );
}
