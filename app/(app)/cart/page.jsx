"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/providers/CartProvider";
import { useLocale } from "@/app/providers/LocaleProvider";
import { formatPrice, formatCartSubtotal } from "@/lib/formatPrice";
import {
  BsTrash, BsPlus, BsDash, BsArrowRight, BsX,
  BsGeoAlt, BsHouseDoor, BsTelephone, BsPerson, BsEnvelope,
  BsCheckCircleFill,
} from "react-icons/bs";
import Link from "next/link";
import { http } from "@/lib/http";
import { ALGERIA_WILAYAS } from "@/lib/algeriaWilayas";

const inputClass =
  "w-full rounded-md border border-stone-200 bg-white pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/25";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeLine,
    setLineQuantity,
    subtotal,
    totalQuantity,
    clearCart,
  } = useCart();
  const { t, isRtl } = useLocale();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStage, setCheckoutStage] = useState("form"); // Used conditionally
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  /** @type {{ orderNumber: string } | null} */
  const [successModal, setSuccessModal] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    wilaya: "",
    municipality: "",
    deliveryType: "office",
    addressLine: "",
  });

  const validateCheckout = () => {
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.wilaya ||
      !form.municipality.trim() ||
      !form.deliveryType
    ) {
      return t("cartPage.checkoutMissing");
    }

    const phoneDigits = String(form.phone || "").replace(/\D/g, "");
    if (!phoneDigits) return t("cartPage.checkoutMissing");
    if (phoneDigits.length < 9 || phoneDigits.length > 15) {
      return isRtl
        ? "رقم الهاتف غير صالح، يجب أن يكون بين 9 و15 رقماً"
        : "Invalid phone number (must be 9–15 digits)";
    }

    if (form.deliveryType === "home" && form.addressLine.trim().length < 5) {
      return t("cartPage.checkoutMissing");
    }
    return "";
  };

  const submitOrder = async () => {
    const msg = validateCheckout();
    if (msg) {
      setCheckoutError(msg);
      return;
    }

    setCheckoutError("");
    setCheckoutLoading(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: String(form.phone || "").replace(/\D/g, ""),
        wilaya: form.wilaya,
        municipality: form.municipality.trim(),
        deliveryType: form.deliveryType,
        addressLine: form.deliveryType === "home" ? form.addressLine.trim() : "",
        items: items.map((line) => ({
          productId: line.productId,
          title: line.title,
          image: line.image,
          quantity: line.quantity,
          unitPrice: line.price,
          currency: line.currency,
          size: line.size ?? null,
          color: line.color ?? null,
        })),
      };

      const res = await http.post("api/orders", payload);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Order failed");
      }

      const data = await res.json();
      const num = data?.orderNumber || "";
      setCheckoutOpen(false);
      clearCart();
      setSuccessModal({ orderNumber: num });

    } catch (e) {
      const msg = String(e?.message || "Server error");
      if (msg.toLowerCase().includes("failed to fetch")) {
        setCheckoutError(
          "Order failed: server is unreachable. Please make sure the Express API is running on http://localhost:5000."
        );
      } else {
        setCheckoutError(msg);
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (successModal) {
    const num = successModal.orderNumber;
    const goHome = () => {
      setSuccessModal(null);
      const q = num
        ? `?ordered=1&num=${encodeURIComponent(num)}`
        : "?ordered=1";
      router.replace(`/${q}`);
    };
    return (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-[3px]"
        dir={isRtl ? "rtl" : "ltr"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-success-title"
      >
        <div className="w-full max-w-[380px] animate-fadeUp rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-stone-200/80">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/12 text-primary">
            <BsCheckCircleFill className="text-2xl" aria-hidden />
          </div>
          <h2
            id="order-success-title"
            className="mt-4 text-center text-lg font-semibold text-stone-900"
          >
            {isRtl ? "طلبك قيد التنفيذ" : "Your order is in progress"}
          </h2>
          <p className="mt-2 text-center text-sm leading-relaxed text-stone-600">
            {isRtl
              ? "سيتم تأكيد طلبك عبر البريد الإلكتروني أو بالتواصل معك هاتفياً قريباً."
              : "We’ll confirm your order by email or reach you by phone shortly."}
          </p>
          {num ? (
            <p className="mt-4 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-center text-xs font-mono font-semibold text-stone-800">
              {isRtl ? "رقم الطلب" : "Order"} · {num}
            </p>
          ) : null}
          <button
            type="button"
            onClick={goHome}
            className="mt-5 w-full rounded-lg bg-stone-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary"
          >
            {isRtl ? "العودة للرئيسية" : "Back to home"}
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 bg-gradient-to-b from-white to-[#f0f7f6]"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="w-24 h-24 bg-stone-900/5 rounded-full flex items-center justify-center text-stone-900/35">
          <BsTrash className="text-3xl" />
        </div>
        <h2 className="text-xl font-semibold text-stone-900">
          {t("cartPage.emptyTitle")}
        </h2>
        <p className="text-stone-500 text-sm text-center max-w-sm">
          {t("cartPage.emptyHint")}
        </p>
        <Link
          href="/"
          className="mt-2 px-6 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-md hover:bg-primary transition-colors"
        >
          {t("cartPage.continue")}
        </Link>
      </div>
    );
  }

  return (
    <div
      className="bg-gradient-to-b from-white to-[#f0f7f6] min-h-screen py-8 sm:py-12"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
          <h1 className="text-2xl font-semibold text-stone-900">
            {t("cartPage.title")}
          </h1>
          <span className="text-xs font-medium text-stone-600 border border-stone-200 bg-white rounded-md px-2.5 py-1">
            {t("cartPage.itemsLabel", { n: totalQuantity })}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((line) => (
              <div
                key={line.lineId}
                className="bg-white p-4 rounded-lg border border-stone-200/90 flex gap-4 flex-wrap sm:flex-nowrap"
              >
                <div className="w-24 h-28 rounded-md overflow-hidden flex-shrink-0 bg-stone-100 border border-stone-200/80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={line.image}
                    alt={line.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-[200px] space-y-2">
                  <div className="flex justify-between gap-3">
                    <h3 className="text-sm font-semibold text-stone-900 leading-snug">
                      {line.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeLine(line.lineId)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors flex-shrink-0"
                      aria-label={t("cartPage.remove")}
                    >
                      <BsTrash className="text-base" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] text-stone-500">
                    {line.size ? (
                      <span>
                        {t("cartPage.size")}: {line.size}
                      </span>
                    ) : null}
                    {line.color ? (
                      <span className="inline-flex items-center gap-1">
                        {t("cartPage.color")}
                        <span
                          className="inline-block h-3 w-3 rounded-sm border border-stone-200"
                          style={{ backgroundColor: line.color }}
                        />
                      </span>
                    ) : null}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="inline-flex items-center rounded-md border border-stone-200 bg-stone-50">
                      <button
                        type="button"
                        onClick={() =>
                          setLineQuantity(line.lineId, line.quantity - 1)
                        }
                        className="p-1.5 text-stone-600 hover:bg-stone-200/70 rounded-e-md transition-colors"
                        aria-label={t("cartPage.decrease")}
                      >
                        <BsDash className="text-sm" />
                      </button>
                      <span className="min-w-[1.75rem] text-center text-xs font-medium text-stone-900">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setLineQuantity(line.lineId, line.quantity + 1)
                        }
                        className="p-1.5 text-stone-600 hover:bg-stone-200/70 rounded-s-md transition-colors"
                        aria-label={t("cartPage.increase")}
                      >
                        <BsPlus className="text-sm" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-stone-900/70 tabular-nums">
                      {formatPrice(line.price * line.quantity, line.currency)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <Link
              href="/"
              className="inline-block text-sm text-stone-500 hover:text-primary transition-colors mt-2"
            >
              ← {t("cartPage.continue")}
            </Link>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-lg border border-stone-200 bg-white p-5 sticky top-20">
              <h2 className="text-sm font-semibold text-stone-800 mb-4">
                {t("cartPage.summary")}
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-500">
                  <span>{t("cartPage.subtotal")}</span>
                  <span className="text-stone-800 tabular-nums">
                    {formatCartSubtotal(items, subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>{t("cartPage.shipping")}</span>
                  <span className="text-stone-600">
                    {t("cartPage.shippingLater")}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-xs font-medium text-stone-500">
                  {t("cartPage.total")}
                </span>
                <span className="text-lg font-semibold text-stone-900 tabular-nums">
                  {formatCartSubtotal(items, subtotal)}
                </span>
              </div>
              <button
                type="button"
                className="mt-5 w-full py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  setCheckoutOpen(true);
                  setCheckoutStage("form");
                  setCheckoutError("");
                }}
              >
                {t("cartPage.checkout")}
                <BsArrowRight
                  className={`text-base opacity-90 ${isRtl ? "rotate-180" : ""}`}
                />
              </button>
              <p className="text-[10px] text-stone-400 text-center mt-4">
                {t("cartPage.checkoutNote")}
              </p>
            </div>
          </div>
        </div>
      </div>

    {checkoutOpen ? (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <button
          type="button"
          className="absolute inset-0 bg-stone-900/25 backdrop-blur-[2px]"
          aria-label="Close"
          onClick={() => setCheckoutOpen(false)}
        />

        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="relative w-full max-w-2xl rounded-lg border border-stone-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-stone-200/80 flex-shrink-0">
            <h3 className="text-sm font-semibold text-stone-900">
              {t("cartPage.checkoutFormTitle")}
            </h3>
            <button
              type="button"
              onClick={() => setCheckoutOpen(false)}
              className="rounded-md p-2 text-stone-500 hover:bg-stone-100 transition-colors"
              aria-label="Close"
            >
              <BsX className="text-lg" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {checkoutStage === "form" ? (
              <div className="p-5 space-y-4">
                {checkoutError ? (
                  <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {checkoutError}
                  </div>
                ) : null}

                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      {t("cartPage.checkoutFirstName")}
                    </label>
                    <div className="relative">
                      <BsPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, firstName: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      {t("cartPage.checkoutLastName")}
                    </label>
                    <div className="relative">
                      <BsPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, lastName: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    {isRtl ? "البريد الإلكتروني (اختياري)" : "Email (optional)"}
                  </label>
                  <div className="relative">
                    <BsEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      className={inputClass}
                      placeholder={isRtl ? "example@gmail.com" : "example@gmail.com"}
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {isRtl
                      ? "لتلقي تأكيد الطلب عبر البريد الإلكتروني"
                      : "To receive order confirmation by email"}
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">
                    {t("cartPage.checkoutPhone")}
                  </label>
                  <div className="relative">
                    <BsTelephone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          phone: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      className={inputClass}
                      inputMode="tel"
                      pattern="[0-9]*"
                    />
                  </div>
                </div>

                {/* Wilaya + Municipality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      {t("cartPage.checkoutWilaya")}
                    </label>
                    <div className="relative">
                      <BsGeoAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                      <select
                        value={form.wilaya}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, wilaya: e.target.value }))
                        }
                        className={inputClass}
                      >
                        <option value="" disabled>
                          {isRtl ? "اختر الولاية" : "Select wilaya"}
                        </option>
                        {ALGERIA_WILAYAS.map((w) => (
                          <option key={w.code} value={isRtl ? w.ar : w.en}>
                            {isRtl ? `${w.ar} (${w.en})` : w.en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      {t("cartPage.checkoutMunicipality")}
                    </label>
                    <div className="relative">
                      <BsGeoAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                      <input
                        type="text"
                        value={form.municipality}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            municipality: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery type */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-stone-600">
                    {t("cartPage.checkoutDeliveryTo")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <label
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                        form.deliveryType === "office"
                          ? "border-primary/50 bg-primary/10"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryType"
                        value="office"
                        checked={form.deliveryType === "office"}
                        onChange={() =>
                          setForm((p) => ({ ...p, deliveryType: "office" }))
                        }
                        className="accent-primary"
                      />
                      {t("cartPage.checkoutOffice")}
                    </label>

                    <label
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                        form.deliveryType === "home"
                          ? "border-primary/50 bg-primary/10"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryType"
                        value="home"
                        checked={form.deliveryType === "home"}
                        onChange={() =>
                          setForm((p) => ({ ...p, deliveryType: "home" }))
                        }
                        className="accent-primary"
                      />
                      {t("cartPage.checkoutHome")}
                    </label>
                  </div>
                </div>

                {/* Address line — home only */}
                {form.deliveryType === "home" ? (
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      {t("cartPage.checkoutHomeAddress")}
                    </label>
                    <div className="relative">
                      <BsHouseDoor className="absolute left-3 top-3 text-stone-400 text-sm" />
                      <textarea
                        rows={3}
                        value={form.addressLine}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, addressLine: e.target.value }))
                        }
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="pt-2 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(false)}
                    className="rounded-md border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={checkoutLoading}
                    onClick={submitOrder}
                    className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading ? "..." : t("cartPage.checkoutConfirm")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ) : null}
    </div>
  );
}
