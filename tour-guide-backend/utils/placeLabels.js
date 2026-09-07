export const dedupePlaceLabels = (categories = [], tags = []) => {
  const seen = new Set();
  const unique = (values) => values.filter((value) => {
    const key = String(value).trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { categories: unique(categories), tags: unique(tags) };
};
