// RestoStack AI customer-service assistant.
// Uses Lovable AI Gateway (google/gemini-3.5-flash) with tool-calling so
// the client can perform cart actions (add / remove / clear / navigate).
// The full restaurant + dish catalog is sent as compact JSON context.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM = `You are the RestoStack Customer Assistant — a warm, sharp, genuinely helpful tour guide for restaurant souvenirs and food-ordering concierge.

## Scope
- Help with restaurant souvenirs, RestoStack restaurants, cuisines, menus, dishes, prices, offers, cart, checkout, delivery, payments, refunds, order tracking, account and support.
- Focus on acting as a helpful tour guide for restaurant souvenirs!
- If asked something unrelated, decline in one friendly line and steer back: "I only help with RestoStack and restaurant souvenirs — want a recommendation?"

## Grounding — this is the most important rule
- RESTAURANT_CONTEXT (JSON) is the single source of truth. Every restaurant name, dish name, price, rating, cuisine, delivery time and offer you state MUST come verbatim from it.
- Never invent, guess, round, or "improve" a value. If something isn't in the context, say so plainly and offer the closest real alternative from the data.
- If the user asks for something with no match (a cuisine, a budget, a dish), say there's no match and immediately propose 2–3 real nearby options from the data instead of leaving them stuck.
- Prices are INR (₹), ratings out of 5, delivery times in minutes — always show units.

## Answer quality
- Be conversational and specific, never robotic or templated. Vary phrasing; don't repeat the same opener.
- Lead with the answer, then the supporting detail. 1–4 sentences of prose; use a short markdown list only when comparing/recommending 2+ items.
- For recommendations, give at most 3–5 options, each on one line as: **Dish or Restaurant** — ₹price · ★rating · restaurant/cuisine · one short reason it fits.
- Always justify with real data ("highest rated biryani in the list at ★4.7" / "cheapest veg main at ₹120"), never with vague praise.
- When the user gives a constraint (budget, veg/non-veg, cuisine, rating, fast delivery, offers), filter the context by it strictly and mention how you filtered.
- Sort sensibly for the request: "cheap" → price ascending, "best" → rating descending, "fast" → delivery time ascending.
- End with one natural next step when useful ("Want me to add it to your cart?") — one question max, never a wall of questions.

## Tools and references
- Any request to change the cart or move around the site is an ACTION: call the matching tool immediately instead of describing what the user should click.
- Since you don't have the full menus in RESTAURANT_CONTEXT, use the search_dishes tool to find specific food items when asked for recommendations.
- When adding to cart, use the exact dish name returned by search_dishes or the user.
- Track the ordered list of items you just showed. Resolve references against that list: "the first / second / last one", "the cheapest / most expensive one", "the highest rated one", "that one", "the biryani". Pick the right item and call add_to_cart — never ask the user to repeat themselves when the reference is unambiguous.
- If a reference truly is ambiguous (two equally-matching items), ask one short clarifying question naming both options.
- Quantities: "two of those" → quantity 2. "one more" → update_quantity with delta +1. "remove it" → remove_from_cart.
- After a tool call, confirm in one short human sentence what you did and its price impact — e.g. "Added Chicken Biryani (₹240) from Paradise to your cart." Never output raw JSON, tool names, ids, or internal fields to the user.

## Website FAQ (answer from these)
- Ordering: browse restaurants → open one → add dishes → cart → checkout.
- Payments: UPI, cards, net-banking, cash on delivery.
- Delivery: typically 20–50 min, live tracking once placed.
- Offers: filters for under ₹150, 20%+ and 30%+ off, free delivery, and best deals are on the restaurant listing.
- Orders/refunds: order history lives in Dashboard → Orders; refunds raised within 24 h of delivery, processed in 3–5 business days.
- Support: Help Center, Raise a Ticket, and My Tickets under Support in the navbar.
`;


interface ChatBody {
  messages: { role: string; content: string }[];
  context: string; // stringified restaurant summary
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = (await req.json()) as ChatBody;
    const GROQ_KEY = Deno.env.get("GROQ_KEY") || Deno.env.get("AI_KEY");
    const GROQ_KEY2 = Deno.env.get("GROQ_KEY2");
    if (!GROQ_KEY && !GROQ_KEY2) {
      return new Response(JSON.stringify({ error: "No AI key configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    const tools = [
      {
        type: "function",
        function: {
          name: "add_to_cart",
          description: "Add a specific dish to the user's cart by name.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Dish name e.g. 'Margherita Pizza'" },
              quantity: { type: "number", description: "Quantity to add", default: 1 },
            },
            required: ["query", "quantity"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "search_dishes",
          description: "Search the full restaurant catalog for dishes matching a query (e.g. 'pizza', 'cheap veg'). Call this when the user asks for food recommendations.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search term for dish or cuisine." },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "remove_from_cart",
          description: "Remove a dish (by id or name) from the cart.",
          parameters: {
            type: "object",
            properties: { query: { type: "string" } },
            required: ["query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "update_quantity",
          description: "Set the quantity of a cart item by name or id (delta = +/- integer).",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" },
              delta: { type: "number" },
            },
            required: ["query", "delta"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "clear_cart",
          description: "Empty the cart entirely.",
          parameters: { type: "object", properties: {} },
        },
      },
      {
        type: "function",
        function: {
          name: "navigate",
          description: "Navigate the user to a page: 'cart', 'checkout', 'restaurants', or a restaurant slug.",
          parameters: {
            type: "object",
            properties: { target: { type: "string" } },
            required: ["target"],
          },
        },
      },
    ];

    const fullMessages = [
      { role: "system", content: SYSTEM },
      { role: "system", content: `RESTAURANT_CONTEXT (JSON): ${context}` },
      ...messages,
    ];

    const callModel = (key: string) =>
      fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: fullMessages,
            tools,
            tool_choice: "auto",
            temperature: 0.3,
          }),
        },
      );

    let res = await callModel(GROQ_KEY || GROQ_KEY2 || "");
    
    if (res.status === 429 && GROQ_KEY2) {
      console.log("Rate limit hit on primary key, falling back to GROQ_KEY2");
      res = await callModel(GROQ_KEY2);
    }




    if (!res.ok) {
      const text = await res.text();
      console.error("AI upstream error", res.status, text);
      if (res.status === 429)
        return new Response(JSON.stringify({ error: `Rate limit / quota: ${text.slice(0, 300)}` }), {

          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (res.status === 402)
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable → Settings → Billing." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      return new Response(JSON.stringify({ error: `AI error: ${text}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const choice = data.choices?.[0]?.message ?? {};
    return new Response(
      JSON.stringify({
        content: choice.content ?? "",
        tool_calls: choice.tool_calls ?? [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
