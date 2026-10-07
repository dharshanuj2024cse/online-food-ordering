import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, RotateCcw, ShoppingBag, Eye } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate, getStatusBadge } from '../../utils/formatters';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState(null);
  const { refreshCart } = useCart();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderService.getOrders();
        if (res.success) {
          setOrders(res.orders || []);
        }
      } catch (err) {
        console.error('[OrderHistory.fetchOrders]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleReorder = async (orderId) => {
    try {
      setReorderingId(orderId);
      const res = await orderService.reorder(orderId);
      if (res.success) {
        await refreshCart();
        showToast(res.message, 'success');
        navigate('/cart');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reorder items.', 'error');
    } finally {
      setReorderingId(null);
    }
  };

  if (loading) {
    return <Loader text="Loading your orders..." />;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon="📦"
          title="No Orders Yet"
          message="You haven't placed any orders yet. Discover hot flavorful dishes from our kitchen and make your first order!"
          actionText="Order Now"
          actionLink="/menu"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order History</h1>
        <p className="text-xs text-gray-500 mt-1">Review your past orders and easily reorder your favorite meals.</p>
      </div>

      <div className="space-y-4">
        {orders.map((ord) => {
          const badge = getStatusBadge(ord.order_status);

          return (
            <div
              key={ord.id}
              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Left Order Info */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-base font-black text-gray-900">
                    Order #{ord.order_number}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                <p className="text-xs text-gray-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Placed {formatDate(ord.created_at)}</span>
                </p>

                <p className="text-xs text-gray-600 font-medium line-clamp-1">
                  {ord.items_summary || `${ord.total_items} items`}
                </p>
              </div>

              {/* Price & Action Buttons */}
              <div className="flex items-center justify-between md:justify-end space-x-4 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Amount</span>
                  <span className="text-lg font-black text-gray-900">{formatCurrency(ord.total)}</span>
                  <span className="text-[10px] text-gray-400 block">{ord.payment_method}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/orders/${ord.order_number}`}
                    className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 transition flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-500" />
                    <span>Details</span>
                  </Link>

                  <button
                    onClick={() => handleReorder(ord.id)}
                    disabled={reorderingId === ord.id}
                    className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-600/20 transition flex items-center space-x-1.5"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${reorderingId === ord.id ? 'animate-spin' : ''}`} />
                    <span>Reorder</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;
