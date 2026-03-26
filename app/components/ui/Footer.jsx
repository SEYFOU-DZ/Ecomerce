"use client";

import Link from "next/link";
import { useLocale } from "@/app/providers/LocaleProvider";
import { BsArrowRight } from "react-icons/bs";
import BrandMark from "@/app/components/ui/BrandMark";

export default function Footer() {
  const { t, isRtl } = useLocale();

  return (
    <footer
      dir={isRtl ? "rtl" : "ltr"}
      className="mt-14 border-t border-stone-200/70 bg-white/70 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-stone-900">
              {t("footer.aboutTitle")}
            </p>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t("footer.aboutText")}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-stone-900">
              {t("footer.linksTitle")}
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
              >
                <BsArrowRight className="opacity-70" /> {t("footer.shop")}
              </Link>
              <Link
                href="/favorites"
                className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
              >
                <BsArrowRight className="opacity-70" /> {t("footer.favorites")}
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
              >
                <BsArrowRight className="opacity-70" /> {t("footer.signIn")}
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-stone-900">
              {t("footer.newsletter")}
            </p>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t("footer.newsletterText")}
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2"
            >
              <input
                type="email"
                required
                placeholder={t("footer.emailPlaceholder")}
                className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/25"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary transition-colors whitespace-nowrap"
              >
                {t("footer.subscribe")}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-stone-200/80 pt-8">
          <div className="flex items-center gap-3">
            <BrandMark size="xs" showTitle={false} />
            <span className="text-xs font-black tracking-[0.2em] text-stone-800">
              MA-AP{" "}
              <span className="font-light tracking-normal text-stone-400">STORE</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 text-center">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
