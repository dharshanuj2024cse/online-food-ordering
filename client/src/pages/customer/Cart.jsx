import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingBag,
  Trash2,
  TicketPercent,
  CheckCircle2,
  XCircle,
  Truck,
  Sparkles
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';
import CartItem from '../../components/CartItem';
import EmptyState from '../../components/EmptyState';

const Cart = () => {
  const {
    items,
    count,
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    appliedCoupon,
    amountNeededForFreeDelivery,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(couponCode.trim());
    setApplyingCoupon(false);
    setCouponCode('');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon="🛒"
          title="Your Cart is Empty"
          message="Looks like you haven't added anything to your cart yet. Explore our mouthwatering menu and find your favorite meal!"
          actionText="Browse Food Menu"
          actionLink="/menu"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-gray-500 mt-1">
            You have <span className="font-bold text-gray-900">{count} items</span> in your cart
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center space-x-1.5 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Delivery Banner */}
          {amountNeededForFreeDelivery > 0 ? (
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 flex items-center space-x-3 text-orange-900">
              <Truck className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div className="flex-1 text-xs">
                <span>Add </span>
                <span className="font-extrabold text-orange-600">{formatCurrency(amountNeededForFreeDelivery)}</span>
                <span> more to get </span>
                <span className="font-extrabold">FREE delivery!</span> (Orders ₹500+)
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center space-x-3 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-xs font-bold">
                Awesome! You have qualified for FREE delivery on this order!
              </span>
            </div>
          )}

          {/* Items */}
          <div className="space-y-3">
            {items.map((item) => (
              <CartItem
                key={item.cart_item_id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className="pt-4">
            <Link
              to="/menu"
              className="text-xs font-bold text-orange-600 hover:underline flex items-center space-x-1"
            >
              <span>+ Add more food items</span>
            </Link>
          </div>
        </div>

        {/* Right: Bill Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Code Box */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
              <TicketPercent className="w-4 h-4 text-orange-500" />
              <span>Have a Coupon?</span>
            </div>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-emerald-800 tracking-wider">
                    {appliedCoupon.code}
                  </span>
                  <p className="text-[11px] text-emerald-700">
                    Discount applied: -{formatCurrency(discount)}
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. WELCOME50)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="px-4 py-2.5 bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition"
                  >
                    Apply
                  </button>
                </div>

                {/* Quick select coupons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['WELCOME50', 'FLAT100', 'FOODIE20'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => applyCoupon(code)}
                      className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-[10px] font-bold rounded-lg transition"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </form>
            )}
          </div>

          {/* Order Financial Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 pb-3 border-b border-gray-100">
              Bill Summary
            </h3>

            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-800">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase tracking-wider text-[11px]">
                      FREE
                    </span>
                  ) : (
                    <span className="font-bold text-gray-800">{formatCurrency(deliveryFee)}</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Restaurant GST / Tax (5%)</span>
                <span className="font-bold text-gray-800">{formatCurrency(tax)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-medium block">Total Amount</span>
                <span className="text-xl font-black text-gray-900">{formatCurrency(total)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-600/30 transition duration-200 flex items-center space-x-2 text-sm"
              >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
