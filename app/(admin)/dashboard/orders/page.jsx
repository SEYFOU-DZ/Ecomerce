"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BsCart3,
  BsSearch, BsBoxSeam, BsArrowRepeat, BsTrash,
} from "react-icons/bs";
import { http } from "@/lib/http";
import { formatPrice } from "@/lib/formatPrice";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500" },
  confirmed: { label: "Confirmed", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", bg: "bg-slate-100",   text: "text-slate-600",   dot: "bg-slate-400" },
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const summarizeTotals = (totalByCurrency) => {
  const da = Number(totalByCurrency?.DA) || 0;
  const usd = Number(totalByCurrency?.USD) || 0;
  if (da > 0 && usd > 0) return `DA ${da.toFixed(0)} + $${usd.toFixed(2)}`;
  if (usd > 0) return formatPrice(usd, "USD");
  return formatPrice(da, "DA");
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
      {cfg.label}
    </span>
  );
}

/* ─── Items modal ─────────────────────────────────────────── */
function ItemsModal({ items, orderNumber, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Order Items</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{orderNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
          {(items || []).map((it, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.image}
                  alt={it.title}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-100"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <BsBoxSeam className="text-slate-400 text-sm" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{it.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Qty: {it.quantity}
                  {it.size ? ` · Size: ${it.size}` : ""}
                  {it.color ? (
                    <span>
                      {" · "}Color:{" "}
                      <span
                        className="inline-block w-3 h-3 rounded-sm border border-slate-200 align-middle"
                        style={{ backgroundColor: it.color }}
                      />
                    </span>
                  ) : ""}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-700 tabular-nums whitespace-nowrap flex-shrink-0">
                {formatPrice(it.unitPrice * it.quantity, it.currency)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RejectConfirmModal({ orderNumber, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onCancel}
        aria-label="Close"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-800">Reject this order?</h3>
          <p className="mt-1 font-mono text-xs text-slate-500">{orderNumber}</p>
        </div>
        <p className="px-5 py-4 text-sm leading-relaxed text-slate-600">
          The customer will be notified by email that the order was cancelled. This cannot be undone from their side.
        </p>
        <div className="flex gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
          >
            Reject order
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewItemsOrder, setViewItemsOrder] = useState(null); // order object for modal
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: string }
  const [rejectTarget, setRejectTarget] = useState(null); // { id, orderNumber }

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 6500);
    return () => clearTimeout(t);
  }, [feedback]);

  const fetchAll = async () => {
    setError("");
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        http.get("api/orders/stats"),
        http.get("api/orders"),
      ]);

      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(s?.stats || null);
      }

      if (!ordersRes.ok) {
        const data = await ordersRes.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to load orders");
      }
      const data = await ordersRes.json();
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch (e) {
      setError(e?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const key = `${o.orderNumber} ${o.customer?.fullName || ""} ${o.customer?.phone || ""} ${o.customer?.email || ""}`.toLowerCase();
      const matchSearch = key.includes(search.toLowerCase());
      const matchFilter = filter === "all" || o.status === filter;
      return matchSearch && matchFilter;
    });
  }, [orders, search, filter]);

  const confirm = async (id) => {
    setFeedback(null);
    try {
      const res = await http.post(`api/orders/${id}/confirm`, null);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Could not confirm this order.");
      }
      await fetchAll();
      setFeedback({ type: "success", text: "Order confirmed. Customer will receive a confirmation email." });
    } catch (e) {
      setFeedback({ type: "error", text: e?.message || "Could not confirm this order." });
    }
  };

  const reject = async (id) => {
    setFeedback(null);
    try {
      let res = await http.patch(`api/orders/${id}/reject`, null);
      if (res.status === 405) {
        res = await http.post(`api/orders/${id}/reject`, {});
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Could not reject this order.");
      }
      await fetchAll();
      setFeedback({ type: "success", text: "Order rejected. Customer will receive a cancellation email." });
    } catch (e) {
      setFeedback({ type: "error", text: e?.message || "Could not reject this order." });
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to completely DELETE this order? This action cannot be undone.")) return;
    setFeedback(null);
    try {
      const res = await http.delete(`api/orders/${id}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Could not delete this order.");
      }
      await fetchAll();
      setFeedback({ type: "success", text: "Order deleted permanently." });
    } catch (e) {
      setFeedback({ type: "error", text: e?.message || "Could not delete this order." });
    }
  };

  const summaryStats = [
    { label: "Total Orders", value: stats ? String(stats.totalCount) : "—", sub: "All time" },
    { label: "Pending", value: stats ? String(stats.pendingCount) : "—", sub: "Awaiting" },
    { label: "Confirmed", value: stats ? String(stats.confirmedCount) : "—", sub: "Completed" },
    {
      label: "Revenue",
      value: stats ? summarizeTotals(stats.revenueByCurrency) : "—",
      sub: "Confirmed only",
    },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-400">
      {rejectTarget ? (
        <RejectConfirmModal
          orderNumber={rejectTarget.orderNumber}
          onCancel={() => setRejectTarget(null)}
          onConfirm={() => {
            const id = rejectTarget.id;
            setRejectTarget(null);
            reject(id);
          }}
        />
      ) : null}

      {feedback ? (
        <div
          role="status"
          className={`rounded-lg border px-3 py-2 text-xs font-medium ${
            feedback.type === "success"
              ? "border-emerald-200/80 bg-emerald-50 text-emerald-900"
              : "border-rose-200/80 bg-rose-50 text-rose-900"
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Orders</h1>
        <p className="text-sm text-slate-400 mt-0.5">Track and manage customer orders</p>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {summaryStats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/80 shadow-sm px-3 py-3 sm:px-4">
            <p className="text-[11px] font-medium text-slate-400 mb-0.5">{s.label}</p>
            <p className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-tight">{s.value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative max-w-xs w-full sm:w-auto flex-1 sm:max-w-[260px]">
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-slate-700 placeholder-slate-400"
            />
          </div>
          {/* Actions Group (Refresh & Filter) */}
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto scrollbar-none">
            <button
              onClick={fetchAll}
              disabled={loading}
              title="Refresh Orders"
              className="p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <BsArrowRepeat className={`text-[15px] ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="w-px h-6 bg-slate-200 hidden sm:block flex-shrink-0"></div>
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 flex-wrap min-w-max">
              {["all", "pending", "confirmed", "cancelled"].map((s) => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                    filter === s
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {s === "all" ? "All" : STATUS_CONFIG[s]?.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="w-8 h-8 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="min-h-[300px] flex items-center justify-center px-4 text-center">
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl">
              {error}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 text-center px-4">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
              <BsCart3 className="text-xl text-slate-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700">No orders found</h3>
              <p className="text-xs text-slate-400 mt-1">
                {search || filter !== "all" ? "Try adjusting your filters" : "Orders will appear here once customers place them"}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  {["Order #", "Customer", "Phone", "Delivery", "Items", "Total", "Status", "Date", "Actions"].map((h, i) => (
                    <th key={i} className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50/60 transition-colors">
                    {/* Order Number */}
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg whitespace-nowrap block max-w-[130px] truncate" title={order.orderNumber}>
                        {order.orderNumber}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-4 min-w-[120px]">
                      <p className="font-semibold text-slate-800 text-sm whitespace-nowrap">{order.customer?.fullName}</p>
                      {order.customer?.email ? (
                        <p className="text-[11px] text-slate-400 truncate max-w-[160px]" title={order.customer.email}>
                          {order.customer.email}
                        </p>
                      ) : null}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-slate-700 font-medium">{order.customer?.phone}</span>
                    </td>

                    {/* Delivery */}
                    <td className="px-4 py-4 min-w-[130px]">
                      <p className="text-slate-700 font-medium whitespace-nowrap">
                        {order.shipping?.wilaya} / {order.shipping?.municipality}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 whitespace-nowrap">
                        {order.shipping?.deliveryType === "home"
                          ? `Home delivery`
                          : "Office pickup"}
                      </p>
                    </td>

                    {/* Items — clickable */}
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setViewItemsOrder(order)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors whitespace-nowrap"
                        title="View items"
                      >
                        <BsBoxSeam className="text-xs" />
                        {order.itemsCount} item{order.itemsCount > 1 ? "s" : ""}
                      </button>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800">
                        {summarizeTotals(order.totals?.totalByCurrency)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 min-w-[140px]">
                      <div className="flex items-center gap-1.5">
                        {order.status === "pending" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => confirm(order.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors whitespace-nowrap"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setRejectTarget({ id: order.id, orderNumber: order.orderNumber })
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white transition-colors whitespace-nowrap"
                            >
                              Reject
                            </button>
                          </>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => deleteOrder(order.id)}
                          title="Delete Order Permanently"
                          className="p-1.5 ml-auto rounded-lg text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 sm:opacity-100"
                        >
                          <BsTrash className="text-[15px]" />
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
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{" "}
              <span className="font-semibold text-slate-600">{orders.length}</span> orders
            </p>
          </div>
        )}
      </div>

      {/* Items Modal */}
      {viewItemsOrder ? (
        <ItemsModal
          items={viewItemsOrder.items}
          orderNumber={viewItemsOrder.orderNumber}
          onClose={() => setViewItemsOrder(null)}
        />
      ) : null}
    </div>
  );
}
