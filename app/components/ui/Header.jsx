"use client";
import "@/app/globals.css";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  BsFacebook,
  BsTwitter,
  BsInstagram,
  BsLinkedin,
  BsBoxArrowRight,
  BsHandbag,
  BsTranslate,
} from "react-icons/bs";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCart } from "@/app/providers/CartProvider";
import { useLocale } from "@/app/providers/LocaleProvider";
import { useFavorites } from "@/app/providers/FavoritesProvider";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import LogoutConfirmModal from "@/app/(admin)/dashboard/LogoutConfirmModal";

const MENU_W = 192;

export default function Header() {
  const { user, loading, logout } = useAuth();
  const {
    totalQuantity,
    setOpen: setCartOpen,
    hydrated,
    cartAnchorRef,
    bumpCartBadge,
  } = useCart();
  const { count: favCount, hydrated: favHydrated } = useFavorites();
  const { locale, setLocale, t, isRtl } = useLocale();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const avatarBtnRef = useRef(null);
  const menuRef = useRef(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const icons = [BsFacebook, BsTwitter, BsInstagram, BsLinkedin];

  useEffect(() => setMounted(true), []);

  const updateMenuPosition = () => {
    const el = avatarBtnRef.current;
    if (!el || typeof window === "undefined") return;
    const r = el.getBoundingClientRect();
    const pad = 8;
    const maxL = window.innerWidth - MENU_W - pad;
    let left;
    if (isRtl) {
      left = Math.min(Math.max(pad, r.left), maxL);
    } else {
      left = Math.min(Math.max(pad, r.right - MENU_W), maxL);
    }
    setMenuPos({ top: r.bottom + 8, left });
  };

  useLayoutEffect(() => {
    if (!dropdownOpen) return;
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [dropdownOpen, isRtl]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handle = (e) => {
      if (avatarBtnRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [dropdownOpen]);

  const CartButton = (
    <button
      type="button"
      ref={cartAnchorRef}
      onClick={() => setCartOpen(true)}
      className="relative rounded-md p-1.5 sm:p-2 text-stone-600 transition-colors hover:bg-primary/10 hover:text-primary flex-shrink-0"
      aria-label={t("header.cart")}
    >
      <BsHandbag className="text-lg sm:text-xl" />
      {hydrated && totalQuantity > 0 ? (
        <span
          className={`absolute -top-0.5 -end-0.5 min-w-[1.125rem] h-[1.125rem] rounded-full bg-primary px-1 text-[10px] font-bold leading-[1.125rem] text-white text-center shadow-sm ${
            bumpCartBadge ? "animate-cartBump" : ""
          }`}
        >
          {totalQuantity > 99 ? "99+" : totalQuantity}
        </span>
      ) : null}
    </button>
  );

  const FavLink = (
    <Link
      href="/favorites"
      className="relative rounded-md p-1.5 sm:p-2 text-stone-600 transition-colors hover:bg-rose-50 hover:text-rose-500 flex-shrink-0"
      aria-label={t("header.favorites")}
    >
      {favCount > 0 ? (
        <AiFillHeart className="text-lg sm:text-xl text-rose-500" />
      ) : (
        <AiOutlineHeart className="text-lg sm:text-xl text-stone-500" />
      )}
      {favHydrated && favCount > 0 ? (
        <span className="absolute -top-0.5 -end-0.5 min-w-[1rem] h-[1rem] rounded-full bg-rose-500 px-0.5 text-[9px] font-bold leading-[1rem] text-white text-center">
          {favCount > 9 ? "9+" : favCount}
        </span>
      ) : null}
    </Link>
  );

  const LangToggle = (
    <div
      className="flex items-center rounded-md border border-stone-200/90 bg-white p-0.5 shadow-sm flex-shrink-0"
      role="group"
      aria-label={t("header.langAria")}
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold transition-colors ${
          locale === "en"
            ? "bg-stone-900 text-white"
            : "text-stone-500 hover:text-stone-800"
        }`}
      >
        {t("header.langShortEn")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("ar")}
        className={`rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold transition-colors ${
          locale === "ar"
            ? "bg-stone-900 text-white"
            : "text-stone-500 hover:text-stone-800"
        }`}
      >
        {t("header.langShortAr")}
      </button>
    </div>
  );

  const userMenuPortal =
    mounted &&
    dropdownOpen &&
    user &&
    createPortal(
      <div
        ref={menuRef}
        dir={isRtl ? "rtl" : "ltr"}
        className="fixed z-[95] w-48 rounded-xl border border-stone-200/90 bg-white py-1 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.22)] animate-fadeUp ring-1 ring-black/[0.04]"
        style={{ top: menuPos.top, left: menuPos.left, width: MENU_W }}
        role="menu"
      >
        <div className="px-3 py-2 border-b border-stone-100">
          <p className="text-[11px] text-stone-400">{t("header.signedInAs")}</p>
          <p className="text-sm font-semibold text-stone-800 truncate">
            {user.firstName} {user.lastName}
          </p>
        </div>
        <Link
          href="/profile"
          className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          onClick={() => setDropdownOpen(false)}
          role="menuitem"
        >
          <BsPersonCircle className="text-base text-stone-400 flex-shrink-0" />
          {t("header.profile")}
        </Link>
        <button
          type="button"
          onClick={() => {
            setDropdownOpen(false);
            setLogoutOpen(true);
          }}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
          role="menuitem"
        >
          <BsBoxArrowRight className="text-base flex-shrink-0" />
          {t("header.signOut")}
        </button>
      </div>,
      document.body
    );

  return (
    <>
      <LogoutConfirmModal
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          logout();
        }}
      />
      <header
        className="fixed top-0 inset-x-0 z-[80] border-b border-stone-200/80 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="flex flex-nowrap items-center justify-between gap-1 sm:gap-2 px-1.5 md:px-[15px] py-1.5 custom-padding min-h-[52px] min-w-0">
          <div className="flex flex-nowrap items-center gap-0.5 flex-shrink-0">
            {icons.map((Icon, index) => (
              <div key={index} className="header_top__icon_wrapper">
                <Icon />
              </div>
            ))}
          </div>

          <div className="hidden min-w-0 flex-1 justify-center px-1 overflow-hidden sm:flex">
            <p className="max-w-[46vw] truncate text-center text-gray-700 text-xs sm:max-w-none sm:text-sm">
              <b className="text-primary">{t("header.promoBold")}</b>{" "}
              <span className="hidden md:inline">{t("header.promoRest")}</span>
            </p>
          </div>

          <div className="flex flex-nowrap items-center justify-end gap-0.5 sm:gap-1.5 flex-shrink-0 min-w-0 max-w-[58%] sm:max-w-none overflow-visible">
            <span className="hidden md:inline-flex text-stone-400 flex-shrink-0" aria-hidden>
              <BsTranslate className="text-sm" />
            </span>
            {LangToggle}
            {FavLink}
            {loading ? (
              <>
                {CartButton}
                <div className="flex flex-nowrap gap-1 overflow-visible">
                  <div className="w-12 h-7 sm:w-14 sm:h-8 bg-stone-200/80 animate-pulse rounded-md flex-shrink-0" />
                  <div className="w-12 h-7 sm:w-14 sm:h-8 bg-stone-200/80 animate-pulse rounded-md flex-shrink-0" />
                </div>
              </>
            ) : user ? (
              <>
                {CartButton}
                <div className="relative flex-shrink-0 overflow-visible">
                  <button
                    ref={avatarBtnRef}
                    type="button"
                    onClick={() => setDropdownOpen((o) => !o)}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="menu"
                    className="relative focus:outline-none rounded-full outline-offset-2 focus-visible:ring-2 focus-visible:ring-emerald-500 group"
                    aria-label="User menu"
                  >
                    <Image
                      src="/default-profile.png"
                      alt=""
                      width={32}
                      height={32}
                      className={`rounded-full object-cover border-2 cursor-pointer transition-all duration-300 w-[30px] h-[30px] sm:w-8 sm:h-8 ${
                        dropdownOpen
                          ? "border-emerald-500 ring-2 ring-emerald-500/30"
                          : "border-stone-200 group-hover:border-emerald-500 group-hover:ring-2 group-hover:ring-emerald-500/30"
                      }`}
                    />
                    <span
                      className={`absolute -bottom-0.5 -end-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full border-2 border-white transition-transform duration-300 ${
                        dropdownOpen ? "scale-110" : ""
                      }`}
                    />
                  </button>
                  {userMenuPortal}
                </div>
              </>
            ) : (
              <>
                {CartButton}
                <div className="flex flex-nowrap items-center gap-1 flex-shrink-0">
                  <Link className="authButton" href={"/signin"} prefetch={true}>
                    {t("header.signIn")}
                  </Link>
                  <Link className="authButton" href={"/signup"} prefetch={true}>
                    {t("header.signUp")}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
