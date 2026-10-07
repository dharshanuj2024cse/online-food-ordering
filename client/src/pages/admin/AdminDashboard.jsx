import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Clock,
  UtensilsCrossed,
  IndianRupee,
  Calendar,
  ArrowRight,
  Eye
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate, getStatusBadge } from '../../utils/formatters';
import Loader from '../../components/Loader';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboardAnalytics();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('[AdminDashboard.fetchAnalytics]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <Loader text="Loading live analytics..." />;
  }

  const { stats, orderStatusCounts, salesTrend, popularFoods, recentOrders } = data || {};

  const cards = [
    { title: 'Total Revenue', value: formatCurrency(stats?.totalRevenue), icon: IndianRupee, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'text-orange-600 bg-orange-50' },
    { title: "Today's Orders", value: stats?.todayOrders || 0, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
    { title: 'Pending Orders', value: stats?.pendingOrders || 0, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { title: 'Registered Customers', value: stats?.totalUsers || 0, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { title: 'Available Food Items', value: `${stats?.availableFoods || 0} / ${stats?.totalFoods || 0}`, icon: UtensilsCrossed, color: 'text-rose-600 bg-rose-50' },
  ];

  const maxRevenue = Math.max(...(salesTrend?.map(s => parseFloat(s.daily_revenue)) || [1]), 100);

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Restaurant Analytics & Operations
        </h1>
        <p className="text-xs text-gray-500 mt-1">Real-time overview of orders, kitchen dispatch, revenue, and dishes.</p>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{c.title}</span>
                <div className={`p-2 rounded-xl ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{c.value}</span>
            </div>
          );
        })}
      </div>

      {/* 3. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend Chart (Custom interactive SVG Bar Chart) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Sales Trend Over Time</h3>
              <p className="text-xs text-gray-400 mt-0.5">Revenue and daily order volume</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Live DB Telemetry
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 px-2 border-b border-gray-100">
            {salesTrend && salesTrend.length > 0 ? (
              salesTrend.map((st, idx) => {
                const heightPct = Math.max(12, Math.round((parseFloat(st.daily_revenue) / maxRevenue) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition absolute -top-10 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap shadow-lg pointer-events-none z-10">
                      {st.label}: {formatCurrency(st.daily_revenue)} ({st.order_count} orders)
                    </div>
                    {/* Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[36px] bg-gradient-to-t from-orange-600 to-amber-500 rounded-t-xl group-hover:from-orange-700 group-hover:to-amber-600 transition shadow-xs"
                    ></div>
                    <span className="text-[10px] text-gray-400 font-bold mt-2 truncate w-full text-center">
                      {st.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full flex items-center justify-center text-xs text-gray-400">
                No revenue records available yet.
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status Breakdown */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">Orders Status Breakdown</h3>
            <p className="text-xs text-gray-400 mt-0.5">Live distribution by kitchen dispatch state</p>
          </div>

          <div className="space-y-3 my-auto">
            {orderStatusCounts && Object.entries(orderStatusCounts).map(([statusKey, count]) => {
              const badge = getStatusBadge(statusKey);
              return (
                <div key={statusKey} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${badge.color.split(' ')[0]}`}></span>
                    <span className="font-bold text-gray-700">{badge.label}</span>
                  </div>
                  <span className="font-extrabold text-gray-900 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          <Link
            to="/admin/orders"
            className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 text-center block transition"
          >
            Manage All Orders →
          </Link>
        </div>
      </div>

      {/* 4. Bottom Grid: Top Selling Foods & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Foods */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Top-Selling Dishes</h3>
              <p className="text-xs text-gray-400">Most requested items by total units ordered</p>
            </div>
            <Link to="/admin/foods" className="text-xs font-bold text-orange-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {popularFoods?.map((food, idx) => (
              <div key={food.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0 flex-1 pr-3">
                  <span className="text-xs font-extrabold text-gray-400 w-4">{idx + 1}</span>
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-10 h-10 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{food.name}</h4>
                    <span className="text-[10px] text-gray-400">{food.category_name}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-gray-900 block">{food.total_sold} Sold</span>
                  <span className="text-[10px] text-emerald-600 font-bold">{formatCurrency(food.total_revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Recent Orders</h3>
              <p className="text-xs text-gray-400">Latest customer orders awaiting action</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-bold text-orange-600 hover:underline">
              View All Orders
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {recentOrders?.map((ord) => {
              const badge = getStatusBadge(ord.order_status);
              return (
                <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-gray-900">#{ord.order_number}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-gray-500 text-[11px]">{ord.customer_name} • {formatDate(ord.created_at)}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-gray-900 block">{formatCurrency(ord.total)}</span>
                    <span className="text-[10px] text-gray-400">{ord.payment_method}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
