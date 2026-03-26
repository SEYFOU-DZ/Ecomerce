"use client";

import Link from "next/link";
import { BsTrash } from "react-icons/bs";
import { useFavorites } from "@/app/providers/FavoritesProvider";
import { useLocale } from "@/app/providers/LocaleProvider";
import { formatPrice } from "@/lib/formatPrice";
import { cacheProductDetail } from "@/lib/detailCache";

export default function FavoritesPage() {
  const { entries, removeFavorite, hydrated } = useFavorites();
  const { t, isRtl } = useLocale();

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white to-[#f0f7f6] py-8 sm:py-12"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="text-2xl font-semibold text-stone-900">
          {t("favorites.title")}
        </h1>
        <div className="mt-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
          >
            {isRtl ? "→" : "←"} {t("detail.backShop")}
          </Link>
        </div>

        {!hydrated ? (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-stone-200 bg-white overflow-hidden animate-pulse"
              >
                <div className="aspect-[3/4] bg-stone-200" />
                <div className="p-3 h-16 bg-stone-50" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="mt-16 text-center max-w-md mx-auto">
            <p className="text-stone-500 text-sm">{t("favorites.empty")}</p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary transition-colors"
            >
              {t("favorites.browse")}
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {entries.map((item) => (
              <li
                key={item.productId}
                className="group rounded-xl border border-stone-200/90 bg-white overflow-hidden shadow-sm hover:border-primary/30 transition-colors relative"
              >
                <button
                  type="button"
                  onClick={() => removeFavorite(item.productId)}
                  className="absolute top-2 end-2 z-10 p-1.5 rounded-md bg-white/90 text-stone-500 hover:bg-rose-50 hover:text-rose-600 shadow-sm border border-stone-200/80 transition-colors"
                  aria-label={t("favorites.removeAria")}
                >
                  <BsTrash className="text-sm" />
                </button>
                <Link
                  href={`/products/${item.productId}`}
                  className="block"
                  onMouseEnter={() =>
                    cacheProductDetail({
                      _id: item.productId,
                      title: item.title,
                      mainImage: item.mainImage,
                      price: item.price,
                      currency: item.currency,
                      description: item.description,
                      colors: item.colors,
                      sizes: item.sizes,
                      subImages: item.subImages,
                    })
                  }
                  onFocus={() =>
                    cacheProductDetail({
                      _id: item.productId,
                      title: item.title,
                      mainImage: item.mainImage,
                      price: item.price,
                      currency: item.currency,
                      description: item.description,
                      colors: item.colors,
                      sizes: item.sizes,
                      subImages: item.subImages,
                    })
                  }
                  onClick={() =>
                    cacheProductDetail({
                      _id: item.productId,
                      title: item.title,
                      mainImage: item.mainImage,
                      price: item.price,
                      currency: item.currency,
                      description: item.description,
                      colors: item.colors,
                      sizes: item.sizes,
                      subImages: item.subImages,
                    })
                  }
                >
                  <div className="aspect-[3/4] bg-stone-100">
                    {item.mainImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.mainImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-stone-800 line-clamp-2">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-stone-900/70 tabular-nums">
                      {formatPrice(item.price, item.currency)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
