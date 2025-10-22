import { useState, useEffect } from 'react';
import { isMobileDevice, isSlowConnection, getOptimalImageQuality } from '../utils/mobilePerformance.utils';

interface UseMobileOptimizationReturn {
  isMobile: boolean;
  isSlowNetwork: boolean;
  imageQuality: 'high' | 'medium' | 'low';
  enableVirtualScrolling: boolean;
  reducedMotion: boolean;
}

/**
 * Hook to detect mobile device characteristics and optimize accordingly
 * @returns Mobile optimization settings
 */
export const useMobileOptimization = (): UseMobileOptimizationReturn => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [imageQuality, setImageQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const mobileCheck = isMobileDevice();
    setIsMobile(mobileCheck);

    // Check network conditions
    const slowNetworkCheck = isSlowConnection();
    setIsSlowNetwork(slowNetworkCheck);

    // Determine optimal image quality
    const quality = getOptimalImageQuality();
    setImageQuality(quality);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReducedMotion);

    // Listen for network changes
    const handleNetworkChange = () => {
      const slowNetwork = isSlowConnection();
      setIsSlowNetwork(slowNetwork);
      const quality = getOptimalImageQuality();
      setImageQuality(quality);
    };

    // Listen for reduced motion preference changes
    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    // Set up event listeners
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', handleMotionPreferenceChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      motionQuery.removeEventListener('change', handleMotionPreferenceChange);
    };
  }, []);

  // Enable virtual scrolling for mobile devices or when there are many items
  const enableVirtualScrolling = isMobile || isSlowNetwork;

  return {
    isMobile,
    isSlowNetwork,
    imageQuality,
    enableVirtualScrolling,
    reducedMotion
  };
};

export default useMobileOptimization;