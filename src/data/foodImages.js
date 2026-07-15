// Curated, real food/restaurant photography (Unsplash) used in place of
// text placeholders. Selection is deterministic per id/name so a given
// restaurant or dish always renders the same photo across renders and pages.
//
// NOTE: these are hotlinked Unsplash photo URLs (the same approach already
// used for the Landing page hero). No API key/network calls needed at build
// time — the browser fetches them directly, same as any other <img src>.

function unsplash(id, w = 640, h = 400) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

// Wide (restaurant card / banner) photo IDs per cuisine — restaurant interiors,
// plated hero shots, and ambience shots that read well as a card thumbnail.
const CUISINE_RESTAURANT_PHOTOS = {
  "North Indian": [
    "1585937421612-70a008356fbe", "1601050690597-df0568f70950", "1631452180519-c014fe946bc7",
    "1565557623262-b51c2513a641", "1505253716362-afaea1d3d1af",
  ],
  "South Indian": [
    "1589301760014-d929f3979dbc", "1668236543090-82eba5ee5976", "1630383249896-424e482df921",
    "1606491956689-2ea866880c84", "1630409346824-4f354cbc4d99",
  ],
  Chinese: [
    "1563245372-f21724e3856d", "1525755662778-989d0524087e", "1496116218417-1a781b1c416c",
    "1552611052-33e04de081de", "1582878826629-29b7ad1cdc43",
  ],
  Italian: [
    "1565299624946-b28f40a0ae38", "1595295333158-4742f28fbd85", "1574071318508-1cdbab80d002",
    "1556761223-4c4282c73f77", "1571997478779-2adcbbe9ab2f",
  ],
  Biryani: [
    "1563379091339-03b21ab4a4f8", "1633945274405-b6c8069047b0", "1604908176997-125f25cc6f3d",
    "1599487488170-d11ec9c172f0", "1631515243349-e0cb75fb8d3a",
  ],
  "Fast Food": [
    "1568901346375-23c9450c58cd", "1571091718767-18b5b1457add", "1551782450-a2132b4ba21d",
    "1576107232684-1279f390859f", "1561758033-d89a9ad46330",
  ],
  Mexican: [
    "1565299507177-b0ac66763828", "1551504734-5ee1c4a1479b", "1599974579688-8dbdd335c77f",
    "1564767609342-620cb19b2357", "1613514785940-daed07799d9b",
  ],
  Desserts: [
    "1551024601-bec78aea704b", "1488477181946-6428a0291777", "1565958011703-44f9829ba187",
    "1542826438-bd32f43d626f", "1587314168485-3236d6710814",
  ],
  Healthy: [
    "1546069901-ba9599a7e63c", "1540420773420-3366772f4999", "1512621776951-a57141f2eefd",
    "1505576399279-565b52d4ac71", "1567620905732-2d1ec7ab7445",
  ],
  Mughlai: [
    "1599043513900-ed6fe01d3833", "1631452180519-c014fe946bc7", "1585937421612-70a008356fbe",
    "1567188040759-fb8a883dc6d8", "1606491956689-2ea866880c84",
  ],
  Continental: [
    "1432139509613-5c4255815697", "1467003909585-2f8a72700288", "1544025162-d76694265947",
    "1432139555190-58524dae6a55", "1432139509613-5c4255815697",
  ],
  "Bakery & Cafe": [
    "1509440159596-0249088772ff", "1517433670267-08bbd4be890f", "1495474472287-4d71bcdd2085",
    "1495147466023-ac5c588e2e94", "1556742049-0cfed4f6a45d",
  ],
};

