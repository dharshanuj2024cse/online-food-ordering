import React from 'react';

const Loader = ({ text = 'Loading delicious food...', size = 'md' }) => {
  const spinnerSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
      <div className={`${spinnerSize} border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin`}></div>
      {text && <p className="text-sm font-medium text-gray-500">{text}</p>}
    </div>
  );
};

export default Loader;
