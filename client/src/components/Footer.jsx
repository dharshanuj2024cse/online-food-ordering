import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">🍔</span>
              <span className="text-2xl font-black text-white tracking-tight">
                Food<span className="text-orange-500">Express</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Delicious hot food crafted with premium authentic ingredients, delivered right to your doorstep in minutes.
            </p>
            <div className="flex items-center space-x-3 text-xs text-orange-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Kitchen is Open (10:00 AM - 11:30 PM)</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-orange-400 transition">Home</Link></li>
              <li><Link to="/menu" className="hover:text-orange-400 transition">Food Menu</Link></li>
              <li><Link to="/orders" className="hover:text-orange-400 transition">Track Your Order</Link></li>
              <li><Link to="/cart" className="hover:text-orange-400 transition">Shopping Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/menu?category=Biryani" className="hover:text-orange-400 transition">Dum Biryani</Link></li>
              <li><Link to="/menu?category=Pizza" className="hover:text-orange-400 transition">Artisan Pizzas</Link></li>
              <li><Link to="/menu?category=Burger" className="hover:text-orange-400 transition">Juicy Burgers</Link></li>
              <li><Link to="/menu?category=Indian" className="hover:text-orange-400 transition">North Indian Curries</Link></li>
              <li><Link to="/menu?category=Desserts" className="hover:text-orange-400 transition">Desserts & Sweets</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact & Support</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span>support@foodexpress.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>124 Gourmet Boulevard, Koramangala, Bangalore</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} FoodExpress Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for food lovers everywhere.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
