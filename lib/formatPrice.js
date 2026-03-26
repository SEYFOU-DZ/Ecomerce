/** @typedef {'DA' | 'USD'} StoreCurrency */

/**
 * @param {unknown} currency
 * @returns {'DA' | 'USD'}
 */
export function normalizeCurrency(currency) {
  return currency === "USD" ? "USD" : "DA";
}

/**
 * @param {number} amount
 * @param {unknown} currency
 */
export function formatPrice(amount, currency) {
  const c = normalizeCurrency(currency);
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  if (c === "USD") {
    return `$${safe.toFixed(2)}`;
  }
  const formatted = safe.toLocaleString("fr-DZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${formatted} DA`;
}

/**
 * Subtotal when cart lines may mix currencies (shows plain number if mixed).
 * @param {{ price: number, quantity: number, currency?: string }[]} items
 * @param {number} subtotal
 */
export function formatCartSubtotal(items, subtotal) {
  if (!items.length) return formatPrice(0, "DA");
  const first = normalizeCurrency(items[0].currency);
  const mixed = items.some(
    (l) => normalizeCurrency(l.currency) !== first
  );
  if (mixed) {
    return `${Number(subtotal).toFixed(2)}`;
  }
  return formatPrice(subtotal, first);
}
