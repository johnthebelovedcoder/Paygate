import React, { useState } from 'react';

interface PricingSelectorProps {
  selectedPrice: number;
  onPriceChange: (price: number) => void;
}

const PricingSelector: React.FC<PricingSelectorProps> = ({ selectedPrice, onPriceChange }) => {
  const [customPrice, setCustomPrice] = useState(selectedPrice.toString());

  const handleCustomPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomPrice(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onPriceChange(numValue);
    }
  };

  return (
    <div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Set your price</h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enter the price for your content
        </p>
        <div className="mt-2">
          <div className="flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={customPrice}
              onChange={handleCustomPriceChange}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSelector;
