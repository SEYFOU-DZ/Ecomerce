"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { useLocale } from "@/app/providers/LocaleProvider";
import { formatPrice } from "@/lib/formatPrice";
import ProductFavoriteHeart from "@/app/components/store/ProductFavoriteHeart";
import { cacheProductDetail } from "@/lib/detailCache";

export default function ProductCard({ product }) {
  const { t } = useLocale();
  const images = useMemo(() => {
    const main = product.mainImage ? [product.mainImage] : [];
    const subs = Array.isArray(product.subImages) ? product.subImages : [];
    return [...main, ...subs].filter(Boolean);
  }, [product.mainImage, product.subImages]);

  const [index, setIndex] = useState(0);
  const active = images[index] || "";
  const hasMany = images.length > 1;

  const prev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i - 1 + images.length) % images.length);
  };
  const next = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + 1) % images.length);
  };

  return (
    <article
      tabIndex={0}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-stone-200/80 bg-white outline-none transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_10px_36px_-18px_rgba(2,195,182,0.35)] focus-visible:-translate-y-0.5 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f8f7]"
    >
      <div className="relative aspect-[3/4] bg-stone-100">
        {active ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={active}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400 text-xs px-2 text-center">
            {t("product.noImage")}
          </div>
        )}

        {hasMany ? (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute start-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-white/90 bg-white/95 text-stone-800 shadow-sm hover:bg-white"
              aria-label={t("product.prevImage")}
            >
              <BsChevronLeft className="text-base" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute end-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-white/90 bg-white/95 text-stone-800 shadow-sm hover:bg-white"
              aria-label={t("product.nextImage")}
            >
              <BsChevronRight className="text-base" />
            </button>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-0.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-3 bg-primary" : "w-1 bg-stone-400/50"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

        <div className="flex flex-1 flex-col p-3 pt-2.5">
        <h2 className="line-clamp-2 text-[13px] sm:text-sm font-semibold leading-snug text-stone-900">
          {product.title}
        </h2>
        <div className="mt-1.5 flex items-center justify-between gap-2 w-full min-w-0">
          <p className="text-sm font-semibold tracking-tight text-stone-900/70 tabular-nums truncate min-w-0">
            {formatPrice(product.price, product.currency)}
          </p>
          <ProductFavoriteHeart product={product} className="flex-shrink-0 -me-0.5" />
        </div>
      </div>

      <div className="px-3 pb-3 pt-0">
        <Link
          href={`/products/${product._id}`}
          onMouseEnter={() => cacheProductDetail(product)}
          onFocus={() => cacheProductDetail(product)}
          onClick={() => cacheProductDetail(product)}
          className="flex w-full items-center justify-center rounded-md border border-stone-900/10 bg-stone-900 py-2 text-xs font-medium text-white transition-colors hover:bg-primary hover:border-primary"
        >
          {t("product.viewDetails")}
        </Link>
      </div>
    </article>
  );
}
