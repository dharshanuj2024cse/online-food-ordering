import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { addressService } from '../../services/addressService';
import { orderService } from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';

const Checkout = () => {
  const { items, subtotal, deliveryFee, tax, discount, total, appliedCoupon, refreshCart } = useCart();
  const { showToast, addNotification } = useNotification();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [mockPaymentModalOpen, setMockPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState('IDLE'); // IDLE, PROCESSING, SUCCESS

  // New address form state
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560034',
    is_default: 1
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const res = await addressService.getAddresses();
        if (res.success && res.addresses?.length > 0) {
          setAddresses(res.addresses);
          const defaultAddr = res.addresses.find((a) => a.is_default) || res.addresses[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowAddressModal(true);
        }
      } catch (err) {
        console.error('[Checkout.fetchAddresses]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [items, navigate]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressService.addAddress(newAddress);
      if (res.success && res.address) {
        setAddresses([res.address, ...addresses]);
        setSelectedAddressId(res.address.id);
        setShowAddressModal(false);
        showToast('Address saved successfully!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save address.', 'error');
    }
  };

  const executeOrderPlacement = async () => {
    try {
      setPlacingOrder(true);
      const payload = {
        address_id: selectedAddressId,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        payment_method: paymentMethod
      };

      const res = await orderService.placeOrder(payload);
      if (res.success && res.order) {
        await refreshCart();
        addNotification(
          `Order #${res.order.orderNumber} Placed! 🎉`,
          `Your order for ${formatCurrency(res.order.total)} has been received and is being prepared.`
        );
        navigate(`/order-confirmation/${res.order.orderNumber}`, { state: { order: res.order } });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to place order.', 'error');
      setPlacingOrder(false);
    }
  };

  const handlePlaceOrderClick = () => {
    if (!selectedAddressId) {
      showToast('Please select or add a delivery address.', 'warning');
      return;
    }

    if (paymentMethod === 'ONLINE') {
      // Trigger Mock Online Payment simulation
      setMockPaymentModalOpen(true);
      setPaymentStep('PROCESSING');

      setTimeout(() => {
        setPaymentStep('SUCCESS');
        setTimeout(() => {
          setMockPaymentModalOpen(false);
          executeOrderPlacement();
        }, 1200);
      }, 2000);
    } else {
      executeOrderPlacement();
    }
  };

  if (loading) {
    return <Loader text="Setting up checkout..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Delivery Address Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-extrabold text-gray-900">Delivery Address</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="text-xs font-bold text-orange-600 hover:underline flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
                No delivery address found. Please add an address to continue.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition relative ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      {addr.is_default === 1 && (
                        <span className="absolute top-3 right-3 text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                      <h4 className="font-extrabold text-sm text-gray-900">{addr.full_name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{addr.phone}</p>
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Payment Method Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-extrabold text-gray-900">Payment Option</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cash On Delivery */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition flex items-start space-x-3 ${
                  paymentMethod === 'COD'
                    ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <Banknote className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900">Cash on Delivery</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Pay in cash or UPI when your food arrives at the door.</p>
                </div>
              </div>

              {/* Mock Online Payment */}
              <div
                onClick={() => setPaymentMethod('ONLINE')}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition flex items-start space-x-3 ${
                  paymentMethod === 'ONLINE'
                    ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <CreditCard className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h4 className="font-extrabold text-sm text-gray-900">Online Payment</h4>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                      Mock UPI/Card
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Simulated instant credit/debit card, netbanking, or UPI sandbox.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 pb-3 border-b border-gray-100">
              Order Items ({items.length})
            </h3>

            {/* Quick list of items */}
            <div className="max-h-52 overflow-y-auto divide-y divide-gray-50 space-y-2 pr-1">
              {items.map((i) => (
                <div key={i.cart_item_id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <span className="font-bold text-gray-800">{i.food_name}</span>
                    <span className="text-gray-400 block">Qty: {i.quantity}</span>
                  </div>
                  <span className="font-extrabold text-gray-900">
                    {formatCurrency(i.price * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-gray-800">
                  {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span className="font-bold text-gray-800">{formatCurrency(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Grand Total</span>
                <span className="text-2xl font-black text-gray-900">{formatCurrency(total)}</span>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrderClick}
                disabled={placingOrder}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-extrabold rounded-2xl shadow-xl shadow-orange-600/30 transition duration-200 flex items-center justify-center space-x-2 active:scale-98"
              >
                {placingOrder ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Place Order • {formatCurrency(total)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add New Address */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Add New Delivery Address"
      >
        <form onSubmit={handleAddNewAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newAddress.full_name}
                onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                placeholder="Recipient name"
                className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone</label>
              <input
                type="tel"
                required
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                placeholder="10 digit number"
                className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Street Address</label>
            <textarea
              required
              rows={2}
              value={newAddress.address}
              onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
              placeholder="Flat/House no., Building, Street, Landmark"
              className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl p-2.5"
            ></textarea>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City</label>
              <input
                type="text"
                required
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">State</label>
              <input
                type="text"
                required
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pincode</label>
              <input
                type="text"
                required
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl p-2.5"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              className="px-4 py-2 border border-gray-200 text-xs font-bold rounded-xl text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>

      {/* Mock Online Payment Modal */}
      <Modal
        isOpen={mockPaymentModalOpen}
        onClose={() => {}}
        title="Simulated Payment Gateway"
        maxWidth="max-w-md"
      >
        <div className="py-6 text-center space-y-4">
          {paymentStep === 'PROCESSING' && (
            <>
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
              <h4 className="text-base font-extrabold text-gray-900">Processing Online Payment...</h4>
              <p className="text-xs text-gray-500">
                Simulating banking authorization for {formatCurrency(total)}. Please do not refresh.
              </p>
            </>
          )}

          {paymentStep === 'SUCCESS' && (
            <>
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce">
                ✓
              </div>
              <h4 className="text-base font-extrabold text-emerald-800">Payment Authorized!</h4>
              <p className="text-xs text-gray-500">Creating your confirmed restaurant order...</p>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Checkout;
