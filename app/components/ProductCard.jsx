"use client";

import { useState } from "react";
import { BsCartPlus, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Link from "next/link";
import { useCart } from "@/app/providers/CartProvider";

export default function ProductCard({ product }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const images = [product.mainImage, ...(product.subImages || [])];
  const { addToCart } = useCart();

  const nextImg = (e) => {
    e.preventDefault();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    e.preventDefault();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    // Simple toast-like feedback could be added here
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 overflow-hidden flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
        <Link href={`/products/${product._id}`}>
          <img
            src={images[currentImgIndex]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>

        {/* Image Navigation Arrows */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={prevImg}
              className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-slate-800 hover:bg-white shadow-sm transition-all"
            >
              <BsChevronLeft size={16} />
            </button>
            <button
              onClick={nextImg}
              className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-slate-800 hover:bg-white shadow-sm transition-all"
            >
              <BsChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Quick Add Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/20 to-transparent">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <BsCartPlus size={18} />
            Quick Add
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <Link href={`/products/${product._id}`}>
            <h3 className="text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <span className="text-sm font-black text-indigo-600">${product.price}</span>
        </div>
        <p className="text-xs text-slate-400 line-clamp-1 mb-4 italic">
          {product.description.substring(0, 40)}...
        </p>

        <div className="mt-auto flex items-center gap-1">
          {product.colors?.slice(0, 3).map((color, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full border border-slate-200"
              style={{ backgroundColor: color }}
            />
          ))}
          {product.colors?.length > 3 && (
            <span className="text-[10px] text-slate-400">+{product.colors.length - 3}</span>
          )}
        </div>
      </div>
    </div>
  );
}
