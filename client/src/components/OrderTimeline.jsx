import React from 'react';
import { CheckCircle2, Clock, ChefHat, Bike, PackageCheck, XCircle } from 'lucide-react';

const OrderTimeline = ({ orderStatus }) => {
  if (orderStatus === 'CANCELLED') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700">
        <XCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
        <div>
          <h4 className="font-bold text-sm">Order Cancelled</h4>
          <p className="text-xs text-red-600">This order was cancelled and will not be delivered.</p>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'PLACED', title: 'Order Placed', icon: Clock },
    { key: 'CONFIRMED', title: 'Confirmed', icon: CheckCircle2 },
    { key: 'PREPARING', title: 'Preparing', icon: ChefHat },
    { key: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', icon: Bike },
    { key: 'DELIVERED', title: 'Delivered', icon: PackageCheck }
  ];

  const currentIdx = steps.findIndex(s => s.key === orderStatus);

  return (
    <div className="w-full py-6">
      {/* Desktop / Tablet Timeline */}
      <div className="hidden sm:flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
        <div
          className="absolute top-1/2 left-0 h-1 bg-orange-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${Math.max(0, (currentIdx / (steps.length - 1)) * 100)}%` }}
        ></div>

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                  isCurrent
                    ? 'bg-orange-600 text-white ring-4 ring-orange-100 scale-110'
                    : isCompleted
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs mt-2 font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Timeline */}
      <div className="sm:hidden space-y-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={step.key} className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCurrent
                    ? 'bg-orange-600 text-white ring-2 ring-orange-200'
                    : isCompleted
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className={`text-sm font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.title}
                </span>
                {isCurrent && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 animate-pulse">
                    Current Status
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
