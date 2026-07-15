import { useEffect, useState } from "react";

const NAMES = ["Aarav", "Diya", "Vihaan", "Ananya", "Kabir", "Ishita", "Rohan", "Meera", "Arjun", "Saanvi", "Dev", "Priya"];
const COMMENTS_POS = [
  "Absolutely loved this, will order again!",
  "Tasted exactly like the description, super fresh.",
  "Great portion size and packed really well.",
  "One of the best I've had from this place.",
  "Delicious and arrived hot. Highly recommend.",
  "Good value for money, very flavourful.",
];
const COMMENTS_MID = [
  "Decent, but could use a bit more spice.",
  "Good overall, packaging could be better.",
  "Tasty but a little smaller portion than expected.",
];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

export function generateMockReviews(entityId, count = 4) {
  const rand = seededRandom(hashStr(entityId));
  return Array.from({ length: count }).map((_, i) => {
    const rating = Math.round((3 + rand() * 2) * 2) / 2;
    const isPositive = rating >= 4;
    const comment = isPositive
      ? COMMENTS_POS[Math.floor(rand() * COMMENTS_POS.length)]
      : COMMENTS_MID[Math.floor(rand() * COMMENTS_MID.length)];
    return {
      id: `${entityId}-mock-${i}`,
      author: NAMES[Math.floor(rand() * NAMES.length)],
      rating,
      comment,
      date: new Date(Date.now() - Math.floor(rand() * 60) * 86400000).toISOString(),
      mock: true,
    };
  });
}

const STORAGE_KEY = "restostack_user_reviews";

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

/**
 * Generic review hook — works for any reviewable entity (dish or
 * restaurant) as long as `entityId` is unique across both (dish ids are
 * "D1", "D2"...; restaurant ids are "R1", "R2"..., so they never collide
 * in the shared localStorage map).
 */
export function useReviews(entityId, baseRating, baseCount) {
  const [userReviews, setUserReviews] = useState([]);
  const mockReviews = generateMockReviews(entityId, Math.min(5, Math.max(2, Math.round(baseCount / 50))));

  useEffect(() => {
    const all = loadAll();
    setUserReviews(all[entityId] || []);
  }, [entityId]);

  function saveReview(review) {
    const all = loadAll();
    const existingIdx = (all[entityId] || []).findIndex((r) => r.id === review.id);
    const list = all[entityId] ? [...all[entityId]] : [];
    if (existingIdx >= 0) list[existingIdx] = review;
    else list.unshift(review);
    all[entityId] = list;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    setUserReviews(list);
  }

  const allReviews = [...userReviews, ...mockReviews];
  const avgRating =
    allReviews.length > 0
      ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length)
      : baseRating;

  return { userReviews, mockReviews, allReviews, saveReview, avgRating };
}
