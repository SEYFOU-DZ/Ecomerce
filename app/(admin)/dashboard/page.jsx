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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Welcome back. Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                {stat.icon}
              </div>
            </div>
            <p className={`text-sm mt-4 font-medium ${stat.trendColor}`}>{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Charts/Tables Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Revenue Breakdown</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-medium text-gray-500">Revenue (DA)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-xs font-medium text-gray-500">Orders</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            {orderStats?.dailyData && orderStats.dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orderStats.dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} hide />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}
                    formatter={(value, name) => {
                      if (name === 'revenueDA') return [formatPrice(value, "DA"), 'Revenue In DA'];
                      if (name === 'orders') return [value, 'Orders Count'];
                      return [value, name];
                    }}
                  />
                  <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} />
                  <Area yAxisId="left" type="monotone" dataKey="revenueDA" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorDA)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <BsGraphUp className="text-4xl text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 font-medium">No revenue data available yet</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Sales</h3>
          <div className="space-y-6">
            {recentSales.length > 0 ? (
              recentSales.map((order, i) => {
                const isConfirmed = order.status === "confirmed";
                const totalText = order.totals?.totalByCurrency 
                  ? (order.totals.totalByCurrency.USD > 0 ? formatPrice(order.totals.totalByCurrency.USD, "USD") : formatPrice(order.totals.totalByCurrency.DA || 0, "DA"))
                  : "—";

                return (
                  <div key={order.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                      {order.customer?.fullName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {order.customer?.fullName || "Unknown Customer"}
                      </p>
                      <p className={`text-xs mt-0.5 truncate ${isConfirmed ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                        {order.orderNumber} • {order.status}
                      </p>
                    </div>
                    <div className={`ml-auto text-sm shrink-0 font-bold ${isConfirmed ? 'text-gray-900' : 'text-gray-400'}`}>
                      {totalText}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">No recent sales found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
