// One-off generator: produces src/data/restaurants.js with 50+ realistic
// mock restaurants + menus. Run with: node scripts/generate-data.cjs
const fs = require("fs");
const path = require("path");

const CUISINES = [
  "North Indian", "South Indian", "Chinese", "Italian", "Biryani",
  "Fast Food", "Mexican", "Desserts", "Healthy", "Mughlai",
  "Continental", "Bakery & Cafe",
];

const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur", "Ahmedabad", "Lucknow"];

const NAME_PREFIX = [
  "Spice", "Royal", "Urban", "Tandoor", "Curry", "Wok", "Saffron", "Golden",
  "Madras", "Punjab", "Coastal", "Zaffran", "Bombay", "Chandni", "Annapurna",
  "Karavalli", "Nizam's", "Dakshin", "Biryani", "Imperial", "Heritage", "Bawarchi",
  "Paradise", "Mughal", "Bengal", "Malabar", "Rajwada", "Old City", "Sultan's", "Green Leaf",
];
const NAME_SUFFIX = [
  "Kitchen", "House", "Diner", "Express", "Corner", "Treats", "Bowl", "Cafe",
  "Junction", "Hub", "Table", "Grill", "Garden", "Bites", "Dhaba", "Bistro",
  "Pavilion", "Eatery", "Foods", "Restaurant",
];

const COLORS = ["B08D38", "8B6F2E", "C9A227", "6B4F2A", "A9762F", "7D5A21", "D9B45C", "5C4326"];

const DISH_BANK = {
  "North Indian": ["Butter Chicken", "Paneer Tikka", "Dal Makhani", "Chole Bhature", "Rogan Josh", "Tandoori Roti", "Shahi Paneer", "Palak Paneer", "Malai Kofta", "Aloo Paratha", "Lachha Paratha", "Gulab Jamun"],
  "South Indian": ["Masala Dosa", "Idli Sambar", "Medu Vada", "Uttapam", "Filter Coffee", "Curd Rice", "Rava Dosa", "Pongal", "Chettinad Chicken", "Appam with Stew", "Coconut Chutney Combo", "Mysore Pak"],
  "Chinese": ["Veg Manchurian", "Chilli Chicken", "Hakka Noodles", "Spring Rolls", "Veg Fried Rice", "Chicken Momos", "Schezwan Rice", "Honey Chilli Potato", "Sweet Corn Soup", "Dragon Chicken", "Paneer Chilli", "Burnt Garlic Noodles"],
  "Italian": ["Margherita Pizza", "Pepperoni Pizza", "Alfredo Pasta", "Arrabbiata Pasta", "Garlic Bread", "Veg Lasagna", "Mushroom Risotto", "Bruschetta", "Tiramisu", "Pesto Pasta", "Four Cheese Pizza", "Minestrone Soup"],
  "Biryani": ["Chicken Biryani", "Mutton Biryani", "Veg Biryani", "Egg Biryani", "Prawns Biryani", "Hyderabadi Dum Biryani", "Boondi Raita", "Chicken 65", "Mirchi Ka Salan", "Paneer Biryani", "Keema Biryani", "Double Ka Meetha"],
  "Fast Food": ["Classic Cheese Burger", "Crispy Chicken Burger", "Peri Peri Fries", "Veg Wrap", "Chicken Nuggets", "Loaded Fries", "Classic Hot Dog", "Cheesy Onion Rings", "Cold Coffee", "Grilled Cheese Sandwich", "Veg Burger", "Chicken Popcorn"],
  "Mexican": ["Chicken Tacos", "Veg Burrito Bowl", "Nachos Supreme", "Paneer Quesadilla", "Mexican Rice Bowl", "Churros", "Guacamole & Chips", "Chicken Enchiladas", "Bean Burrito", "Loaded Taco Platter"],
  "Desserts": ["Chocolate Brownie", "Assorted Donuts", "New York Cheesecake", "Red Velvet Cake", "Ice Cream Sundae", "French Macarons", "Belgian Waffles", "Tiramisu Cup", "Choco Lava Cake", "Fruit Tart"],
  "Healthy": ["Quinoa Salad Bowl", "Grilled Chicken Salad", "Avocado Toast", "Buddha Bowl", "Sprouts Salad", "Green Smoothie Bowl", "Grilled Paneer Salad", "Hummus & Pita Plate", "Detox Salad", "Protein Power Bowl"],
  "Mughlai": ["Mutton Korma", "Chicken Chaap", "Galouti Kebab", "Sheermal", "Nihari", "Murgh Musallam", "Kakori Kebab", "Shahi Tukda"],
  "Continental": ["Grilled Chicken Steak", "Mushroom Soup", "Caesar Salad", "Fish & Chips", "Roasted Veg Platter", "Pasta Primavera", "Chicken au Gratin", "Baked Potato"],
  "Bakery & Cafe": ["Croissant", "Cappuccino", "Blueberry Muffin", "Veg Puff", "Cold Brew Coffee", "Cinnamon Roll", "Cheese Danish", "Iced Latte"],
};

