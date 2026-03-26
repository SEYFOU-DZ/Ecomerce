"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { BsArrowLeft, BsCloudUpload, BsCheckCircle, BsX, BsPlus, BsTrash } from "react-icons/bs";
import { http } from "@/lib/http";
import { SIZE_OPTIONS } from "@/lib/productOptions";

const PRESET_COLORS = [
  "#000000", "#FFFFFF", "#FF3B30", "#4CD964", "#007AFF", "#FFCC00", "#5856D6", "#FF2D55",
];

const fieldClass =
  "w-full px-3 py-2.5 rounded-md border border-slate-200/90 bg-slate-50/80 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500/70 focus:bg-white transition-colors";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    currency: "DA",
  });
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [existingMainImage, setExistingMainImage] = useState(null);
  const [subImages, setSubImages] = useState([]);
  const [existingSubImages, setExistingSubImages] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await http.get(`api/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const product = await res.json();
        setFormData({
          title: product.title || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          currency: product.currency === "USD" ? "USD" : "DA",
        });
        setSelectedColors(product.colors || []);
        setSelectedSizes(Array.isArray(product.sizes) ? product.sizes : []);
        setExistingMainImage(product.mainImage || null);
        setExistingSubImages(product.subImages || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleColorToggle = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const removeExistingSubImage = (index) => {
    setExistingSubImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("currency", formData.currency);
      data.append("colors", JSON.stringify(selectedColors));
      data.append("sizes", JSON.stringify(selectedSizes));
      data.append("existingSubImages", JSON.stringify(existingSubImages));

      if (mainImage) data.append("mainImage", mainImage);
      subImages.forEach((img) => data.append("subImages", img));

      const res = await http.putForm(`api/products/${id}`, data);
      if (!res.ok) throw new Error("Failed to update product");
      router.push("/dashboard/products");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-7 h-7 rounded-full border-2 border-slate-200 border-t-teal-600 animate-spin" />
      </div>
    );
  }

  if (error && fetching === false && !formData.title) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-sm text-rose-600 mb-3">{error}</p>
          <Link href="/dashboard/products" className="text-sm text-teal-700 hover:underline">← Back to products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/products"
          className="p-2 text-stone-500 hover:text-stone-800 hover:bg-white rounded-md border border-transparent hover:border-stone-200 transition-colors"
        >
          <BsArrowLeft className="text-lg" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Edit product</h1>
          <p className="text-xs text-stone-500 mt-0.5">Update details and media.</p>
        </div>
      </div>

      {error ? (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200/80 rounded-md px-3 py-2">{error}</div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-lg border border-slate-200/90 bg-white/90 backdrop-blur-sm shadow-sm p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Basic information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Product title</label>
              <input
                type="text" name="title" required value={formData.title} onChange={handleChange}
                className={fieldClass}
                placeholder="Hoodie"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Price</label>
                <div className="grid grid-cols-[minmax(0,7rem)_1fr] gap-2">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    <option value="DA">DA</option>
                    <option value="USD">USD</option>
                  </select>
                  <div className="relative">
                    {formData.currency === "USD" ? (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    ) : (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-medium pointer-events-none">
                        DA
                      </span>
                    )}
                    <input
                      type="number" name="price" required step="0.01" min="0"
                      value={formData.price} onChange={handleChange}
                      className={`${fieldClass} ${formData.currency === "USD" ? "pl-7" : "pr-10"}`}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Sizes (optional)</label>
                <p className="text-[11px] text-slate-400 mb-2">Leave empty for one-size items.</p>
                <div className="flex flex-wrap gap-1.5">
                  {SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`min-w-[2.5rem] rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        selectedSizes.includes(size)
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-teal-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Color variants</label>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {PRESET_COLORS.map((color) => (
                  <button key={color} type="button" onClick={() => handleColorToggle(color)}
                    className={`relative w-7 h-7 rounded-full border-2 transition-transform ${selectedColors.includes(color) ? "border-teal-600 scale-105" : "border-slate-200"}`}
                    style={{ backgroundColor: color }} title={color}
                  >
                    {selectedColors.includes(color) && (
                      <BsCheckCircle className="absolute -top-1 -right-1 text-xs bg-white rounded-full text-teal-600" />
                    )}
                  </button>
                ))}
                <div className="relative">
                  <input type="color" title="Custom"
                    className="opacity-0 absolute inset-0 w-7 h-7 cursor-pointer"
                    onChange={(e) => handleColorToggle(e.target.value)}
                  />
                  <div className="w-7 h-7 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 bg-stone-50 text-xs">
                    <BsPlus />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Description</label>
              <textarea name="description" required rows={4} value={formData.description} onChange={handleChange}
                className={`${fieldClass} resize-none`}
                placeholder="Materials, care, fit notes…"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/90 bg-white/90 backdrop-blur-sm shadow-sm p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Product media</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">Main image</label>
              {existingMainImage && !mainImage ? (
                <div className="flex items-center gap-3 mb-3 bg-stone-50 p-2.5 rounded-md border border-stone-200">
                  <img src={existingMainImage} alt="Current" className="w-12 h-12 object-cover rounded-md border border-stone-200" />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-medium text-stone-600">Current main image</p>
                    <p className="text-stone-400 mt-0.5">Upload to replace</p>
                  </div>
                </div>
              ) : null}
              <div className="relative border border-dashed border-stone-200 bg-stone-50/50 rounded-md p-5 cursor-pointer text-center hover:bg-stone-50 transition-colors">
                <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) setMainImage(e.target.files[0]); }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {!mainImage ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <BsCloudUpload className="text-stone-400 text-xl" />
                    <p className="text-sm text-stone-500"><span className="font-medium text-stone-700">Upload</span> to replace</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-md border border-stone-200 relative z-20">
                    <div className="flex items-center gap-2.5">
                      <img src={URL.createObjectURL(mainImage)} alt="Preview" className="w-11 h-11 object-cover rounded-md" />
                      <div className="text-left text-xs">
                        <p className="font-medium text-stone-800 truncate max-w-[160px]">{mainImage.name}</p>
                        <p className="text-stone-400">{(mainImage.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setMainImage(null)} className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                      <BsX className="text-lg" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {existingSubImages.length > 0 ? (
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-2">Gallery (current)</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {existingSubImages.map((url, idx) => (
                    <div key={idx} className="relative group rounded-md overflow-hidden aspect-square bg-stone-100 border border-stone-200">
                      <img src={url} alt={`Sub ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-stone-900/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removeExistingSubImage(idx)}
                          className="w-7 h-7 bg-white/90 text-stone-700 rounded-md flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors"
                        >
                          <BsTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">Add gallery images</label>
              <div className="relative border border-dashed border-stone-200 bg-stone-50/40 rounded-md p-5 text-center cursor-pointer hover:bg-stone-50/70 transition-colors">
                <input type="file" accept="image/*" multiple onChange={(e) => { if (e.target.files) setSubImages(Array.from(e.target.files)); }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <BsCloudUpload className="text-stone-400 text-xl mx-auto" />
                <p className="text-sm text-stone-500 mt-1">Add more photos</p>
              </div>
              {subImages.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
                  {subImages.map((img, idx) => (
                    <div key={idx} className="rounded-md overflow-hidden aspect-square bg-stone-100 border border-stone-200">
                      <img src={URL.createObjectURL(img)} alt="New" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pb-8">
          <Link href="/dashboard/products" className="px-5 py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-md hover:bg-stone-50 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
