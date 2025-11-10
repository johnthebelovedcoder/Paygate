import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts';
import { useNotifications } from '../contexts';
import NotificationDropdown from './NotificationDropdown';
import NotificationBadge from './NotificationBadge';
import ConfirmationModal from './ConfirmationModal';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { unreadCount } = useNotifications();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      name: 'Paywalls',
      href: '/paywalls',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 01-4 0 2 2 0 014 0zM7 10a2 2 0 01-4 0 2 2 0 014 0z',
    },
    {
      name: 'Content',
      href: '/content-management',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
      name: 'Marketing',
      href: '/marketing',
      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    },
    {
      name: 'Help',
      href: '/help',
      icon: 'M8.227 9.895l-5.227 6.105a1 1 0 00.773 1.638h14.454a1 1 0 00.773-1.638l-5.227-6.105c-.31-.365-.762-.56-1.227-.56s-.916.195-1.227.56zM12 5a3 3 0 100 6 3 3 0 000-6z',
    },
  ];

  const mobileNavigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      name: 'Paywalls',
      href: '/paywalls',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 01-4 0 2 2 0 014 0zM7 10a2 2 0 01-4 0 2 2 0 014 0z',
    },
    {
      name: 'More',
      items: [
        {
          name: 'Content',
          href: '/content-management',
          icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
        },
        {
          name: 'Marketing',
          href: '/marketing',
          icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
        },
        {
          name: 'Settings',
          href: '/settings',
          icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
        },
        {
          name: 'Help',
          href: '/help',
          icon: 'M8.227 9.895l-5.227 6.105a1 1 0 00.773 1.638h14.454a1 1 0 00.773-1.638l-5.227-6.105c-.31-.365-.762-.56-1.227-.56s-.916.195-1.227.56zM12 5a3 3 0 100 6 3 3 0 000-6z',
        },
      ]
    }
  ];

  const handleLogout = async () => {
    setShowLogoutModal(true);
    setUserMenuOpen(false); // Close the user menu when opening the modal
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <nav className="bg-white shadow dark:bg-gray-800 dark:shadow-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                PayGate
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'border-indigo-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <svg
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={item.icon}
                    />
                  </svg>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="bg-white dark:bg-gray-800 p-1 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Notifications */}
            <div className="relative ml-3">
              <button
                ref={notificationButtonRef}
                onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                className="bg-white dark:bg-gray-800 p-1 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
              >
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <NotificationBadge count={unreadCount} />
              </button>
              <NotificationDropdown
                isOpen={notificationMenuOpen}
                onClose={() => setNotificationMenuOpen(false)}
              />
            </div>

            {/* User menu */}
            <div className="ml-3 relative">
              <div>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  id="user-menu"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-800 font-medium">
                      {user?.full_name || user?.name 
                        ? (user.full_name || user.name || '').split(' ').slice(0, 2).map(n => n.charAt(0)).join('').toUpperCase() 
                        : (user?.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                </button>
              </div>

              {userMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.full_name || user?.name || user?.email.split('@')[0]}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-300">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="relative bg-white dark:bg-gray-800 shadow-lg w-full max-w-xs h-full overflow-y-auto transform transition-transform duration-300 ease-in-out" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="pt-2 pb-3 px-4 space-y-1">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-gray-700 dark:border-indigo-500 dark:text-indigo-200'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  } block pl-3 pr-4 py-3 rounded-md text-base font-medium flex items-center`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg
                    className="h-5 w-5 mr-3 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  <span className="truncate">{item.name}</span>
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 px-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center dark:bg-gray-700">
                    <span className="text-indigo-800 font-medium dark:text-indigo-200">
                      {user?.full_name || user?.name 
                        ? (user.full_name || user.name || '').split(' ').slice(0, 2).map(n => n.charAt(0)).join('').toUpperCase() 
                        : (user?.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3 overflow-hidden">
                  <div className="text-base font-medium text-gray-800 dark:text-white truncate">{user?.full_name || user?.name || user?.email?.split('@')[0]}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">
                    {user?.email}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 rounded-md"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out? You will need to log back in to access your account."
        confirmText="Sign Out"
        cancelText="Cancel"
        isProcessing={isLoggingOut}
      />
    </nav>
  );
};

export default Navigation;
