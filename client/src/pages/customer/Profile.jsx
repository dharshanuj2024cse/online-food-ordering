import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  ShoppingBag,
  IndianRupee
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { addressService } from '../../services/addressService';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotification();

  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ totalOrders: 0, totalSpent: 0 });
  const [profileData, setProfileData] = useState({ name: '', phone: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [addresses, setAddresses] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '',
    is_default: 0
  });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        const [meRes, addrRes] = await Promise.all([
          authService.getMe(),
          addressService.getAddresses()
        ]);

        if (meRes.success) {
          setProfileData({
            name: meRes.user.name || '',
            phone: meRes.user.phone || ''
          });
          if (meRes.stats) setUserStats(meRes.stats);
        }
        if (addrRes.success) {
          setAddresses(addrRes.addresses || []);
        }
      } catch (err) {
        console.error('[Profile.loadProfileData]', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await authService.updateProfile(profileData);
      if (res.success) {
        await refreshUser();
        showToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    try {
      setSavingPassword(true);
      const res = await authService.changePassword(passwords);
      if (res.success) {
        showToast('Password changed successfully!', 'success');
        setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressService.addAddress(newAddress);
      if (res.success && res.address) {
        setAddresses([res.address, ...addresses]);
        setAddressModalOpen(false);
        showToast('New address saved!', 'success');
        setNewAddress({ full_name: '', phone: '', address: '', city: 'Bangalore', state: 'Karnataka', pincode: '', is_default: 0 });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add address.', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await addressService.deleteAddress(id);
      if (res.success) {
        setAddresses(addresses.filter((a) => a.id !== id));
        showToast('Address deleted.', 'info');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete address.', 'error');
    }
  };

  if (loading) {
    return <Loader text="Loading your account profile..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Summary */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-20 h-20 rounded-3xl bg-orange-600 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-orange-600/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{user?.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 uppercase tracking-wider">
              {user?.role === 'admin' ? 'System Administrator' : 'Food Lover Customer'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
          <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100 text-center">
            <span className="text-2xl font-black text-orange-600">{userStats.totalOrders}</span>
            <p className="text-[11px] font-bold text-gray-500 uppercase mt-0.5">Orders Placed</p>
          </div>
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-center">
            <span className="text-2xl font-black text-emerald-700">{formatCurrency(userStats.totalSpent)}</span>
            <p className="text-[11px] font-bold text-gray-500 uppercase mt-0.5">Total Spent</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Personal info & Change password */}
        <div className="lg:col-span-6 space-y-8">
          {/* Edit Profile */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-gray-900 pb-3 border-b border-gray-100">
              Personal Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-3 font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">Email address cannot be changed.</span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-3 font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold rounded-xl shadow transition"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-gray-900 pb-3 border-b border-gray-100">
              Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.confirmNewPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
                  placeholder="Re-type new password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-3 bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-bold rounded-xl shadow transition"
              >
                {savingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Address Book */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-base font-extrabold text-gray-900">Saved Addresses</h2>
            <button
              onClick={() => setAddressModalOpen(true)}
              className="text-xs font-bold text-orange-600 hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No saved addresses found. Add an address for rapid checkout.
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 flex items-start justify-between gap-4"
                >
                  <div className="text-xs space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-gray-900">{addr.full_name}</span>
                      {addr.is_default === 1 && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500">{addr.phone}</p>
                    <p className="text-gray-700 leading-relaxed">
                      {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Add Delivery Address"
      >
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newAddress.full_name}
                onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
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
              onClick={() => setAddressModalOpen(false)}
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
    </div>
  );
};

export default Profile;
