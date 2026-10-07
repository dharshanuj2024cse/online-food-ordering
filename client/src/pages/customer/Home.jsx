import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  ShieldCheck,
  Sparkles,
  Flame,
  BadgePercent,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { foodService } from '../../services/foodService';
import { categoryService } from '../../services/categoryService';
import FoodCard from '../../components/FoodCard';
import Loader from '../../components/Loader';
import { useNotification } from '../../context/NotificationContext';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [popularFoods, setPopularFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, foodRes] = await Promise.all([
          categoryService.getCategories(),
          foodService.getFoods({ sort: 'popular', limit: 8 })
        ]);
        if (catRes.success) setCategories(catRes.categories || []);
        if (foodRes.success) setPopularFoods(foodRes.foods || []);
      } catch (err) {
        console.error('[Home.fetchData]', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('WELCOME50');
    setCopiedCoupon(true);
    showToast('Coupon WELCOME50 copied to clipboard!', 'success');
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-gray-50 pt-8 sm:pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-orange-100/80 text-orange-700 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
                <Flame className="w-4 h-4 text-orange-600 animate-bounce" />
                <span>Fastest Food Delivery In Town</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-[1.15]">
                Delicious food, <br />
                delivered to <span className="text-orange-600 underline decoration-orange-200 decoration-wavy">your door.</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Satisfy your cravings with freshly prepared gourmet biryanis, artisan pizzas, juicy burgers, and authentic Indian delicacies delivered in under 35 minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/menu"
                  className="w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-2xl shadow-xl shadow-orange-600/30 transition duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 text-base"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 bg-white/80 backdrop-blur-sm border border-gray-200 px-4 py-3.5 rounded-2xl">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Avg Delivery Time: 28 Mins</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-gray-200/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <h4 className="text-2xl font-black text-gray-900">100%</h4>
                  <p className="text-xs text-gray-500">Fresh Ingredients</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-900">4.8★</h4>
                  <p className="text-xs text-gray-500">Customer Rating</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-900">₹0</h4>
                  <p className="text-xs text-gray-500">Free Delivery &gt; ₹500</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Collage */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="w-full h-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-1 hover:rotate-0 transition duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80"
                    alt="Delicious Hyderabadi Dum Biryani"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating promo badge */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-lg">
                    50%
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">First Order Discount</p>
                    <p className="text-[11px] text-gray-500">Use code <span className="font-bold text-orange-600">WELCOME50</span></p>
                  </div>
                </div>

                {/* Floating delivery pill */}
                <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-gray-100 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-extrabold text-gray-800">Live Kitchen Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600">Explore Cuisines</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Food Categories</h2>
          </div>
          <Link to="/menu" className="mt-2 sm:mt-0 text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1">
            <span>View All Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/menu?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center bg-white p-4 rounded-2xl border border-gray-100 hover:border-orange-300 shadow-xs hover:shadow-lg hover:-translate-y-1 transition duration-300 text-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-orange-50 ring-2 ring-transparent group-hover:ring-orange-500 transition duration-300">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-orange-600 transition">
                {cat.name}
              </h3>
              <span className="text-[10px] text-gray-400 mt-0.5">{cat.food_count || 4}+ Items</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Popular Food Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-extrabold uppercase tracking-wider text-orange-600">
              <Sparkles className="w-4 h-4" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Popular Dishes</h2>
          </div>
          <Link to="/menu" className="mt-2 sm:mt-0 text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1">
            <span>Explore full menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <Loader text="Loading chef specialties..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popularFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
              <BadgePercent className="w-4 h-4" />
              <span>Special Promotional Offer</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Get 50% Flat Discount <br />
              On Your First Food Order!
            </h2>
            <p className="text-orange-100 text-sm sm:text-base leading-relaxed">
              Order any meal worth ₹300 or more and get instant savings of up to ₹100. Hot and delicious right to your door.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center space-x-3 bg-white text-gray-900 px-4 py-2.5 rounded-2xl shadow">
                <span className="text-xs font-bold text-gray-500 uppercase">Coupon:</span>
                <span className="font-black text-orange-600 tracking-wider">WELCOME50</span>
                <button
                  onClick={handleCopyCoupon}
                  className="p-1 text-gray-400 hover:text-orange-600 transition"
                  title="Copy coupon"
                >
                  {copiedCoupon ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <Link
                to="/menu"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition shadow text-sm"
              >
                Claim Offer Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features & Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600">Why FoodExpress</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Built For Food Enthusiasts</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              ⚡
            </div>
            <h3 className="font-extrabold text-lg text-gray-900 mb-2">Lightning Fast Delivery</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Average 30-minute delivery with live timeline tracking directly from kitchen to your door.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              🌿
            </div>
            <h3 className="font-extrabold text-lg text-gray-900 mb-2">Hygienic & Fresh</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Crafted fresh-to-order with zero preservatives using verified local produce and dairy.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              🛡️
            </div>
            <h3 className="font-extrabold text-lg text-gray-900 mb-2">Transparent Pricing</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              No hidden fees. Flat ₹40 delivery fee waived on orders above ₹500 with instant coupon savings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
