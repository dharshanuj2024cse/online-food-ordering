import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = '🍽️',
  title = 'Nothing here yet',
  message = 'There is currently no data to display.',
  actionText,
  actionLink,
  onAction
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-md mx-auto my-8 shadow-sm">
      <div className="text-5xl mb-4 select-none">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">{message}</p>
      {actionText && (
        actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition duration-200 shadow-md shadow-orange-600/20"
          >
            {actionText}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition duration-200 shadow-md shadow-orange-600/20"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
};

export default EmptyState;
