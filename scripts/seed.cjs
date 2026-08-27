const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Loading generated data...");
  const dataPath = path.resolve(__dirname, '../src/data/restaurants.js');
  let rawData = fs.readFileSync(dataPath, 'utf-8');
  
  // Extract JSON from the JS file
  const jsonMatch = rawData.match(/export const restaurants = (\[[\s\S]*?\]);/);
  if (!jsonMatch) {
    console.error("Could not parse restaurants.js. Make sure to run 'npm run generate:data' first.");
    process.exit(1);
  }

  const restaurantsData = JSON.parse(jsonMatch[1]);
  console.log(`Found ${restaurantsData.length} restaurants to insert.`);

  for (const r of restaurantsData) {
    const { menu, ...restData } = r;

    // Convert fields to match DB snake_case schema
    const dbRest = {
      id: restData.id,
      slug: restData.slug,
      name: restData.name,
      cuisines: restData.cuisines,
      rating: restData.rating,
      review_count: restData.reviewCount,
      delivery_time: restData.deliveryTime,
      cost_for_two: restData.costForTwo,
      is_veg: restData.isVeg,
      is_non_veg_available: restData.isNonVegAvailable,
      has_offer: restData.hasOffer,
      offer_text: restData.offerText,
      open_now: restData.openNow,
      city: restData.city,
      address: restData.address,
      popular_dishes: restData.popularDishes,
      image: restData.image,
      banner: restData.banner
    };

    const { error: rErr } = await supabase.from('restaurants').upsert(dbRest);
    if (rErr) {
      console.error(`Error inserting restaurant ${dbRest.name}:`, rErr.message);
      continue;
    }

    const dbMenus = menu.map(m => ({
      id: m.id,
      restaurant_id: m.restaurantId,
      name: m.name,
      description: m.description,
      category: m.category,
      price: m.price,
      is_veg: m.isVeg,
      is_bestseller: m.isBestseller,
      available: m.available,
      image: m.image,
      rating: m.rating,
      review_count: m.reviewCount
    }));

    const { error: mErr } = await supabase.from('menu_items').upsert(dbMenus);
    if (mErr) {
      console.error(`Error inserting menu items for ${dbRest.name}:`, mErr.message);
    }
  }

  console.log("Seeding complete!");
}

seed();
