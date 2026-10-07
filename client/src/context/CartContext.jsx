import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { couponService } from '../services/couponService';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [amountNeededForFreeDelivery, setAmountNeededForFreeDelivery] = useState(0);
  const [loading, setLoading] = useState(false);

  // Recalculate totals including coupon
  const recomputeFinancials = useCallback((cartItems, coupon = appliedCoupon) => {
    const rawSubtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    const delFee = rawSubtotal >= 500 || rawSubtotal === 0 ? 0 : 40;
    const calcTax = rawSubtotal > 0 ? parseFloat((rawSubtotal * 0.05).toFixed(2)) : 0;

    let discAmount = 0;
    if (coupon && rawSubtotal >= (coupon.minimumOrder || 0)) {
      if (coupon.discountType === 'percentage') {
        discAmount = (rawSubtotal * coupon.discountValue) / 100;
        if (coupon.maximumDiscount && discAmount > coupon.maximumDiscount) {
          discAmount = coupon.maximumDiscount;
        }
      } else {
        discAmount = coupon.discountValue;
      }
      discAmount = Math.min(discAmount, rawSubtotal);
      discAmount = parseFloat(discAmount.toFixed(2));
    } else if (coupon && rawSubtotal < (coupon.minimumOrder || 0)) {
      // Coupon invalid due to subtotal falling below min order
      discAmount = 0;
    }

    const grandTotal = Math.max(0, parseFloat((rawSubtotal + delFee + calcTax - discAmount).toFixed(2)));

    setSubtotal(parseFloat(rawSubtotal.toFixed(2)));
    setDeliveryFee(parseFloat(delFee.toFixed(2)));
    setTax(calcTax);
    setDiscount(discAmount);
    setTotal(grandTotal);
    setAmountNeededForFreeDelivery(rawSubtotal < 500 && rawSubtotal > 0 ? parseFloat((500 - rawSubtotal).toFixed(2)) : 0);
    setCount(cartItems.reduce((acc, item) => acc + item.quantity, 0));
  }, [appliedCoupon]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setCount(0);
      setSubtotal(0);
      setDeliveryFee(0);
      setTax(0);
      setDiscount(0);
      setTotal(0);
      return;
    }

    try {
      setLoading(true);
      const res = await cartService.getCart();
      if (res.success) {
        setItems(res.items || []);
        recomputeFinancials(res.items || []);
      }
    } catch (err) {
      console.error('[CartContext.fetchCart]', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, recomputeFinancials]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (foodId, quantity = 1) => {
    if (!isAuthenticated) {
      showToast('Please log in to add items to your cart.', 'warning');
      return { success: false, requireLogin: true };
    }

    try {
      const res = await cartService.addToCart(foodId, quantity);
      if (res.success) {
        showToast(res.message, 'success');
        await fetchCart();
      }
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const updateQuantity = async (cartItemId, newQty) => {
    try {
      const res = await cartService.updateCartItem(cartItemId, newQty);
      if (res.success) {
        await fetchCart();
      }
      return res;
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update quantity.', 'error');
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const res = await cartService.removeCartItem(cartItemId);
      if (res.success) {
        showToast('Item removed from cart.', 'info');
        await fetchCart();
      }
      return res;
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove item.', 'error');
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartService.clearCart();
      if (res.success) {
        setItems([]);
        setAppliedCoupon(null);
        recomputeFinancials([]);
      }
      return res;
    } catch (err) {
      showToast('Failed to clear cart.', 'error');
    }
  };

  const applyCoupon = async (code) => {
    if (!code) {
      showToast('Please enter a coupon code.', 'warning');
      return { success: false };
    }

    try {
      const res = await couponService.validateCoupon(code, subtotal);
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        recomputeFinancials(items, res.coupon);
        showToast(res.message, 'success');
        return { success: true, coupon: res.coupon };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon code.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    recomputeFinancials(items, null);
    showToast('Coupon removed.', 'info');
  };

  return (
    <CartContext.Provider value={{
      items,
      count,
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
      appliedCoupon,
      amountNeededForFreeDelivery,
      loading,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
