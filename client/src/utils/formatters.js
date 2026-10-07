export const formatCurrency = (amount) => {
  const num = parseFloat(amount || 0);
  return `₹${num.toFixed(2)}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const getStatusBadge = (status) => {
  switch (status) {
    case 'PLACED':
      return { label: 'Order Placed', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    case 'CONFIRMED':
      return { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    case 'PREPARING':
      return { label: 'Preparing Food', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    case 'OUT_FOR_DELIVERY':
      return { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    case 'DELIVERED':
      return { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-300' };
    case 'CANCELLED':
      return { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-300' };
    default:
      return { label: status || 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-300' };
  }
};
