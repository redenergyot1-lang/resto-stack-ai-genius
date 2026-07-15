// RestoStack AI customer-service assistant.
// Uses Lovable AI Gateway (google/gemini-3.5-flash) with tool-calling so
// the client can perform cart actions (add / remove / clear / navigate).
// The full restaurant + dish catalog is sent as compact JSON context.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM = `You are the RestoStack Customer Assistant — a friendly, concise support agent for the RestoStack food-delivery platform.

Rules:
- ONLY answer questions about RestoStack: restaurants, menus, food, ordering, cart, delivery, payments, refunds, tracking, account help.
- Politely refuse unrelated topics ("I only help with RestoStack — anything about restaurants, food, or your order?").
- Base answers on the RESTAURANT_CONTEXT JSON provided; do not invent restaurants or dishes.
- Keep replies short (1–4 sentences). Use markdown lists for recommendations.
- When the user asks to add/remove items or manage the cart, call the matching tool.
- When you recommend items, remember the ordered list — if the user next says "add the first / second / cheapest / highest rated one", pick correctly and call add_to_cart.
- Prices are in INR (₹). Ratings are out of 5.

Website FAQ (use these when asked):
- Ordering: browse a city → pick a restaurant → add dishes → open cart → checkout.
- Payments: UPI, cards, net-banking, cash on delivery.
- Delivery: typical 20–50 min, tracked live once the order is placed.
- Refunds: raised from Dashboard → Orders within 24 h of delivery; processed in 3–5 business days.
- Support: email support@restostack.example or use Contact page.
`;

interface ChatBody {
  messages: { role: string; content: string }[];
  context: string; // stringified restaurant summary
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = (await req.json()) as ChatBody;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tools = [
      {
        type: "function",
        function: {
          name: "add_to_cart",
          description: "Add a specific dish to the user's cart. Use dishId from RESTAURANT_CONTEXT.",
          parameters: {
            type: "object",
            properties: {
              dishId: { type: "string", description: "Dish id like D42" },
              quantity: { type: "number", description: "Quantity to add", default: 1 },
            },
            required: ["dishId"],
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

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: fullMessages,
        tools,
        tool_choice: "auto",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit — please retry shortly." }), {
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
