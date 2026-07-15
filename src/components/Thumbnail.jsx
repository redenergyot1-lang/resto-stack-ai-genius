import { useState } from "react";

/**
 * Image with a shimmering skeleton while it loads, a graceful fallback if it
 * errors, and a fixed aspect ratio so cards never jump around as photos
 * load in. Drop-in replacement for a plain <img> wherever a thumbnail is
 * shown (restaurant cards, dish rows, search results, category circles).
 */
export default function Thumbnail({
  src,
  alt = "",
  aspect = "aspect-[4/3]",
  rounded = "",
  className = "",
  imgClassName = "",
  loading = "lazy",
}) {
  const [status, setStatus] = useState("loading"); // loading | loaded | error

  return (
    <div className={`relative overflow-hidden ${aspect} ${rounded} ${className}`}>
      {status !== "loaded" && (
        <div className={`absolute inset-0 skeleton ${rounded}`} aria-hidden="true" />
      )}
      {status === "error" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-cream-200 text-ink-300 text-xs font-medium">
          {alt || "Image unavailable"}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            status === "loaded" ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      )}
    </div>
  );
}
