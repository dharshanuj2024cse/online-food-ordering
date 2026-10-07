import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Minus, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useCart } from '../context/CartContext';

const FoodCard = ({ food }) => {
  const { addToCart, items, updateQuantity } = useCart();
  const [adding, setAdding] = useState(false);

  const cartItem = items.find((i) => i.food_id === food.id);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (adding || !food.is_available) return;
    setAdding(true);
    await addToCart(food.id, 1);
    setAdding(false);
  };

  const handleIncrement = async (e) => {
    e.preventDefault();
    if (!cartItem) return;
    await updateQuantity(cartItem.cart_item_id, cartItem.quantity + 1);
  };

  const handleDecrement = async (e) => {
    e.preventDefault();
    if (!cartItem) return;
    await updateQuantity(cartItem.cart_item_id, cartItem.quantity - 1);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col overflow-hidden group">
      {/* Image & Badges */}
      <Link to={`/food/${food.id}`} className="relative h-48 w-full overflow-hidden bg-gray-100 block">
        <img
          src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />

        {/* Veg/Non-Veg Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-1 rounded-md shadow-sm">
          <div
            className={`w-4 h-4 border flex items-center justify-center ${
              food.is_vegetarian ? 'border-green-600' : 'border-red-600'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                food.is_vegetarian ? 'bg-green-600' : 'bg-red-600'
              }`}
            ></div>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm flex items-center space-x-1 text-xs font-bold text-gray-800">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{food.rating ? parseFloat(food.rating).toFixed(1) : '4.5'}</span>
        </div>

        {/* Category Pill */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-md text-[11px] font-medium">
          {food.category_name}
        </div>

        {/* Unavailable Overlay */}
        {!food.is_available && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <Link to={`/food/${food.id}`} className="block">
            <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition line-clamp-1 text-base">
              {food.name}
            </h3>
          </Link>
          <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
            {food.description}
          </p>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Price</span>
            <span className="text-lg font-extrabold text-gray-900">
              {formatCurrency(food.price)}
            </span>
          </div>

          <div>
            {!food.is_available ? (
              <span className="text-xs text-red-500 font-semibold italic">Unavailable</span>
            ) : cartItem ? (
              <div className="flex items-center space-x-2 bg-orange-50 border border-orange-200 rounded-xl px-2 py-1 shadow-sm">
                <button
                  onClick={handleDecrement}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-orange-600 hover:bg-orange-100 font-bold transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-orange-950 w-5 text-center">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-bold transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                disabled={adding}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition duration-200 shadow-md shadow-orange-600/20 active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
