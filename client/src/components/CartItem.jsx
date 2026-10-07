import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition hover:border-gray-200">
      {/* Item info */}
      <div className="flex items-center space-x-4 flex-1 min-w-0 pr-4">
        <img
          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80'}
          alt={item.food_name}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-100"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <span
              className={`w-3 h-3 rounded-sm border flex items-center justify-center flex-shrink-0 ${
                item.is_vegetarian ? 'border-green-600' : 'border-red-600'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${item.is_vegetarian ? 'bg-green-600' : 'bg-red-600'}`}></span>
            </span>
            <h4 className="font-bold text-gray-900 truncate text-sm sm:text-base">{item.food_name}</h4>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{item.category_name}</p>
          <p className="text-xs font-semibold text-gray-700 mt-1 sm:hidden">
            {formatCurrency(item.price)} each
          </p>
        </div>
      </div>

      {/* Quantity & Subtotal Controls */}
      <div className="flex items-center space-x-4">
        <span className="hidden sm:inline-block text-sm text-gray-500 font-medium">
          {formatCurrency(item.price)}
        </span>

        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
          <button
            onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity - 1)}
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-white text-gray-700 hover:bg-gray-100 font-bold transition shadow-xs"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-bold text-gray-900 w-5 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.cart_item_id, item.quantity + 1)}
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-orange-600 text-white hover:bg-orange-700 font-bold transition"
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <span className="text-base font-extrabold text-gray-900 w-20 text-right">
          {formatCurrency(item.price * item.quantity)}
        </span>

        <button
          onClick={() => onRemove(item.cart_item_id)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
          title="Remove from cart"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
