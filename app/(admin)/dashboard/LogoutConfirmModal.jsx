"use client";

import { useEffect } from "react";
import { useLocale } from "@/app/providers/LocaleProvider";
import { BsBoxArrowRight } from "react-icons/bs";

export default function LogoutConfirmModal({ open, onCancel, onConfirm }) {
  const { isRtl } = useLocale();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        aria-label="Close"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-rose-100/50 bg-white p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-rose-600"></div>
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center border-4 border-rose-100/50 mb-2">
            <BsBoxArrowRight className="text-3xl text-rose-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            {isRtl ? "هل تريد تسجيل الخروج؟" : "Confirm sign out?"}
          </h2>
          
          <p className="text-[15px] leading-relaxed text-stone-500 max-w-[280px]">
            {isRtl 
              ? "نأمل أن نراك مجدداً قريبًا. يمكنك تسجيل الدخول في أي وقت." 
              : "We hope to see you again soon. You can log back in at any time."}
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3 w-full justify-center">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700 hover:shadow-rose-600/30 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isRtl ? "تأكيد الخروج" : "Yes, Sign Out"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border-2 border-stone-200 bg-white px-6 py-3.5 text-sm font-bold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95"
          >
            {isRtl ? "إلغاء" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
