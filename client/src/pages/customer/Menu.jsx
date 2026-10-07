import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { foodService } from '../../services/foodService';
import { categoryService } from '../../services/categoryService';
import FoodCard from '../../components/FoodCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [vegOnly, setVegOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState(600);
  const [minRating, setMinRating] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success) setCategories(res.categories || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  // Sync category or search from URL changes
  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('search');
    if (cat !== null) setSelectedCategory(cat);
    if (q !== null) setSearch(q);
  }, [searchParams]);

  // Fetch foods with filters
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const params = {
          search: search.trim() || undefined,
          category: selectedCategory || undefined,
          is_vegetarian: vegOnly ? 1 : undefined,
          available_only: availableOnly ? 1 : undefined,
          max_price: priceRange < 600 ? priceRange : undefined,
          rating: minRating > 0 ? minRating : undefined,
          sort: sortBy
        };

        const res = await foodService.getFoods(params);
        if (res.success) {
          setFoods(res.foods || []);
        }
      } catch (err) {
        console.error('[Menu.fetchFoods]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [search, selectedCategory, vegOnly, availableOnly, sortBy, priceRange, minRating]);

  const handleCategorySelect = (catName) => {
    if (selectedCategory === catName) {
      setSelectedCategory('');
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSelectedCategory(catName);
      searchParams.set('category', catName);
      setSearchParams(searchParams);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setVegOnly(false);
    setAvailableOnly(false);
    setPriceRange(600);
    setMinRating(0);
    setSortBy('popular');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Our Food Menu</h1>
          <p className="text-sm text-gray-500 mt-1">
            Explore authentic flavors, hand-crafted meals, and irresistible bites.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by dish or ingredient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-none mb-6">
        <button
          onClick={() => handleCategorySelect('')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-xs ${
            !selectedCategory
              ? 'bg-orange-600 text-white shadow-orange-600/20'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          All Items ({foods.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCategorySelect(c.name)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-xs flex items-center space-x-1.5 ${
              selectedCategory === c.name
                ? 'bg-orange-600 text-white shadow-orange-600/20'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Filter Bar & Sort Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs mb-8 flex flex-wrap items-center justify-between gap-4">
        {/* Toggle options */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              vegOnly
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Pure Veg Only</span>
          </button>

          {/* Available Only */}
          <button
            onClick={() => setAvailableOnly(!availableOnly)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              availableOnly
                ? 'bg-orange-50 border-orange-500 text-orange-800'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>In Stock Only</span>
          </button>

          {/* Rating filter (4.5+) */}
          <button
            onClick={() => setMinRating(minRating === 4.5 ? 0 : 4.5)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              minRating === 4.5
                ? 'bg-amber-50 border-amber-500 text-amber-800'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>★ 4.5+ Rating</span>
          </button>

          {/* Reset button */}
          {(vegOnly || availableOnly || minRating > 0 || search || selectedCategory) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-orange-600 font-bold hover:underline px-2"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-orange-500"
          >
            <option value="popular">Popularity & Rating</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <Loader text="Fetching delicious dishes..." />
      ) : foods.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No food items found"
          message="We couldn't find any dishes matching your selected filters or search keyword. Try clearing some filters."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {foods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;
