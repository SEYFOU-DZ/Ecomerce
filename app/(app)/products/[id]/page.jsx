"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BsChevronRight, BsChevronLeft, BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { http } from "@/lib/http";
import { useCart } from "@/app/providers/CartProvider";
import { useLocale } from "@/app/providers/LocaleProvider";
import { flyImageToCart } from "@/lib/flyToCart";
import { formatPrice } from "@/lib/formatPrice";
import ProductFavoriteHeart from "@/app/components/store/ProductFavoriteHeart";
import { cacheProductDetail, getCachedProductDetail } from "@/lib/detailCache";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { addItem, cartAnchorRef } = useCart();
  const { t, isRtl } = useLocale();
  const addBtnRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loadState, setLoadState] = useState("loading");
  const [imgIndex, setImgIndex] = useState(0);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [mainImgLoaded, setMainImgLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setMainImgLoaded(false);
    let cancelled = false;

    // Fast path: session cache (helps when clicking from home/favorites).
    const cached = getCachedProductDetail(id);
    const isCacheUsable =
      cached &&
      cached.mainImage &&
      typeof cached.description === "string" &&
      Array.isArray(cached.colors) &&
      Array.isArray(cached.sizes);

    if (isCacheUsable) {
      setProduct(cached);
      setLoadState("ok");
      return;
    }

    (async () => {
      try {
        const res = await http.get(`api/products/${id}`);
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        if (!cancelled) {
          setProduct(data);
          setLoadState("ok");
          cacheProductDetail(data);
        }
      } catch {
        if (!cancelled) setLoadState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];
    const m = product.mainImage ? [product.mainImage] : [];
    const s = Array.isArray(product.subImages) ? product.subImages : [];
    return [...m, ...s].filter(Boolean);
  }, [product]);

  const sizes = product?.sizes?.length ? product.sizes : [];
  const colors = product?.colors?.length ? product.colors : [];

  useEffect(() => {
    setImgIndex(0);
    setSize(null);
    setColor(null);
    setMainImgLoaded(false);
  }, [id]);

  const activeImg = images[imgIndex] || "";

  useEffect(() => {
    setMainImgLoaded(false);
  }, [activeImg]);

  const mainImgRef = useCallback((node) => {
    if (!node) return;
    if (node.complete && node.naturalWidth > 0) {
      setMainImgLoaded(true);
    }
  }, []);

  const canAdd =
    product &&
    (sizes.length === 0 || size) &&
    (colors.length === 0 || color);

  const handleAdd = () => {
    if (!product || !canAdd) return;
    const anchor = cartAnchorRef?.current;
    const btn = addBtnRef.current;
    if (anchor && btn && product.mainImage) {
      flyImageToCart({
        fromEl: btn,
        toEl: anchor,
        imageSrc: product.mainImage,
      });
    }
    addItem({
      product,
      quantity: 1,
      size: size || null,
      color: color || null,
    });
  };

  const BackIcon = isRtl ? BsArrowRight : BsArrowLeft;

  if (loadState === "loading") {
    return (
      <div className="min-h-[60vh] bg-[#f6faf9] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <div className="aspect-[3/4] rounded-2xl bg-stone-200/60 animate-pulse" />
          </div>
          <div>
            <div className="h-7 w-3/5 rounded bg-stone-200/60 animate-pulse" />
            <div className="mt-4 h-9 w-2/5 rounded bg-stone-200/60 animate-pulse" />
            <div className="mt-8 space-y-3">
              <div className="h-4 w-1/3 rounded bg-stone-200/60 animate-pulse" />
              <div className="h-10 w-full rounded bg-stone-200/60 animate-pulse" />
              <div className="h-10 w-full rounded bg-stone-200/60 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadState === "error" || !product) {
    return (
      <div
        className="min-h-[50vh] flex flex-col items-center justify-center gap-3 bg-[#f6faf9] px-4 text-center"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <p className="text-stone-600 text-sm">{t("detail.loadError")}</p>
        <Link
          href="/"
          className="text-sm font-medium text-primary hover:text-secondary underline underline-offset-4"
        >
          {t("detail.backShop")}
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white to-[#f0f7f6]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
        >
          <BackIcon className="text-base" />
          {t("detail.back")}
        </button>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-100 ring-1 ring-stone-200/80">
              {!mainImgLoaded && activeImg ? (
                <div className="absolute inset-0 bg-stone-200/60 animate-pulse" aria-hidden />
              ) : null}
              {activeImg ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  ref={mainImgRef}
                  key={activeImg}
                  src={activeImg}
                  alt={product.title}
                  loading="eager"
                  decoding="async"
                  onLoad={() => setMainImgLoaded(true)}
                  onError={() => setMainImgLoaded(true)}
                  className={`h-full w-full object-cover transition-opacity duration-300 ${
                    mainImgLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              ) : null}
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setImgIndex(
                        (i) => (i - 1 + images.length) % images.length
                      )
                    }
                    className="absolute start-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md border border-white/90 bg-white text-stone-800 shadow-md hover:bg-stone-50 transition-colors"
                    aria-label={t("product.prevImage")}
                  >
                    <BsChevronLeft className="text-lg" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setImgIndex((i) => (i + 1) % images.length)
                    }
                    className="absolute end-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md border border-white/90 bg-white text-stone-800 shadow-md hover:bg-stone-50 transition-colors"
                    aria-label={t("product.nextImage")}
                  >
                    <BsChevronRight className="text-lg" />
                  </button>
                </>
              ) : null}
            </div>
            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImgIndex(i)}
                    className={`relative h-14 w-12 flex-shrink-0 overflow-hidden rounded-md ring-2 ring-offset-2 ring-offset-white transition-all ${
                      i === imgIndex
                        ? "ring-primary"
                        : "ring-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      loading={i === imgIndex ? "eager" : "lazy"}
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl leading-tight">
              {product.title}
            </h1>
            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-2xl font-semibold tabular-nums text-stone-900/70">
                {formatPrice(product.price, product.currency)}
              </p>
              <ProductFavoriteHeart product={product} />
            </div>

            {sizes.length > 0 ? (
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  {t("detail.size")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`min-w-[2.75rem] rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        size === s
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-stone-200 bg-white text-stone-800 hover:border-primary/40"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {colors.length > 0 ? (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  {t("detail.color")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      title={c}
                      className={`flex h-10 w-10 items-center justify-center rounded-md border-2 transition-all ${
                        color === c
                          ? "border-primary scale-105 ring-2 ring-primary/25"
                          : "border-stone-200 hover:border-primary/35"
                      }`}
                    >
                      <span
                        className="h-7 w-7 rounded-sm border border-stone-200/80"
                        style={{ backgroundColor: c }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8 border-t border-stone-200/80 pt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                {t("detail.description")}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
                {product.description}
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                ref={addBtnRef}
                type="button"
                disabled={!canAdd}
                onClick={handleAdd}
                className="rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-stone-900"
              >
                {t("detail.addToCart")}
              </button>
              {!canAdd ? (
                <p className="text-xs text-stone-500 sm:ms-2">
                  {sizes.length > 0 && !size
                    ? t("detail.hintSize")
                    : colors.length > 0 && !color
                    ? t("detail.hintColor")
                    : null}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
