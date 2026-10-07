import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame
} from 'lucide-react';
import { foodService } from '../../services/foodService';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import Loader from '../../components/Loader';
import FoodCard from '../../components/FoodCard';

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items, updateQuantity } = useCart();

  const [food, setFood] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await foodService.getFoodById(id);
        if (res.success) {
          setFood(res.food);
          setRelated(res.related || []);
        }
      } catch (err) {
        console.error('[FoodDetails.fetchDetails]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return <Loader text="Loading food details..." />;
  }

  if (!food) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">Dish not found</h2>
        <p className="text-sm text-gray-500 mt-2">The requested food item does not exist.</p>
        <Link to="/menu" className="mt-4 inline-block text-sm font-bold text-orange-600 hover:underline">
          Return to Menu
        </Link>
      </div>
    );
  }

  const ingredientsList = food.ingredients
    ? food.ingredients.split(',').map((item) => item.trim())
    : [];

  const handleAddToCart = async () => {
    if (adding || !food.is_available) return;
    setAdding(true);
    await addToCart(food.id, quantity);
    setAdding(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-orange-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Food Listing</span>
      </button>

      {/* Main Details Grid */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Large Image Column */}
        <div className="lg:col-span-6 relative">
          <div className="w-full h-80 sm:h-[420px] rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
            <img
              src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
              alt={food.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Veg badge overlay */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-1.5 rounded-xl shadow-md">
            <div
              className={`w-5 h-5 border-2 flex items-center justify-center ${
                food.is_vegetarian ? 'border-green-600' : 'border-red-600'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  food.is_vegetarian ? 'bg-green-600' : 'bg-red-600'
                }`}
              ></div>
            </div>
          </div>

          {/* Availability badge */}
          {!food.is_available && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-2xl flex items-center justify-center">
              <span className="bg-red-600 text-white font-extrabold px-6 py-2 rounded-full text-sm uppercase tracking-wider shadow">
                Currently Unavailable
              </span>
            </div>
          )}
        </div>

        {/* Info & Order Column */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-extrabold uppercase tracking-wider">
                {food.category_name}
              </span>
              <div className="flex items-center space-x-1 text-sm font-extrabold text-gray-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{food.rating ? parseFloat(food.rating).toFixed(1) : '4.5'}</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              {food.name}
            </h1>

            <p className="text-2xl font-black text-orange-600 mt-2">
              {formatCurrency(food.price)}
            </p>
          </div>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            {food.description}
          </p>

          {/* Ingredients */}
          {ingredientsList.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                Key Ingredients & Spices
              </h4>
              <div className="flex flex-wrap gap-2">
                {ingredientsList.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector and Add to Cart button */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            {food.is_available ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center border border-gray-200 rounded-2xl bg-gray-50 p-1 w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-700 hover:bg-gray-100 font-bold shadow-xs transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-extrabold text-gray-900 text-base">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-600 text-white hover:bg-orange-700 font-bold shadow-xs transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="w-full sm:flex-1 py-3.5 px-6 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-600/30 transition duration-200 flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    Add to Cart • {formatCurrency(food.price * quantity)}
                  </span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-semibold">
                This item is currently sold out. Please explore our other dishes!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Dishes */}
      {related.length > 0 && (
        <div className="pt-6">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-gray-900">You Might Also Like</h3>
            <p className="text-xs text-gray-500 mt-0.5">More flavorful choices from {food.category_name}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((item) => (
              <FoodCard key={item.id} food={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDetails;
