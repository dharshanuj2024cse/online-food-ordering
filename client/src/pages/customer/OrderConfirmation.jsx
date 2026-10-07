import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, ArrowRight, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const OrderConfirmation = () => {
  const { id } = useParams(); // orderNumber
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-xl text-center space-y-6">
        {/* Celebration icon */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner animate-bounce">
          🎉
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Order Confirmed & Placed
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 tracking-tight">
            Thank You For Your Order!
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Your kitchen order has been sent to our chef. We are preparing your fresh hot meal right now!
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-left space-y-4 max-w-lg mx-auto">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 text-xs">
            <span className="text-gray-500 font-bold uppercase">Order Reference</span>
            <span className="text-sm font-black text-orange-600">{id}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-bold">Estimated Delivery</span>
            <span className="font-extrabold text-gray-900 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              <span>30 - 35 Minutes</span>
            </span>
          </div>

          {order && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-bold">Total Paid / Due</span>
              <span className="text-sm font-black text-gray-900">{formatCurrency(order.total)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to={`/orders/${id}`}
            className="w-full sm:w-auto px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-600/30 transition flex items-center justify-center space-x-2 text-sm"
          >
            <span>Track Order Live</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/orders"
            className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl transition text-sm"
          >
            View Order History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
