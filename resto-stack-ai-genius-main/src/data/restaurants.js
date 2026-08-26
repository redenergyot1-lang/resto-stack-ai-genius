// Categories remain a small static list. Restaurants & menu items are
// fetched from Lovable Cloud (Supabase) via DataContext.
export const categories = [
  {
    "name": "North Indian",
    "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=640&h=400&q=80",
    "count": 20
  },
  {
    "name": "Chinese",
    "image": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=640&h=400&q=80",
    "count": 21
  },
  {
    "name": "Italian",
    "image": "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=640&h=400&q=80",
    "count": 14
  },
  {
    "name": "Biryani",
    "image": "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=640&h=400&q=80",
    "count": 24
  },
  {
    "name": "South Indian",
    "image": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=640&h=400&q=80",
    "count": 14
  },
  {
    "name": "Fast Food",
    "image": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=640&h=400&q=80",
    "count": 25
  },
  {
    "name": "Mexican",
    "image": "https://images.unsplash.com/photo-1564767609342-620cb19b2357?auto=format&fit=crop&w=640&h=400&q=80",
    "count": 23
  },
  {
    "name": "Desserts",
    "image": "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=640&h=400&q=80",
    "count": 19
  },
  {
    "name": "Healthy",
    "image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=640&h=400&q=80",
    "count": 19
  }
];

// Kept for backwards compatibility with any module that still imports
// these names — they resolve to empty arrays; use useData() instead.
export const restaurants = [];
export const allMenuItems = [];
export const allCuisines = [];
