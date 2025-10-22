import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  title, 
  subtitle, 
  actions,
  onMenuToggle,
  isMenuOpen 
}) => {
  const { t } = useTranslation();
  
  return (
    <header className="bg-white shadow dark:bg-gray-800 dark:shadow-gray-900/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col">
          {/* Top row with menu toggle and actions */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {onMenuToggle && (
                <button
                  onClick={onMenuToggle}
                  className="mr-3 p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-700 touch-target"
                  aria-expanded={isMenuOpen}
                >
                  <span className="sr-only">{t('common.toggleMenu')}</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                    />
                  </svg>
                </button>
              )}
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {t(title as any) || title}
              </h1>
            </div>
            
            {actions && (
              <div className="flex items-center space-x-2">
                <LanguageSwitcher />
                {actions}
              </div>
            )}
          </div>
          
          {/* Subtitle row */}
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {t(subtitle as any) || subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;