const VEG_DISHES = new Set([
  "Paneer Tikka","Dal Makhani","Chole Bhature","Shahi Paneer","Palak Paneer","Malai Kofta","Aloo Paratha","Lachha Paratha","Gulab Jamun",
  "Masala Dosa","Idli Sambar","Medu Vada","Uttapam","Filter Coffee","Curd Rice","Rava Dosa","Pongal","Appam with Stew","Coconut Chutney Combo","Mysore Pak",
  "Veg Manchurian","Spring Rolls","Veg Fried Rice","Schezwan Rice","Honey Chilli Potato","Sweet Corn Soup","Paneer Chilli","Burnt Garlic Noodles",
  "Margherita Pizza","Garlic Bread","Veg Lasagna","Mushroom Risotto","Bruschetta","Tiramisu","Pesto Pasta","Four Cheese Pizza","Minestrone Soup",
  "Veg Biryani","Boondi Raita","Paneer Biryani","Double Ka Meetha",
  "Veg Wrap","Cheesy Onion Rings","Cold Coffee","Grilled Cheese Sandwich","Veg Burger",
  "Veg Burrito Bowl","Nachos Supreme","Paneer Quesadilla","Mexican Rice Bowl","Churros","Guacamole & Chips","Bean Burrito",
  "Chocolate Brownie","Assorted Donuts","New York Cheesecake","Red Velvet Cake","Ice Cream Sundae","French Macarons","Belgian Waffles","Tiramisu Cup","Choco Lava Cake","Fruit Tart",
  "Quinoa Salad Bowl","Avocado Toast","Buddha Bowl","Sprouts Salad","Green Smoothie Bowl","Grilled Paneer Salad","Hummus & Pita Plate","Detox Salad","Protein Power Bowl",
  "Sheermal","Mushroom Soup","Caesar Salad","Roasted Veg Platter","Pasta Primavera","Baked Potato",
  "Croissant","Cappuccino","Blueberry Muffin","Veg Puff","Cold Brew Coffee","Cinnamon Roll","Cheese Danish","Iced Latte",
]);