// Close-up plated-dish photo IDs per cuisine, used for individual menu items.
const CUISINE_DISH_PHOTOS = {
  "North Indian": [
    "1585937421612-70a008356fbe", "1565557623262-b51c2513a641", "1631452180519-c014fe946bc7",
    "1601050690597-df0568f70950", "1546833999-b9f581a1996d", "1599487488170-d11ec9c172f0",
  ],
  "South Indian": [
    "1589301760014-d929f3979dbc", "1668236543090-82eba5ee5976", "1630383249896-424e482df921",
    "1606491956689-2ea866880c84", "1630409346824-4f354cbc4d99", "1589301773859-bb024d3ce3e6",
  ],
  Chinese: [
    "1563245372-f21724e3856d", "1525755662778-989d0524087e", "1496116218417-1a781b1c416c",
    "1582878826629-29b7ad1cdc43", "1591814468924-caf88d1232e1", "1552611052-33e04de081de",
  ],
  Italian: [
    "1574071318508-1cdbab80d002", "1565299624946-b28f40a0ae38", "1595295333158-4742f28fbd85",
    "1556761223-4c4282c73f77", "1571997478779-2adcbbe9ab2f", "1595908129746-57ca1a63dd4d",
  ],
  Biryani: [
    "1563379091339-03b21ab4a4f8", "1633945274405-b6c8069047b0", "1604908176997-125f25cc6f3d",
    "1631515243349-e0cb75fb8d3a", "1599487488170-d11ec9c172f0", "1567188040759-fb8a883dc6d8",
  ],
  "Fast Food": [
    "1568901346375-23c9450c58cd", "1571091718767-18b5b1457add", "1551782450-a2132b4ba21d",
    "1576107232684-1279f390859f", "1561758033-d89a9ad46330", "1550317138-10000687a72b",
  ],
  Mexican: [
    "1565299507177-b0ac66763828", "1551504734-5ee1c4a1479b", "1599974579688-8dbdd335c77f",
    "1564767609342-620cb19b2357", "1613514785940-daed07799d9b", "1551504734-5ee1c4a1479b",
  ],
  Desserts: [
    "1551024601-bec78aea704b", "1488477181946-6428a0291777", "1565958011703-44f9829ba187",
    "1542826438-bd32f43d626f", "1587314168485-3236d6710814", "1486427944299-d1955d23e34d",
  ],
  Healthy: [
    "1546069901-ba9599a7e63c", "1540420773420-3366772f4999", "1512621776951-a57141f2eefd",
    "1505576399279-565b52d4ac71", "1567620905732-2d1ec7ab7445", "1574484284002-952d92456975",
  ],
  Mughlai: [
    "1599043513900-ed6fe01d3833", "1631452180519-c014fe946bc7", "1585937421612-70a008356fbe",
    "1567188040759-fb8a883dc6d8", "1606491956689-2ea866880c84", "1599487488170-d11ec9c172f0",
  ],
  Continental: [
    "1432139509613-5c4255815697", "1467003909585-2f8a72700288", "1544025162-d76694265947",
    "1432139555190-58524dae6a55", "1432139607792-0a78ef7e8b94", "1432139622800-d4c0eb71f0e1",
  ],
  "Bakery & Cafe": [
    "1509440159596-0249088772ff", "1517433670267-08bbd4be890f", "1495474472287-4d71bcdd2085",
    "1495147466023-ac5c588e2e94", "1556742049-0cfed4f6a45d", "1568051243857-2dd13c2a4a8b",
  ],
};

const FALLBACK_RESTAURANT_PHOTOS = [
  "1517248135467-4c7edcad34c4", "1414235077428-338989a2e8c0", "1517022812141-23620dba5c23",
  "1466978913421-dad2ebd01d17", "1424847651672-bf20a4b0982b",
];

const FALLBACK_DISH_PHOTOS = [
  "1504674900247-0877df9cc836", "1546069901-ba9599a7e63c", "1455619452474-d2be8b1e70cd",
  "1467003909585-2f8a72700288", "1499028344343-cd173ffc68a9",
];

// Simple deterministic string hash → stable index per id, so the same
// restaurant/dish always gets the same photo (no random reshuffles on re-render).
function hashIndex(key, length) {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return h % length;
}

export function restaurantImage(restaurant, { width = 640, height = 400 } = {}) {
  const cuisine = restaurant.cuisines?.[0];
  const bank = CUISINE_RESTAURANT_PHOTOS[cuisine] || FALLBACK_RESTAURANT_PHOTOS;
  const id = bank[hashIndex(restaurant.id || restaurant.slug || restaurant.name, bank.length)];
  return unsplash(id, width, height);
}

export function restaurantBannerImage(restaurant) {
  return restaurantImage(restaurant, { width: 1200, height: 480 });
}

export function dishImage(dish, { width = 320, height = 220 } = {}) {
  const bank = CUISINE_DISH_PHOTOS[dish.category] || FALLBACK_DISH_PHOTOS;
  // Mix in the dish name so different dishes in the same category still vary.
  const key = `${dish.id || ""}:${dish.name || ""}`;
  const id = bank[hashIndex(key, bank.length)];
  return unsplash(id, width, height);
}

export function categoryImage(categoryName) {
  const bank = CUISINE_RESTAURANT_PHOTOS[categoryName] || FALLBACK_RESTAURANT_PHOTOS;
  const id = bank[hashIndex(categoryName, bank.length)];
  return unsplash(id, 640, 400);
}
