import React from 'react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const { t } = useTranslation();
  
  return (
    <header className="bg-white shadow dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {t(title as keyof typeof t) || title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t(subtitle as keyof typeof t) || subtitle}
              </p>
            )}
          </div>
          {actions && <div className="mt-4 md:mt-0">{actions}</div>}
        </div>
      </div>
    </header>
  );
};

export default Header;
