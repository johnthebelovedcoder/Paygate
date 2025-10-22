import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MobileNavDrawer from './MobileNavDrawer';
import { useTranslation } from 'react-i18next';

// Import navigation icons
import {
  HomeIcon,
  ChartBarIcon,
  FolderIcon,
  CreditCardIcon,
  UserGroupIcon,
  CogIcon,
  ChatAlt2Icon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/outline';

const MobileLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  
  // Navigation items
  const navigation = [
    { 
      name: t('navigation.home'), 
      href: '/', 
      icon: <HomeIcon className="h-6 w-6" aria-hidden="true" /> 
    },
    { 
      name: t('navigation.dashboard'), 
      href: '/dashboard', 
      icon: <ChartBarIcon className="h-6 w-6" aria-hidden="true" /> 
    },
    { 
      name: t('navigation.contentManagement'), 
      href: '/content-management', 
      icon: <FolderIcon className="h-6 w-6" aria-hidden="true" /> 
    },
    { 
      name: t('navigation.paywalls'), 
      href: '/paywalls', 
      icon: <CreditCardIcon className="h-6 w-6" aria-hidden="true" /> 
    },
    { 
      name: t('navigation.customers'), 
      href: '/customers', 
      icon: <UserGroupIcon className="h-6 w-6" aria-hidden="true" /> 
    },
    { 
      name: t('navigation.settings'), 
      href: '/settings', 
      icon: <CogIcon className="h-6 w-6" aria-hidden="true" /> 
    },
    { 
      name: t('navigation.support'), 
      href: '/support', 
      icon: <ChatAlt2Icon className="h-6 w-6" aria-hidden="true" /> 
    },
    { 
      name: t('navigation.help'), 
      href: '/help', 
      icon: <QuestionMarkCircleIcon className="h-6 w-6" aria-hidden="true" /> 
    },
  ];
  
  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <MobileNavDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={navigation}
      />
      
      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <button
            type="button"
            className="p-2 text-gray-700 rounded-md dark:text-gray-300 touch-target"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">{t('common.openMenu')}</span>
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">PG</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="pb-6">
            <Outlet />
          </div>
        </main>
        
        {/* Mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            {navigation.slice(0, 5).map((item) => {
              const isCurrent = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                    isCurrent
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  } touch-target`}
                >
                  <div className="flex items-center justify-center w-6 h-6">
                    {item.icon}
                  </div>
                  <span className="text-xs mt-1 truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;