const DESCRIPTIONS = [
  "A house favourite, made fresh to order with our signature spice blend.",
  "Slow-cooked to perfection and finished with fresh herbs.",
  "A customer favourite — rich, flavourful, and generously portioned.",
  "Made with care using authentic recipes passed down through generations.",
  "Light, fresh, and bursting with flavour in every bite.",
  "Our chef's special, prepared daily with the freshest ingredients.",
  "A comforting classic done the right way.",
  "Bold flavours, perfectly balanced, served piping hot.",
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}
function rand(min, max) { return Math.round((Math.random() * (max - min) + min) * 10) / 10; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function placeholderImg(text, color, w = 640, h = 400) {
  return `https://placehold.co/${w}x${h}/${color}/FFFFFF/png?text=${encodeURIComponent(text)}&font=playfair-display`;
}

// Real food/restaurant photography (Unsplash), used instead of text
// placeholders for restaurant cards, banners, and dish thumbnails. Kept in
// sync with src/data/foodImages.js — see scripts/apply-real-images.cjs if
// this file's output ever needs a one-off image refresh after the fact.
const { restaurantImage: realRestaurantImage, dishImage: realDishImage, categoryImage: realCategoryImage } =
  (() => {
    function unsplash(id, w = 640, h = 400) {
      return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
    }
    const CUISINE_RESTAURANT_PHOTOS = {
      "North Indian": ["1585937421612-70a008356fbe","1601050690597-df0568f70950","1631452180519-c014fe946bc7","1565557623262-b51c2513a641","1505253716362-afaea1d3d1af"],
      "South Indian": ["1589301760014-d929f3979dbc","1668236543090-82eba5ee5976","1630383249896-424e482df921","1606491956689-2ea866880c84","1630409346824-4f354cbc4d99"],
      "Chinese": ["1563245372-f21724e3856d","1525755662778-989d0524087e","1496116218417-1a781b1c416c","1552611052-33e04de081de","1582878826629-29b7ad1cdc43"],
      "Italian": ["1565299624946-b28f40a0ae38","1595295333158-4742f28fbd85","1574071318508-1cdbab80d002","1556761223-4c4282c73f77","1571997478779-2adcbbe9ab2f"],
      "Biryani": ["1563379091339-03b21ab4a4f8","1633945274405-b6c8069047b0","1604908176997-125f25cc6f3d","1599487488170-d11ec9c172f0","1631515243349-e0cb75fb8d3a"],
      "Fast Food": ["1568901346375-23c9450c58cd","1571091718767-18b5b1457add","1551782450-a2132b4ba21d","1576107232684-1279f390859f","1561758033-d89a9ad46330"],
      "Mexican": ["1565299507177-b0ac66763828","1551504734-5ee1c4a1479b","1599974579688-8dbdd335c77f","1564767609342-620cb19b2357","1613514785940-daed07799d9b"],
      "Desserts": ["1551024601-bec78aea704b","1488477181946-6428a0291777","1565958011703-44f9829ba187","1542826438-bd32f43d626f","1587314168485-3236d6710814"],
      "Healthy": ["1546069901-ba9599a7e63c","1540420773420-3366772f4999","1512621776951-a57141f2eefd","1505576399279-565b52d4ac71","1567620905732-2d1ec7ab7445"],
      "Mughlai": ["1599043513900-ed6fe01d3833","1631452180519-c014fe946bc7","1585937421612-70a008356fbe","1567188040759-fb8a883dc6d8","1606491956689-2ea866880c84"],
      "Continental": ["1432139509613-5c4255815697","1467003909585-2f8a72700288","1544025162-d76694265947","1432139555190-58524dae6a55","1432139509613-5c4255815697"],
      "Bakery & Cafe": ["1509440159596-0249088772ff","1517433670267-08bbd4be890f","1495474472287-4d71bcdd2085","1495147466023-ac5c588e2e94","1556742049-0cfed4f6a45d"],
    };
    const CUISINE_DISH_PHOTOS = {
      "North Indian": ["1585937421612-70a008356fbe","1565557623262-b51c2513a641","1631452180519-c014fe946bc7","1601050690597-df0568f70950","1546833999-b9f581a1996d","1599487488170-d11ec9c172f0"],
      "South Indian": ["1589301760014-d929f3979dbc","1668236543090-82eba5ee5976","1630383249896-424e482df921","1606491956689-2ea866880c84","1630409346824-4f354cbc4d99","1589301773859-bb024d3ce3e6"],
      "Chinese": ["1563245372-f21724e3856d","1525755662778-989d0524087e","1496116218417-1a781b1c416c","1582878826629-29b7ad1cdc43","1591814468924-caf88d1232e1","1552611052-33e04de081de"],
      "Italian": ["1574071318508-1cdbab80d002","1565299624946-b28f40a0ae38","1595295333158-4742f28fbd85","1556761223-4c4282c73f77","1571997478779-2adcbbe9ab2f","1595908129746-57ca1a63dd4d"],
      "Biryani": ["1563379091339-03b21ab4a4f8","1633945274405-b6c8069047b0","1604908176997-125f25cc6f3d","1631515243349-e0cb75fb8d3a","1599487488170-d11ec9c172f0","1567188040759-fb8a883dc6d8"],
      "Fast Food": ["1568901346375-23c9450c58cd","1571091718767-18b5b1457add","1551782450-a2132b4ba21d","1576107232684-1279f390859f","1561758033-d89a9ad46330","1550317138-10000687a72b"],
      "Mexican": ["1565299507177-b0ac66763828","1551504734-5ee1c4a1479b","1599974579688-8dbdd335c77f","1564767609342-620cb19b2357","1613514785940-daed07799d9b","1551504734-5ee1c4a1479b"],
      "Desserts": ["1551024601-bec78aea704b","1488477181946-6428a0291777","1565958011703-44f9829ba187","1542826438-bd32f43d626f","1587314168485-3236d6710814","1486427944299-d1955d23e34d"],
      "Healthy": ["1546069901-ba9599a7e63c","1540420773420-3366772f4999","1512621776951-a57141f2eefd","1505576399279-565b52d4ac71","1567620905732-2d1ec7ab7445","1574484284002-952d92456975"],
      "Mughlai": ["1599043513900-ed6fe01d3833","1631452180519-c014fe946bc7","1585937421612-70a008356fbe","1567188040759-fb8a883dc6d8","1606491956689-2ea866880c84","1599487488170-d11ec9c172f0"],
      "Continental": ["1432139509613-5c4255815697","1467003909585-2f8a72700288","1544025162-d76694265947","1432139555190-58524dae6a55","1432139607792-0a78ef7e8b94","1432139622800-d4c0eb71f0e1"],
      "Bakery & Cafe": ["1509440159596-0249088772ff","1517433670267-08bbd4be890f","1495474472287-4d71bcdd2085","1495147466023-ac5c588e2e94","1556742049-0cfed4f6a45d","1568051243857-2dd13c2a4a8b"],
    };
    const FALLBACK_RESTAURANT_PHOTOS = ["1517248135467-4c7edcad34c4","1414235077428-338989a2e8c0","1517022812141-23620dba5c23","1466978913421-dad2ebd01d17","1424847651672-bf20a4b0982b"];
    const FALLBACK_DISH_PHOTOS = ["1504674900247-0877df9cc836","1546069901-ba9599a7e63c","1455619452474-d2be8b1e70cd","1467003909585-2f8a72700288","1499028344343-cd173ffc68a9"];
    function hashIndex(key, length) {
      let h = 0;
      for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
      return h % length;
    }
    return {
      restaurantImage(r, w, h) {
        const bank = CUISINE_RESTAURANT_PHOTOS[r.cuisines[0]] || FALLBACK_RESTAURANT_PHOTOS;
        return unsplash(bank[hashIndex(r.id || r.name, bank.length)], w, h);
      },
      dishImage(d, w, h) {
        const bank = CUISINE_DISH_PHOTOS[d.category] || FALLBACK_DISH_PHOTOS;
        return unsplash(bank[hashIndex(`${d.id || ""}:${d.name || ""}`, bank.length)], w, h);
      },
      categoryImage(name) {
        const bank = CUISINE_RESTAURANT_PHOTOS[name] || FALLBACK_RESTAURANT_PHOTOS;
        return unsplash(bank[hashIndex(name, bank.length)], 640, 400);
      },
    };
  })();

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const usedNames = new Set();
function makeRestaurantName() {
  let name;
  do {
    name = `${pick(NAME_PREFIX)} ${pick(NAME_SUFFIX)}`;
  } while (usedNames.has(name));
  usedNames.add(name);
  return name;
}

let dishIdCounter = 1;
let restIdCounter = 1;

function makeMenu(restaurantId, cuisines, color) {
  const dishPool = [...new Set(cuisines.flatMap((c) => DISH_BANK[c]))];
  const count = randInt(10, 12);
  const chosen = pickN(dishPool, Math.min(count, dishPool.length));
  return chosen.map((dish) => {
    const isVeg = VEG_DISHES.has(dish);
    const price = randInt(99, 449);
    const rating = rand(3.6, 4.9);
    const reviewCount = randInt(15, 980);
    return {
      id: `D${dishIdCounter++}`,
      restaurantId,
      name: dish,
      description: pick(DESCRIPTIONS),
      category: cuisines[0],
      price,
      isVeg,
      isBestseller: Math.random() < 0.25,
      available: Math.random() > 0.06,
      image: realDishImage({ id: `D${dishIdCounter}`, name: dish, category: cuisines[0] }, 320, 220),
      rating,
      reviewCount,
    };
  });
}

const restaurants = [];
const TARGET = 54;

for (let i = 0; i < TARGET; i++) {
  const numCuisines = Math.random() < 0.25 ? 2 : 1;
  const cuisines = pickN(CUISINES, numCuisines);
  const name = makeRestaurantName();
  const id = `R${restIdCounter++}`;
  const color = pick(COLORS);
  const rating = rand(3.5, 4.9);
  const reviewCount = randInt(80, 5400);
  const deliveryTime = randInt(18, 50);
  const costForTwo = randInt(150, 950);
  const isVeg = cuisines.includes("Healthy") ? true : Math.random() < 0.2;
  const hasOffer = Math.random() < 0.45;
  const offerText = hasOffer ? pick(["50% OFF up to ₹100", "Flat ₹125 OFF above ₹399", "Free delivery", "20% OFF up to ₹80", "Buy 1 Get 1 Free"]) : null;
  const openNow = Math.random() < 0.85;
  const city = pick(CITIES);

  const menu = makeMenu(id, cuisines, color);
  const popularDishes = pickN(menu, Math.min(3, menu.length)).map((d) => d.name);

  restaurants.push({
    id,
    slug: `${slugify(name)}-${id.toLowerCase()}`,
    name,
    cuisines,
    rating,
    reviewCount,
    deliveryTime,
    costForTwo,
    isVeg,
    isNonVegAvailable: !isVeg,
    hasOffer,
    offerText,
    openNow,
    city,
    address: `${randInt(1, 200)}, ${pick(["MG Road", "Park Street", "Linking Road", "Brigade Road", "FC Road", "Banjara Hills", "Anna Salai", "Camac Street"])}, ${city}`,
    popularDishes,
    image: realRestaurantImage({ id, cuisines, name }, 640, 400),
    banner: realRestaurantImage({ id, cuisines, name }, 1200, 480),
    menu,
  });
}

const CATEGORIES = [
  { name: "North Indian", image: realCategoryImage("North Indian") },
  { name: "Chinese", image: realCategoryImage("Chinese") },
  { name: "Italian", image: realCategoryImage("Italian") },
  { name: "Biryani", image: realCategoryImage("Biryani") },
  { name: "South Indian", image: realCategoryImage("South Indian") },
  { name: "Fast Food", image: realCategoryImage("Fast Food") },
  { name: "Mexican", image: realCategoryImage("Mexican") },
  { name: "Desserts", image: realCategoryImage("Desserts") },
  { name: "Healthy", image: realCategoryImage("Healthy") },
].map((c) => ({
  ...c,
  count: restaurants.filter((r) => r.cuisines.includes(c.name)).length,
}));

const out = `// AUTO-GENERATED MOCK DATA — replace with real API calls once the
// Express + MySQL backend is wired up. Regenerate via:
//   node scripts/generate-data.cjs
export const categories = ${JSON.stringify(CATEGORIES, null, 2)};

export const restaurants = ${JSON.stringify(restaurants, null, 2)};

export const allMenuItems = restaurants.flatMap((r) =>
  r.menu.map((item) => ({ ...item, restaurantName: r.name, restaurantSlug: r.slug }))
);
`;

const outPath = path.join(__dirname, "..", "src", "data", "restaurants.js");
fs.writeFileSync(outPath, out);
console.log(`Generated ${restaurants.length} restaurants -> ${outPath}`);
