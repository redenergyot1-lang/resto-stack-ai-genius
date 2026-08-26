/**
 * Wraps the first case-insensitive match of `query` inside `text` in a
 * <mark>. Used to visually highlight search matches in dish names,
 * categories, descriptions, and restaurant/dish names in the global search.
 * Returns the original text untouched when there's no query or no match.
 */
export function highlightMatch(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-gold-100 text-ink-900 rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}
