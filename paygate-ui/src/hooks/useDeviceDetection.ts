import { useState, useEffect } from 'react';

/**
 * Hook to detect mobile device characteristics
 * @returns Object with mobile device information
 */
export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: false,
    screenWidth: 0,
    screenHeight: 0,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Mobile detection based on user agent and screen size
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      // Screen size based detection
      const isSmallScreen = width <= 768;
      const isMediumScreen = width > 768 && width <= 1024;
      
      setDeviceInfo({
        isMobile: isMobileUA || isSmallScreen,
        isTablet: isMediumScreen || (/iPad|Android/i.test(userAgent) && width > 768),
        isDesktop: !isMobileUA && !isMediumScreen && width > 1024,
        isTouchDevice: isTouch,
        screenWidth: width,
        screenHeight: height,
      });
    };

    // Initial detection
    updateDeviceInfo();

    // Update on resize
    window.addEventListener('resize', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};

export default useDeviceDetection;