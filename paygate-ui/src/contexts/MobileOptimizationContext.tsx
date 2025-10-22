import React, { createContext, useContext, ReactNode } from 'react';
import useDeviceDetection from '../hooks/useDeviceDetection';
import useOnlineStatus from '../hooks/useOnlineStatus';
import useServiceWorker from '../hooks/useServiceWorker';

interface MobileOptimizationContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isOnline: boolean;
  isOffline: boolean;
  screenWidth: number;
  screenHeight: number;
  isServiceWorkerSupported: boolean;
  isServiceWorkerRegistered: boolean;
  prefersReducedMotion: boolean;
  prefersDarkMode: boolean;
}

const MobileOptimizationContext = createContext<MobileOptimizationContextType | undefined>(undefined);

export const MobileOptimizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Device detection
  const deviceInfo = useDeviceDetection();
  
  // Online/offline status
  const isOnline = useOnlineStatus();
  
  // Service worker status
  const swStatus = useServiceWorker();
  
  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  
  // Dark mode preference
  const [prefersDarkMode, setPrefersDarkMode] = React.useState(false);

  // Detect user preferences
  React.useEffect(() => {
    // Reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    const motionHandler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    motionQuery.addEventListener('change', motionHandler);
    
    // Dark mode preference
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDarkMode(darkQuery.matches);
    
    const darkHandler = (e: MediaQueryListEvent) => {
      setPrefersDarkMode(e.matches);
    };
    
    darkQuery.addEventListener('change', darkHandler);
    
    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      darkQuery.removeEventListener('change', darkHandler);
    };
  }, []);

  const value: MobileOptimizationContextType = {
    ...deviceInfo,
    isOnline,
    isOffline: !isOnline,
    isServiceWorkerSupported: swStatus.isSupported,
    isServiceWorkerRegistered: swStatus.isRegistered,
    prefersReducedMotion,
    prefersDarkMode,
  };

  return (
    <MobileOptimizationContext.Provider value={value}>
      {children}
    </MobileOptimizationContext.Provider>
  );
};

export const useMobileOptimization = (): MobileOptimizationContextType => {
  const context = useContext(MobileOptimizationContext);
  if (!context) {
    throw new Error('useMobileOptimization must be used within a MobileOptimizationProvider');
  }
  return context;
};

export default useMobileOptimization;