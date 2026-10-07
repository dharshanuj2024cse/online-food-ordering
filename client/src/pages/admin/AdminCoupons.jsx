import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, TicketPercent, Check, X } from 'lucide-react';
import { couponService } from '../../services/couponService';
import { formatCurrency } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useNotification();

  const initialForm = {
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    minimum_order: 300,
    maximum_discount: 100,
    expiry_date: '2027-12-31',
    usage_limit: 500,
    status: 'active'
  };
  const [formData, setFormData] = useState(initialForm);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponService.getCoupons();
      if (res.success) setCoupons(res.coupons || []);
    } catch (err) {
      console.error('[AdminCoupons.loadCoupons]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      minimum_order: c.minimum_order || 0,
      maximum_discount: c.maximum_discount || '',
      expiry_date: c.expiry_date ? c.expiry_date.split('T')[0] : '2027-12-31',
      usage_limit: c.usage_limit || 100,
      status: c.status || 'active'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingCoupon) {
        const res = await couponService.updateCoupon(editingCoupon.id, formData);
        if (res.success) {
          showToast('Coupon updated successfully!', 'success');
          setModalOpen(false);
          await loadCoupons();
        }
      } else {
        const res = await couponService.createCoupon(formData);
        if (res.success) {
          showToast('Coupon created successfully!', 'success');
          setModalOpen(false);
          await loadCoupons();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save coupon.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await couponService.deleteCoupon(deleteConfirmId);
      if (res.success) {
        setCoupons(coupons.filter((c) => c.id !== deleteConfirmId));
        showToast('Coupon deleted.', 'info');
        setDeleteConfirmId(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete coupon.', 'error');
    }
  };

  if (loading) {
    return <Loader text="Loading coupons..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Discount Coupons</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage promotional codes, percentage discounts, and order rules.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-600/20 transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-extrabold text-gray-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Min. Order</th>
                <th className="px-6 py-4">Max. Discount</th>
                <th className="px-6 py-4">Expires</th>
                <th className="px-6 py-4">Usage (Used / Limit)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/70 transition">
                  <td className="px-6 py-4 font-black text-orange-600 tracking-wider">
                    {c.code}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {c.discount_type === 'percentage'
                      ? `${parseFloat(c.discount_value)}% OFF`
                      : `${formatCurrency(c.discount_value)} Flat OFF`}
                  </td>
                  <td className="px-6 py-4">{formatCurrency(c.minimum_order)}</td>
                  <td className="px-6 py-4">
                    {c.maximum_discount ? formatCurrency(c.maximum_discount) : 'Unlimited'}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-500">
                    {c.expiry_date ? c.expiry_date.split('T')[0] : 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">
                    {c.used_count || 0} / {c.usage_limit || '∞'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                      title="Edit coupon"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(c.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Coupon Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. FESTIVE30"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold uppercase"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Discount Type *</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Discount Value *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                placeholder="e.g. 50"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Min Order Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.minimum_order}
                onChange={(e) => setFormData({ ...formData, minimum_order: e.target.value })}
                placeholder="300"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Max Discount Cap (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.maximum_discount}
                onChange={(e) => setFormData({ ...formData, maximum_discount: e.target.value })}
                placeholder="100"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Usage Limit</label>
              <input
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                placeholder="500"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold rounded-xl shadow"
            >
              {submitting ? 'Saving...' : editingCoupon ? 'Save Changes' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Coupon Deletion"
        maxWidth="max-w-sm"
      >
        <div className="text-center space-y-4">
          <p className="text-xs text-gray-600">
            Are you sure you want to permanently delete this coupon code?
          </p>
          <div className="flex justify-center space-x-3 pt-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCoupon}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminCoupons;
