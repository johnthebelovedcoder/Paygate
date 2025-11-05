import { useState, useEffect } from 'react';

interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  registration?: ServiceWorkerRegistration;
  error?: Error;
}

/**
 * Hook to register and manage service worker
 * @returns Service worker registration status
 */
export const useServiceWorker = (): ServiceWorkerStatus => {
  const [registrationStatus, setRegistrationStatus] = useState<ServiceWorkerStatus>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
  });

  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production' || !registrationStatus.isSupported) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        setRegistrationStatus({
          isSupported: true,
          isRegistered: true,
          registration: registration as unknown as ServiceWorkerRegistration,
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        
        setRegistrationStatus({
          isSupported: true,
          isRegistered: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        });
      }
    };

    // Register service worker when component mounts
    if (document.readyState === 'complete') {
      registerServiceWorker();
    } else {
      window.addEventListener('load', registerServiceWorker);
    }

    return () => {
      window.removeEventListener('load', registerServiceWorker);
    };
  }, [registrationStatus.isSupported]);

  return registrationStatus;
};

export default useServiceWorker;