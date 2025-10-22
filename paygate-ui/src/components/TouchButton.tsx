import React from 'react';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className = '',
  ...props
}) => {
  // Base classes for touch-friendly buttons
  const baseClasses = "touch-target rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
  
  // Size classes
  const sizeClasses = {
    small: "px-3 py-2 text-sm min-h-[44px] min-w-[44px]",
    medium: "px-4 py-2 text-sm min-h-[44px] min-w-[44px]",
    large: "px-6 py-3 text-base min-h-[48px] min-w-[48px]"
  };
  
  // Variant classes
  const variantClasses = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
  };
  
  // Full width class
  const fullWidthClass = fullWidth ? "w-full" : "";
  
  // Combine all classes
  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidthClass} ${className}`;
  
  return (
    <button
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
};

export default TouchButton;