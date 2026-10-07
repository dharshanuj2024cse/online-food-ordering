import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  MapPin,
  Clock,
  CreditCard,
  ChefHat,
  Bike,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate, getStatusBadge } from '../../utils/formatters';
import OrderTimeline from '../../components/OrderTimeline';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useNotification();

  const fetchOrder = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await orderService.getOrderById(id);
      if (res.success && res.order) {
        setOrder(res.order);
        if (isManual) showToast('Order status refreshed!', 'info');
      }
    } catch (err) {
      console.error('[OrderTracking.fetchOrder]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Auto polling every 10 seconds for live order status updates
    const interval = setInterval(() => {
      fetchOrder();
    }, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return <Loader text="Loading order tracking status..." />;
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">Order not found</h2>
        <p className="text-sm text-gray-500 mt-2">Could not locate order #{id}.</p>
        <Link to="/orders" className="mt-4 inline-block text-sm font-bold text-orange-600 hover:underline">
          Go to My Orders
        </Link>
      </div>
    );
  }

  const badge = getStatusBadge(order.order_status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-orange-600 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Order #{order.order_number}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Placed on {formatDate(order.created_at)}</p>
        </div>

        <button
          onClick={() => fetchOrder(true)}
          disabled={refreshing}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-xl transition shadow-xs"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Live Timeline Tracker */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-base text-gray-900">Live Delivery Progress</h3>
          <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
            Auto-refreshing every 10s
          </span>
        </div>
        <OrderTimeline orderStatus={order.order_status} />
      </div>

      {/* Order Info & Delivery Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Address */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-gray-900 font-extrabold text-sm pb-2 border-b border-gray-100">
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>Delivery Destination</span>
          </div>
          {order.delivery_address ? (
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-bold text-gray-900">{order.delivery_address.full_name}</p>
              <p>{order.delivery_address.phone}</p>
              <p className="leading-relaxed">
                {order.delivery_address.address}, {order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400">Address details unavailable.</p>
          )}
        </div>

        {/* Payment & Summary */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-gray-900 font-extrabold text-sm pb-2 border-b border-gray-100">
            <CreditCard className="w-4 h-4 text-orange-600" />
            <span>Payment Information</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1.5">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-bold text-gray-900">{order.payment_method === 'ONLINE' ? 'Online Paid (Simulated)' : 'Cash on Delivery'}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span className={`font-bold ${order.payment_status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {order.payment_status}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-extrabold text-gray-900">
              <span>Grand Total:</span>
              <span className="text-orange-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Breakdown Table */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-gray-900 pb-3 border-b border-gray-100">
          Items Ordered ({order.items?.length || 0})
        </h3>
        <div className="divide-y divide-gray-100">
          {order.items?.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center space-x-3">
                <span
                  className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 ${
                    item.is_vegetarian ? 'border-green-600' : 'border-red-600'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${item.is_vegetarian ? 'bg-green-600' : 'bg-red-600'}`}></span>
                </span>
                <div>
                  <span className="font-bold text-gray-900">{item.food_name}</span>
                  <span className="text-gray-400 text-xs block">Qty: {item.quantity} × {formatCurrency(item.price)}</span>
                </div>
              </div>
              <span className="font-extrabold text-gray-900">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
