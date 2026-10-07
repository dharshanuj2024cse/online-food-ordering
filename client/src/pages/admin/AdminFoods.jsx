import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { foodService } from '../../services/foodService';
import { categoryService } from '../../services/categoryService';
import { formatCurrency } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';

const AdminFoods = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { showToast } = useNotification();

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    name: '',
    category_id: '',
    description: '',
    price: '',
    image: '',
    ingredients: '',
    rating: 4.5,
    is_vegetarian: 0,
    is_available: 1
  };
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fRes, cRes] = await Promise.all([
        foodService.getFoods({ available_only: false }),
        categoryService.getCategories()
      ]);
      if (fRes.success) setFoods(fRes.foods || []);
      if (cRes.success) {
        setCategories(cRes.categories || []);
        if (cRes.categories.length > 0 && !formData.category_id) {
          setFormData((prev) => ({ ...prev, category_id: cRes.categories[0].id }));
        }
      }
    } catch (err) {
      console.error('[AdminFoods.loadData]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingFood(null);
    setFormData({
      ...initialForm,
      category_id: categories.length > 0 ? categories[0].id : ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      category_id: food.category_id,
      description: food.description || '',
      price: food.price,
      image: food.image || '',
      ingredients: food.ingredients || '',
      rating: food.rating || 4.5,
      is_vegetarian: food.is_vegetarian,
      is_available: food.is_available
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingFood) {
        const res = await foodService.updateFood(editingFood.id, formData);
        if (res.success) {
          showToast('Food item updated successfully!', 'success');
          setModalOpen(false);
          await loadData();
        }
      } else {
        const res = await foodService.createFood(formData);
        if (res.success) {
          showToast('New food item created!', 'success');
          setModalOpen(false);
          await loadData();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save food item.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      const res = await foodService.toggleAvailability(id);
      if (res.success) {
        setFoods(foods.map((f) => (f.id === id ? { ...f, is_available: res.is_available } : f)));
        showToast(res.message, 'info');
      }
    } catch (err) {
      showToast('Failed to toggle availability.', 'error');
    }
  };

  const handleDeleteFood = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await foodService.deleteFood(deleteConfirmId);
      if (res.success) {
        setFoods(foods.filter((f) => f.id !== deleteConfirmId));
        showToast('Food item removed successfully.', 'success');
        setDeleteConfirmId(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete food.', 'error');
    }
  };

  const filteredFoods = foods.filter((f) => {
    const matchesSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCategory || f.category_id.toString() === selectedCategory;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return <Loader text="Loading food catalog..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Food Items Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Add, edit, adjust prices, and toggle in-stock availability.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-600/20 transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Food</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-xs text-gray-400 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-orange-500"
          >
            <option value="">All Categories ({foods.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Foods Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-extrabold text-gray-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Food Item</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">In Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredFoods.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50/70 transition">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center space-x-3">
                      <img
                        src={f.image}
                        alt={f.name}
                        className="w-10 h-10 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-extrabold text-gray-900 truncate max-w-xs">{f.name}</p>
                        <p className="text-[11px] text-gray-400 line-clamp-1">{f.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-bold text-gray-700">{f.category_name}</td>
                  <td className="px-6 py-3.5 font-extrabold text-gray-900">{formatCurrency(f.price)}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.is_vegetarian
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {f.is_vegetarian ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-bold text-gray-800">★ {parseFloat(f.rating).toFixed(1)}</td>
                  <td className="px-6 py-3.5">
                    <button
                      onClick={() => handleToggleAvailability(f.id)}
                      className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        f.is_available ? 'bg-orange-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                          f.is_available ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(f)}
                      className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                      title="Edit food"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(f.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete food"
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

      {/* Add / Edit Food Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFood ? 'Edit Food Item' : 'Add New Food Item'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Food Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Farmhouse Pizza"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Category *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="299.00"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Rating</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Appetizing summary of flavors and preparation..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
            ></textarea>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">Ingredients (comma-separated)</label>
            <input
              type="text"
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              placeholder="Basmati rice, Saffron, Chicken, Ghee, Mint"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
            />
          </div>

          <div className="flex items-center space-x-6 pt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_vegetarian === 1}
                onChange={(e) => setFormData({ ...formData, is_vegetarian: e.target.checked ? 1 : 0 })}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              <span className="font-bold text-gray-700">Vegetarian Dish</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_available === 1}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked ? 1 : 0 })}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              <span className="font-bold text-gray-700">Available In Stock</span>
            </label>
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
              {submitting ? 'Saving...' : editingFood ? 'Save Changes' : 'Create Food Item'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Delete"
        maxWidth="max-w-sm"
      >
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-xs text-gray-600">
            Are you sure you want to permanently delete this food item? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-3 pt-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteFood}
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

export default AdminFoods;
