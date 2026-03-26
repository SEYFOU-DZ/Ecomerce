"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BsX, BsPlus, BsDash, BsTrash } from "react-icons/bs";
import { useCart } from "@/app/providers/CartProvider";
import { useLocale } from "@/app/providers/LocaleProvider";
import { formatPrice, formatCartSubtotal } from "@/lib/formatPrice";

export default function CartDrawer() {
  const {
    open,
    setOpen,
    items,
    setLineQuantity,
    removeLine,
    subtotal,
    totalQuantity,
  } = useCart();
  const { t, isRtl } = useLocale();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/25"
        aria-label={t("cartDrawer.close")}
        onClick={() => setOpen(false)}
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col bg-[#f8fbfa] shadow-[0_0_0_1px_rgba(0,0,0,0.04)] animate-in slide-in-from-right duration-200"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <header className="flex items-center justify-between border-b border-stone-200/80 px-5 py-4 bg-white/80">
          <div>
            <h2 className="text-base font-semibold text-stone-800">
              {t("cartDrawer.title")}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {totalQuantity === 0
                ? t("cartDrawer.emptyCount")
                : t("cartDrawer.itemsCount", { n: totalQuantity })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-2 text-stone-500 hover:bg-stone-200/60 hover:text-stone-800 transition-colors"
            aria-label={t("cartDrawer.close")}
          >
            <BsX className="text-xl" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-16 px-2">
              {t("cartDrawer.emptyHint")}
            </p>
          ) : (
            items.map((line) => (
              <div
                key={line.lineId}
                className="flex gap-3 rounded-lg border border-stone-200/90 bg-white p-3"
              >
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={line.image}
                    alt={line.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-800 truncate">
                    {line.title}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-stone-500">
                    {line.size ? (
                      <span>
                        {t("cartDrawer.sizeLabel")}: {line.size}
                      </span>
                    ) : null}
                    {line.color ? (
                      <span className="inline-flex items-center gap-1">
                        {t("cartDrawer.colorLabel")}:
                        <span
                          className="inline-block h-3 w-3 rounded-sm border border-stone-200"
                          style={{ backgroundColor: line.color }}
                        />
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-stone-900/70 font-semibold tabular-nums">
                    {formatPrice(line.price, line.currency)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="inline-flex items-center rounded-md border border-stone-200 bg-stone-50">
                      <button
                        type="button"
                        className="p-1.5 text-stone-600 hover:bg-stone-200/80 rounded-e-md transition-colors"
                        onClick={() =>
                          setLineQuantity(line.lineId, line.quantity - 1)
                        }
                        aria-label={t("cartDrawer.decrease")}
                      >
                        <BsDash className="text-sm" />
                      </button>
                      <span className="min-w-[2rem] text-center text-xs font-medium text-stone-800">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="p-1.5 text-stone-600 hover:bg-stone-200/80 rounded-s-md transition-colors"
                        onClick={() =>
                          setLineQuantity(line.lineId, line.quantity + 1)
                        }
                        aria-label={t("cartDrawer.increase")}
                      >
                        <BsPlus className="text-sm" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.lineId)}
                      className="rounded-md p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      aria-label={t("cartDrawer.remove")}
                    >
                      <BsTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 ? (
          <footer className="border-t border-stone-200/80 bg-white px-5 py-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">{t("cartDrawer.subtotal")}</span>
              <span className="font-semibold text-stone-800 tabular-nums">
                {formatCartSubtotal(items, subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              {t("cartDrawer.shippingNote")}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="block w-full rounded-md bg-primary py-2.5 text-center text-sm font-semibold text-white hover:bg-secondary transition-colors"
              >
                {t("cartDrawer.checkout")}
              </Link>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="block w-full rounded-md border border-stone-200 bg-white py-2.5 text-center text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                {t("cartDrawer.continue")}
              </Link>
            </div>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
