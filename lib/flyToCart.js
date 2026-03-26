/**
 * Animate a small product thumbnail from `fromEl` toward the cart icon `toEl`.
 * Uses transform for GPU-friendly motion.
 */
export function flyImageToCart({ fromEl, toEl, imageSrc }) {
  if (typeof window === "undefined" || !fromEl || !toEl || !imageSrc) return;

  const from = fromEl.getBoundingClientRect();
  const to = toEl.getBoundingClientRect();

  const size = 52;
  const startX = from.left + from.width / 2 - size / 2;
  const startY = from.top + from.height / 2 - size / 2;
  const endX = to.left + to.width / 2 - size / 2;
  const endY = to.top + to.height / 2 - size / 2;

  const el = document.createElement("img");
  el.src = imageSrc;
  el.alt = "";
  el.decoding = "async";
  el.className =
    "pointer-events-none fixed z-[9998] rounded-md object-cover shadow-md ring-1 ring-black/10";
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.left = `${startX}px`;
  el.style.top = `${startY}px`;
  el.style.opacity = "0.95";

  document.body.appendChild(el);

  const dx = endX - startX;
  const dy = endY - startY;

  requestAnimationFrame(() => {
    el.style.transition =
      "transform 0.62s cubic-bezier(0.22, 0.95, 0.36, 1), opacity 0.62s ease-out";
    el.style.transform = `translate(${dx}px, ${dy}px) scale(0.18)`;
    el.style.opacity = "0.2";
  });

  window.setTimeout(() => {
    el.remove();
  }, 680);
}
