-- Enrich offer variety so different offer filters return different restaurants
WITH pool AS (
  SELECT id, row_number() OVER (ORDER BY id) AS rn
  FROM public.restaurants WHERE offer_text IS NULL
)
UPDATE public.restaurants r
SET has_offer = true,
    offer_text = CASE (p.rn % 5)
      WHEN 0 THEN '30% OFF up to ₹90'
      WHEN 1 THEN 'Free delivery'
      WHEN 2 THEN '35% OFF up to ₹120'
      WHEN 3 THEN 'Free delivery + 20% OFF'
      ELSE '25% OFF up to ₹70'
    END
FROM pool p
WHERE r.id = p.id AND p.rn <= 60;