"use client";

import { BsGraphUp, BsBag, BsPeople, BsCurrencyDollar } from 'react-icons/bs';
import { http } from "@/lib/http";
import { formatPrice } from "@/lib/formatPrice";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardOverview() {
  const [orderStats, setOrderStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          http.get("api/orders/stats"),
          http.get("api/orders?limit=5") // Fetch orders for recent sales
        ]);
        
        if (!cancelled && statsRes.ok) {
          const statsData = await statsRes.json();
          setOrderStats(statsData?.stats || null);
        }
        
        if (!cancelled && ordersRes.ok) {
          const ordersData = await ordersRes.json();
          const allOrders = Array.isArray(ordersData?.orders) ? ordersData.orders : [];
          setRecentSales(allOrders.slice(0, 5));
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const revenueDA = orderStats?.revenueByCurrency?.DA || 0;
  const revenueUSD = orderStats?.revenueByCurrency?.USD || 0;
  const revenueText =
    revenueDA > 0 && revenueUSD > 0
      ? `${formatPrice(revenueDA, "DA")} + ${formatPrice(revenueUSD, "USD")}`
      : revenueUSD > 0
      ? formatPrice(revenueUSD, "USD")
      : formatPrice(revenueDA, "DA");

  const stats = [
    {
      label: "Total Revenue",
      value: orderStats ? revenueText : "—",
      icon: <BsCurrencyDollar className="w-6 h-6 text-emerald-600" />,
      trend: "Confirmed orders only",
      trendColor: "text-slate-500",
      bg: "bg-emerald-100",
    },
    {
      label: "Pending Orders",
      value: orderStats ? String(orderStats.pendingCount) : "—",
      icon: <BsPeople className="w-6 h-6 text-blue-600" />,
      trend: "Awaiting confirmation",
      trendColor: "text-slate-500",
      bg: "bg-blue-100",
    },
    {
      label: "Total Orders",
      value: orderStats ? String(orderStats.totalCount) : "—",
      icon: <BsBag className="w-6 h-6 text-indigo-600" />,
      trend: "All time",
      trendColor: "text-slate-500",
      bg: "bg-indigo-100",
    },
    {
      label: "Confirmed Orders",
      value: orderStats ? String(orderStats.confirmedCount) : "—",
      icon: <BsGraphUp className="w-6 h-6 text-violet-600" />,
      trend: "Completed",
      trendColor: "text-slate-500",
      bg: "bg-violet-100",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800">Varnox Command Center</h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">Welcome back to your workspace. Here is your store's performance at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                {stat.icon}
            </div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2 tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-3.5 rounded-2xl ${stat.bg} shadow-inner`}>
                {stat.icon}
              </div>
            </div>
            <p className={`text-xs mt-5 font-semibold ${stat.trendColor} flex items-center gap-1.5`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Charts/Tables Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 min-h-[420px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Revenue Analytics</h3>
            <div className="flex gap-5 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Revenue (DA)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Orders</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            {orderStats?.dailyData && orderStats.dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orderStats.dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 500 }} dy={15} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 500 }} dx={-15} tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8' }} hide />
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px 16px' }}
                    labelStyle={{ fontWeight: '800', color: '#0f172a', marginBottom: '10px', fontSize: '14px' }}
                    itemStyle={{ fontWeight: '600', fontSize: '13px' }}
                    formatter={(value, name) => {
                      if (name === 'revenueDA') return [formatPrice(value, "DA"), 'Revenue In DA'];
                      if (name === 'orders') return [value, 'Orders Count'];
                      return [value, name];
                    }}
                  />
                  <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorOrders)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6', style: {filter: 'drop-shadow(0px 4px 6px rgba(59,130,246,0.5))'} }} />
                  <Area yAxisId="left" type="monotone" dataKey="revenueDA" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorDA)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981', style: {filter: 'drop-shadow(0px 4px 6px rgba(16,185,129,0.5))'} }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-slate-50/80 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                    <BsGraphUp className="text-2xl text-slate-300" />
                </div>
                <p className="text-sm text-slate-500 font-semibold tracking-wide">No revenue data available yet</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/80 min-h-[420px] flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-8">Recent Transactions</h3>
          <div className="flex-1 flex flex-col">
            <div className="space-y-5 flex-1">
                {recentSales.length > 0 ? (
                recentSales.map((order, i) => {
                    const isConfirmed = order.status === "confirmed";
                    const totalText = order.totals?.totalByCurrency 
                    ? (order.totals.totalByCurrency.USD > 0 ? formatPrice(order.totals.totalByCurrency.USD, "USD") : formatPrice(order.totals.totalByCurrency.DA || 0, "DA"))
                    : "—";

                    return (
                    <div key={order.id} className="flex items-center gap-4 group p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-indigo-600 font-black shrink-0 border border-indigo-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                        {order.customer?.fullName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0 pr-2">
                        <p className="text-[14px] font-bold text-slate-800 truncate">
                            {order.customer?.fullName || "Unknown Customer"}
                        </p>
                        <p className={`text-[11px] uppercase tracking-wider mt-1 truncate font-bold ${isConfirmed ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {order.orderNumber} <span className="text-slate-300 mx-1">•</span> {order.status}
                        </p>
                        </div>
                        <div className={`ml-auto text-[14px] shrink-0 font-black ${isConfirmed ? 'text-slate-800' : 'text-slate-400'}`}>
                        {totalText}
                        </div>
                    </div>
                    );
                })
                ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-60">
                    <BsBag className="text-3xl text-slate-300 mb-3" />
                    <p className="text-sm text-slate-500 font-medium">No recent sales found.</p>
                </div>
                )}
            </div>
            {recentSales.length > 0 && (
                 <button className="mt-4 w-full py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm tracking-wide hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200">
                     View All Orders
                 </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
