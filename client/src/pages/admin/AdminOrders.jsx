import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  RefreshCw,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate, getStatusBadge } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const { showToast } = useNotification();

  const statuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrders({
        search: search.trim() || undefined,
        status: statusFilter || undefined
      });
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error('[AdminOrders.loadOrders]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await orderService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o)));
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update order status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const res = await orderService.getOrderById(orderId);
      if (res.success) {
        setSelectedOrder(res.order);
      }
    } catch (err) {
      showToast('Failed to load order details.', 'error');
    }
  };

  if (loading && !orders.length) {
    return <Loader text="Loading orders list..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Orders Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track live customer orders and update kitchen preparation stages.</p>
        </div>

        <button
          onClick={loadOrders}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-orange-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-gray-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-orange-500"
          >
            <option value="">All Statuses ({orders.length})</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-extrabold text-gray-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Dispatch Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((ord) => {
                const badge = getStatusBadge(ord.order_status);

                return (
                  <tr key={ord.id} className="hover:bg-gray-50/70 transition">
                    <td className="px-6 py-4 font-black text-gray-900">
                      #{ord.order_number}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{ord.customer_name}</p>
                      <p className="text-[11px] text-gray-400">{ord.customer_phone}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {formatDate(ord.created_at)}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate font-medium text-gray-700">
                      {ord.items_summary || `${ord.total_items} items`}
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900">
                      {formatCurrency(ord.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-700 block">{ord.payment_method}</span>
                      <span className={`text-[10px] font-extrabold ${ord.payment_status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={ord.order_status}
                        disabled={updatingId === ord.id}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border transition cursor-pointer ${badge.color}`}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewOrder(ord.id)}
                        className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details #${selectedOrder?.order_number}`}
        maxWidth="max-w-2xl"
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs">
            {/* Customer & Delivery address */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Customer</span>
                <p className="font-bold text-gray-900">{selectedOrder.customer_name}</p>
                <p className="text-gray-500">{selectedOrder.customer_email}</p>
                <p className="text-gray-500">{selectedOrder.customer_phone}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Delivery Address</span>
                {selectedOrder.delivery_address ? (
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {selectedOrder.delivery_address.address}, {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state} - {selectedOrder.delivery_address.pincode}
                  </p>
                ) : (
                  <p className="text-gray-400">Address not saved.</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-bold text-gray-800 uppercase text-[10px] tracking-wider mb-2">Ordered Dishes</h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">{item.food_name}</span>
                      <span className="text-gray-400 ml-2">Qty: {item.quantity} × {formatCurrency(item.price)}</span>
                    </div>
                    <span className="font-extrabold text-gray-900">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials */}
            <div className="p-4 bg-gray-50 rounded-2xl space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-bold">{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee:</span>
                <span className="font-bold">{formatCurrency(selectedOrder.delivery_fee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (5%):</span>
                <span className="font-bold">{formatCurrency(selectedOrder.tax)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount:</span>
                  <span>-{formatCurrency(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-black text-gray-900">
                <span>Total Amount:</span>
                <span className="text-orange-600">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrders;
