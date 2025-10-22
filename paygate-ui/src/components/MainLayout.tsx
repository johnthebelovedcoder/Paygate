import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import MobileNavDrawer from './MobileNavDrawer';
import ErrorBoundary from './ErrorBoundary';
import { isMobileDevice } from '../utils/mobilePerformance.utils';

const MainLayout: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if device is mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };

    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // For mobile devices, we'll use a simpler layout
  if (isMobile) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile sidebar */}
        <MobileNavDrawer
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          navItems={[]} // Navigation items will be passed from Navigation component
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
              <span className="sr-only">Open menu</span>
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
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default MainLayout;
