/**
 * Simple session cache to make "View details" feel instant.
 * We store the full product object passed from lists (home/favorites).
 */

const makeKey = (id) => `product_detail_cache_${id}`;

export function cacheProductDetail(product) {
  try {
    if (!product?._id) return;
    sessionStorage.setItem(makeKey(product._id), JSON.stringify(product));
  } catch {
    /* ignore */
  }
}

export function getCachedProductDetail(id) {
  try {
    if (!id) return null;
    const raw = sessionStorage.getItem(makeKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

