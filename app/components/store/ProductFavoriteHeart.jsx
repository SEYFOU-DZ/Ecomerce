"use client";

import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useFavorites } from "@/app/providers/FavoritesProvider";
import { useLocale } from "@/app/providers/LocaleProvider";

export default function ProductFavoriteHeart({ product, className = "" }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useLocale();
  if (!product?._id) return null;
  const on = isFavorite(product._id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(product);
      }}
      className={`inline-flex items-center justify-center rounded-full p-0.5 transition-transform hover:scale-110 active:scale-95 ${className}`}
      aria-pressed={on}
      aria-label={on ? t("favorites.removeAria") : t("favorites.addAria")}
    >
      {on ? (
        <AiFillHeart className="text-[1.15rem] sm:text-xl text-rose-500 drop-shadow-sm" />
      ) : (
        <AiOutlineHeart className="text-[1.15rem] sm:text-xl text-rose-400/90 hover:text-rose-500" />
      )}
    </button>
  );
}
