"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { http } from "@/lib/http";
import ProductCard from "@/app/components/store/ProductCard";
import { useLocale } from "@/app/providers/LocaleProvider";
import { BsChevronLeft, BsChevronRight, BsCheckCircleFill, BsX } from "react-icons/bs";
import BrandMark from "@/app/components/ui/BrandMark";

export default function Home() {
  const { t, isRtl } = useLocale();
  const [products, setProducts] = useState([]);
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [orderBanner, setOrderBanner] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("ordered") !== "1") return;
    const raw = params.get("num");
    setOrderBanner({ num: raw ? decodeURIComponent(raw) : undefined });
    const url = new URL(window.location.href);
    url.searchParams.delete("ordered");
    url.searchParams.delete("num");
    const next = url.pathname + (url.search || "");
    window.history.replaceState({}, "", next || url.pathname);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await http.get("api/products");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setProducts(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const paginated = products.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    // If filters/data changes, keep page in bounds.
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white via-[#f6faf9] to-[#eef5f4]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {orderBanner ? (
        <div className="sticky top-[52px] z-40 border-b border-emerald-200/80 bg-emerald-50/95 px-4 py-3 shadow-sm backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center gap-3 sm:px-6">
            <BsCheckCircleFill className="flex-shrink-0 text-lg text-emerald-600" aria-hidden />
            <p className="min-w-0 flex-1 text-sm text-emerald-950">
              {isRtl ? (
                <>
                  تم استلام طلبك بنجاح
                  {orderBanner.num ? (
                    <span className="mt-0.5 block font-mono text-xs text-emerald-800/90">
                      رقم الطلب: {orderBanner.num}
                    </span>
                  ) : null}
                  <span className="mt-1 block text-xs text-emerald-800/80">
                    سنتواصل معك قريباً.
                  </span>
                </>
              ) : (
                <>
                  Your order was received.
                  {orderBanner.num ? (
                    <span className="mt-0.5 block font-mono text-xs text-emerald-800/90">
                      Order #{orderBanner.num}
                    </span>
                  ) : null}
                  <span className="mt-1 block text-xs text-emerald-800/80">
                    We’ll be in touch shortly.
                  </span>
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => setOrderBanner(null)}
              className="flex-shrink-0 rounded-lg p-1.5 text-emerald-700 transition-colors hover:bg-emerald-100/80"
              aria-label={isRtl ? "إغلاق" : "Dismiss"}
            >
              <BsX className="text-lg" />
            </button>
          </div>
        </div>
      ) : null}
      <section className="relative overflow-hidden border-b border-primary/10">
        <div
          className="pointer-events-none absolute -end-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -start-16 h-56 w-56 rounded-full bg-secondary/20 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-10">
            {/* Intro: on small screens — compact logo beside copy; on lg — copy only in this column */}
            <div>
              <div className="flex flex-row items-start gap-3 sm:gap-5">
                <div className="relative flex-shrink-0 pt-0.5 lg:hidden">
                  <div
                    className="pointer-events-none absolute -inset-4 rounded-full bg-primary/12 blur-xl sm:-inset-6"
                    aria-hidden
                  />
                  <div className="relative transition-transform duration-500 hover:-translate-y-0.5">
                    <BrandMark size="compact" showTitle={false} interactive />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="inline-flex items-center rounded-full border border-primary/20 bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary sm:px-3 sm:py-1 sm:text-[11px] sm:tracking-[0.14em]">
                    {t("home.heroBadge")}
                  </p>
                  <h1 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-stone-900 sm:mt-5 sm:text-3xl lg:text-[2.65rem] lg:leading-[1.12]">
                    {t("home.heroTitle")}
                  </h1>
                  <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-stone-600 sm:mt-4 sm:text-[15px]">
                    {t("home.heroSubtitle")}
                  </p>
                  <Link
                    href="#collection"
                    className="mt-5 inline-flex items-center gap-2 rounded-md bg-stone-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary sm:mt-8 sm:px-5 sm:py-2.5 sm:text-sm"
                  >
                    {t("home.heroCta")}
                    <span
                      className={`text-[10px] opacity-80 sm:text-xs ${isRtl ? "rotate-180" : ""}`}
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Large brand — desktop only */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative flex h-72 w-72 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative transition-transform duration-500 hover:-translate-y-1">
                  <BrandMark size="hero" showTitle interactive />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section
        id="collection"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 scroll-mt-[4.5rem]"
      >
        {!ready ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-stone-200/80 bg-white"
              >
                <div className="aspect-[3/4] animate-pulse bg-stone-200/60" />
                <div className="space-y-2 p-3">
                  <div className="h-3 w-4/5 animate-pulse rounded bg-stone-200/80" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-stone-200/80" />
                  <div className="h-8 animate-pulse rounded-md bg-stone-200/80" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="py-20 text-center text-sm text-stone-500">
            {t("home.empty")}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {paginated.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  {isRtl ? <BsChevronRight /> : <BsChevronLeft />}
                </button>
                <div className="text-sm text-stone-600 px-2">
                  Page <span className="font-semibold text-stone-900">{page}</span> /{" "}
                  {totalPages}
                </div>
                <button
                  type="button"
                  className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  {isRtl ? <BsChevronLeft /> : <BsChevronRight />}
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
