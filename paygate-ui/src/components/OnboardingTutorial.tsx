import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingStep {
  id: number;
  title: string;
  content: string;
  targetElement?: string; // For highlighting specific UI elements
}

const OnboardingTutorial: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const { user } = useAuth();
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Welcome to PayGate!',
      content: 'Welcome to PayGate! This quick tutorial will help you get started with creating paywalls and monetizing your content.'
    },
    {
      id: 2,
      title: 'Dashboard Overview',
      content: 'This is your dashboard. Here you can view analytics, manage your paywalls, and access all your content.',
      targetElement: 'dashboard-nav'
    },
    {
      id: 3,
      title: 'Create Your First Paywall',
      content: 'Click here to create your first paywall. You can customize it with various options to monetize your content.',
      targetElement: 'create-paywall-btn'
    },
    {
      id: 4,
      title: 'Sample Content Suggestions',
      content: 'Need inspiration? Try starting with these popular paywall types: Premium Article Access, Monthly Subscription, or Pay-per-View. You can always customize these later.',
      targetElement: 'paywalls-nav'
    },
    {
      id: 5,
      title: 'Manage Your Paywalls',
      content: 'All your paywalls are listed here. You can edit, view analytics, or delete them as needed.',
      targetElement: 'paywalls-nav'
    },
    {
      id: 6,
      title: 'Analytics Dashboard',
      content: 'Track how your paywalls are performing. View conversion rates, revenue, and other important metrics.',
      targetElement: 'analytics-nav'
    },
    {
      id: 7,
      title: 'You\'re Ready to Go!',
      content: 'You\'ve completed the PayGate onboarding. Start creating paywalls to monetize your content, or explore more features in the menu.'
    }
  ];

  // Find the target element and get its position
  useEffect(() => {
    if (onboardingSteps[currentStep].targetElement) {
      const element = document.getElementById(onboardingSteps[currentStep].targetElement!);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
      }
    }
  }, [currentStep]);

  // Check if onboarding should be shown based on user's first visit
  useEffect(() => {
    if (user) {
      const hasCompletedOnboarding = localStorage.getItem('onboardingComplete');
      // Only show onboarding for new users or on specific pages
      if (!hasCompletedOnboarding && location.pathname === '/') {
        setShowOnboarding(true);
      }
    }
  }, [user, location]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    setIsComplete(true);
    localStorage.setItem('onboardingComplete', 'true');
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  if (!showOnboarding || isComplete) {
    return null;
  }

  return (
    <>
      {/* Overlay that dims the entire screen except for the highlighted element */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-40 bg-black bg-opacity-70"
        onClick={handleSkip}
      >
        {/* Highlighted area (hole in the overlay) */}
        {onboardingSteps[currentStep].targetElement && (
          <div 
            className="absolute border-4 border-yellow-400 rounded-lg pointer-events-none"
            style={{
              top: highlightPosition.top,
              left: highlightPosition.left,
              width: highlightPosition.width,
              height: highlightPosition.height,
              zIndex: 41
            }}
          />
        )}
      </div>

      {/* Onboarding popup */}
      <div 
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border-2 border-yellow-400"
        style={{
          // Position the popup near the highlighted element if available
          top: onboardingSteps[currentStep].targetElement 
            ? highlightPosition.top + highlightPosition.height + 20 
            : '50%',
          left: onboardingSteps[currentStep].targetElement 
            ? highlightPosition.left 
            : '50%',
          transform: onboardingSteps[currentStep].targetElement ? 'none' : 'translate(-50%, -50%)'
        }}
      >
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300 ease-in-out" 
            style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
          />
        </div>
        
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Skip
        </button>
        
        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {onboardingSteps[currentStep].title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Step {currentStep + 1} of {onboardingSteps.length}
            </p>
          </div>
          
          <div className="mb-8">
            <p className="text-gray-700 dark:text-gray-300">
              {onboardingSteps[currentStep].content}
            </p>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-md ${
                currentStep === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-700'
              }`}
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTutorial;