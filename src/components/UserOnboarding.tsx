import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [selectedPricing, setSelectedPricing] = useState<string | null>(null);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      navigate('/');
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const contentOptions = [
    {
      id: 'ebook',
      title: 'E-book or Guide',
      description: 'Written content like guides, manuals, or books',
    },
    { id: 'video', title: 'Video Course', description: 'Educational videos or tutorials' },
    { id: 'audio', title: 'Audio Content', description: 'Podcasts, music, or audio guides' },
    {
      id: 'template',
      title: 'Templates or Tools',
      description: 'Design templates, spreadsheets, or software',
    },
    { id: 'consultation', title: 'Consultation', description: 'One-on-one time or expert advice' },
  ];

  const pricingOptions = [
    { id: 'low', title: '$5 - $20', description: 'Great for small guides or basic content' },
    {
      id: 'medium',
      title: '$20 - $50',
      description: 'Popular for courses or comprehensive guides',
    },
    { id: 'high', title: '$50 - $100', description: 'Premium content or extensive courses' },
    { id: 'custom', title: 'Custom Pricing', description: 'Set your own price based on value' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to PayGate!
          </h2>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
            Let's get you set up to start monetizing your content
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mt-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map(num => (
              <div key={num} className="flex items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    step >= num
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                  }`}
                >
                  {num}
                </div>
                {num < 3 && (
                  <div
                    className={`h-1 w-16 ${
                      step > num ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between px-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Content</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Pricing</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Get Started</span>
          </div>
        </div>

        <div className="mt-8 bg-white shadow sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
          <div className="px-4 py-5 sm:p-6">
            {/* Step 1: Content Type */}
            {step === 1 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  What type of content do you want to sell?
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select the type of content you're most interested in monetizing
                </p>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {contentOptions.map(option => (
                    <div
                      key={option.id}
                      onClick={() => setSelectedContent(option.id)}
                      className={`border rounded-lg p-4 cursor-pointer ${
                        selectedContent === option.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="h-6 w-6 rounded-full border border-gray-300 flex items-center justify-center dark:border-gray-600">
                            {selectedContent === option.id && (
                              <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
                            )}
                          </div>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {option.title}
                          </h4>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Pricing */}
            {step === 2 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  What price range are you considering?
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select a price range that matches your content's value
                </p>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {pricingOptions.map(option => (
                    <div
                      key={option.id}
                      onClick={() => setSelectedPricing(option.id)}
                      className={`border rounded-lg p-4 cursor-pointer ${
                        selectedPricing === option.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="h-6 w-6 rounded-full border border-gray-300 flex items-center justify-center dark:border-gray-600">
                            {selectedPricing === option.id && (
                              <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
                            )}
                          </div>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {option.title}
                          </h4>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Summary */}
            {step === 3 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  You're ready to get started!
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Here's a quick summary of what we'll help you set up
                </p>
                <div className="mt-6 bg-gray-50 rounded-lg p-6 dark:bg-gray-700">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/30">
                        <svg
                          className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Your PayGate Setup
                      </h4>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Based on your selections, we recommend starting with:
                        </p>
                        <ul className="mt-2 space-y-1">
                          <li className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <svg
                              className="h-5 w-5 text-green-500 mr-2 dark:text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {contentOptions.find(opt => opt.id === selectedContent)?.title ||
                              'Digital content'}
                          </li>
                          <li className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <svg
                              className="h-5 w-5 text-green-500 mr-2 dark:text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {pricingOptions.find(opt => opt.id === selectedPricing)?.title ||
                              'Flexible pricing'}
                          </li>
                          <li className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <svg
                              className="h-5 w-5 text-green-500 mr-2 dark:text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Secure payment processing
                          </li>
                          <li className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <svg
                              className="h-5 w-5 text-green-500 mr-2 dark:text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Instant content delivery
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 bg-blue-50 rounded-lg p-4 dark:bg-blue-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Pro Tip
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <p>
                          Start with one piece of content to test the process. You can always add
                          more later!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={step === 1}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm ${
                  step === 1
                    ? 'text-gray-300 bg-gray-100 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600'
                }`}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {step === 3 ? 'Get Started' : 'Next'}
                {step < 3 && (
                  <svg
                    className="ml-2 -mr-1 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Skip onboarding for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserOnboarding;
