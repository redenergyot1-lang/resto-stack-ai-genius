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
  fallback = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&h=480&q=80",
}) {
  const [status, setStatus] = useState("loading"); // loading | loaded | error
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  return (
    <div className={`relative overflow-hidden ${aspect} ${rounded} ${className}`}>
      {status !== "loaded" && (
        <div className={`absolute inset-0 skeleton ${rounded}`} aria-hidden="true" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setStatus("loaded")}
        onError={() => {
          if (currentSrc !== fallback) {
            setCurrentSrc(fallback);
            setStatus("loading");
          } else {
            setStatus("error");
          }
        }}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          status === "loaded" ? "opacity-100" : "opacity-0"
        } ${imgClassName}`}
      />
    </div>
  );
}
