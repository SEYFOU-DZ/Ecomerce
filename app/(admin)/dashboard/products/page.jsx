"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BsPlus, BsPencil, BsTrash, BsImage, BsSearch, BsExclamationTriangle, BsX } from "react-icons/bs";
import { http } from "@/lib/http";
import { formatPrice } from "@/lib/formatPrice";

// ---------- Custom Delete Confirmation Modal ----------
function DeleteModal({ product, onConfirm, onCancel }) {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg border border-stone-200/90 w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-200 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)]">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
        >
          <BsX className="text-lg" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center">
            <BsExclamationTriangle className="text-rose-600 text-base" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Delete Product</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-medium text-slate-700">{product.title}</span>? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-5 justify-end">
          <button
            onClick={onCancel}
            className="px-3.5 py-2 text-sm font-medium text-slate-600 bg-white border border-stone-200 hover:bg-stone-50 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Main Page ----------
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await http.get("api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await http.delete(`api/products/${deleteTarget._id}`);
      if (res.ok) {
        setProducts(products.filter((p) => p._id !== deleteTarget._id));
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = products.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <DeleteModal
        product={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="space-y-5 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-400">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Products</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage your store catalog</p>
          </div>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            <BsPlus className="text-lg" />
            Add Product
          </Link>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg border border-stone-200/90 overflow-hidden">
          {/* Search Bar */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="relative max-w-xs">
              <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="min-h-[360px] flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin border-[3px]"></div>
              <p className="text-sm text-slate-400">Loading catalog...</p>
            </div>
          ) : error ? (
            <div className="min-h-[360px] flex items-center justify-center">
              <p className="text-sm text-rose-500 bg-rose-50 px-5 py-3 rounded-xl border border-rose-100">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="min-h-[360px] flex flex-col items-center justify-center gap-3 text-center px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                <BsImage className="text-2xl text-slate-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700">No products found</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {search ? "Try a different search term" : "Add your first product to get started"}
                </p>
              </div>
              {!search && (
                <Link
                  href="/dashboard/products/new"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors mt-1"
                >
                  <BsPlus className="text-base" />
                  Add First Product
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Image</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Added</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Image */}
                      <td className="px-5 py-3.5">
                        <div className="w-11 h-11 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                          {product.mainImage ? (
                            <img src={product.mainImage} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <BsImage className="text-base" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <p className="font-semibold text-slate-800 truncate">{product.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{product.description}</p>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-teal-800 tabular-nums">
                          {formatPrice(product.price, product.currency)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/products/${product._id}/edit`)}
                            className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-100"
                            title="Edit"
                          >
                            <BsPencil className="text-sm" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                            title="Delete"
                          >
                            <BsTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {!loading && !error && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{" "}
                <span className="font-semibold text-slate-600">{products.length}</span> products
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
