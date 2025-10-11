import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import notificationService from '../services/notificationService';
import { useToast, useAppData, useAuth } from '../contexts';
import FileUpload from './FileUpload';
import ContentSelector from './ContentSelector';
import PaywallPreview from './PaywallPreview';
import ContentPreview from './ContentPreview';
import EmptyState from './EmptyState';
import Modal from './Modal';
import paywallService, { type CreatePaywallData, type Paywall } from '../services/paywallService';
import contentService from '../services/contentService';
import type { ContentResponse, ContentItem } from '../types/content.types';
import axios, { type AxiosError } from 'axios';
import { CURRENCY_SYMBOLS } from '../utils/constants.utils';

const MobilePaywallCreator: React.FC = () => {
  const navigate = useNavigate();
  const { paywalls, content } = useAppData();
  const { user } = useAuth();
  const { showToast } = useToast();

  // State for mobile flow
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Content Selection
  const [paywallType, setPaywallType] = useState<'file' | 'content' | 'url'>('file');
  const [files, setFiles] = useState<File[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem[]>([]);
  const [urls, setUrls] = useState<string[]>(['']);

  // Step 2: Quick Pricing
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState(user?.currency || 'USD');

  // Step 3: Publish
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Quick price suggestions based on content type
  const getSuggestedPrices = () => {
    const basePrices = [5, 10, 15, 20, 25, 30, 40, 50];
    return basePrices.map(amount => ({
      amount,
      label: `${CURRENCY_SYMBOLS[currency] || '$'}${amount}`,
    }));
  };

  // Navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Validation functions
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Content Selection
        if (paywallType === 'file' && files.length === 0) {
          setError('Please upload at least one file');
          return false;
        }
        if (paywallType === 'content' && selectedContent.length === 0) {
          setError('Please select at least one item from your content library');
          return false;
        }
        if (paywallType === 'url' && !urls.some(url => url.trim() !== '')) {
          setError('Please enter at least one URL');
          return false;
        }
        break;
      case 2: // Quick Pricing
        if (price <= 0) {
          setError('Please select or enter a price');
          return false;
        }
        break;
      case 3: // Publish
        if (!title.trim()) {
          setError('Please enter a title for your paywall');
          return false;
        }
        break;
    }

    setError(null);
    return true;
  };

  // File handling functions
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeSelectedContent = (index: number) => {
    setSelectedContent(prev => prev.filter((_, i) => i !== index));
  };

  // URL handling functions
  const addUrlField = () => {
    setUrls(prev => [...prev, '']);
  };

  const updateUrl = (index: number, value: string) => {
    setUrls(prev => {
      const newUrls = [...prev];
      newUrls[index] = value;
      return newUrls;
    });
  };

  const removeUrlField = (index: number) => {
    if (urls.length > 1) {
      setUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Handle paywall creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      // Create the paywall data based on the selected type
      let paywallData: CreatePaywallData;

      if (paywallType === 'file' && files.length > 0) {
        const file = files[0];
        let uploadResult: import('../services/contentService').FileUploadResponse;
        try {
          uploadResult = await contentService.uploadFile(file);
          if (!uploadResult.data) {
            throw new Error('File upload response data is missing.');
          }
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          setError(
            'File upload failed. The paywall will use a local file reference which may not be accessible to others. For a production paywall, please ensure the backend is working.'
          );
          uploadResult = {
            success: false,
            message: 'File upload failed',
            data: {
              url: file ? URL.createObjectURL(file) : '',
              size: file?.size || 0,
              originalName: file?.name || '',
              mimeType: file?.type || '',
            },
          };
        }

        paywallData = {
          title,
          description,
          price,
          currency,
          type: 'file',
          pricingModel: 'one-time',
        };
      } else if (paywallType === 'content' && selectedContent.length > 0) {
        const contentItem = selectedContent[0];

        paywallData = {
          title,
          description,
          price,
          currency,
          type: (contentItem?.type || 'file') as
            | 'file'
            | 'url'
            | 'content'
            | 'content_package'
            | 'document'
            | 'video'
            | 'image'
            | 'paywall',
          contentId: contentItem?.id || '',
          pricingModel: 'one-time',
        };
      } else if (paywallType === 'url' && urls.some(url => url.trim() !== '')) {
        const url = urls.find(u => u.trim() !== '') || '';

        paywallData = {
          title,
          description,
          price,
          currency,
          type: 'url',
          url,
          pricingModel: 'one-time',
        };
      } else {
        throw new Error('Please select content for your paywall');
      }

      // Create the paywall
      const result = await paywallService.createPaywall(paywallData);

      // Show success notification
      notificationService.addNotification({
        title: 'Paywall Created',
        message: 'Your new paywall has been successfully created.',
        type: 'success',
      });

      // Show success toast
      showToast({
        title: 'Paywall Created!',
        message: 'Your new paywall has been successfully created.',
        type: 'success',
      });

      // Navigate to success page with paywall data
      navigate('/paywall-success', { state: { paywall: result } as { paywall: Paywall } });
    } catch (err: unknown) {
      console.error('Error creating paywall:', err);

      let errorMessage = 'Failed to create paywall. ';

      // Check if it's an API error with response data
      if (axios.isAxiosError(err) && err.response) {
        const { status, data } = err.response;
        if (status === 500) {
          // For 500 errors, try to get the specific error message from the server
          errorMessage +=
            data?.error ||
            data?.message ||
            'The server encountered an error. Please try again later.';
        } else if (status === 400) {
          errorMessage +=
            data?.message || data?.error || 'Invalid data provided. Please check your inputs.';
        } else if (status === 401) {
          errorMessage +=
            data?.message ||
            data?.error ||
            'You are not authorized to create a paywall. Please log in.';
        } else if (status === 403) {
          errorMessage +=
            data?.message || data?.error || 'You do not have permission to create a paywall.';
        } else if (status === 429) {
          errorMessage +=
            data?.message ||
            data?.error ||
            'Too many requests. Please wait a moment before trying again.';
        } else {
          errorMessage += data?.message || data?.error || `Server responded with status ${status}.`;
        }
      } else if (axios.isAxiosError(err) && err.request) {
        // Request was made but no response received
        errorMessage += 'Unable to connect to the server. Please check your internet connection.';
      } else if (err instanceof Error) {
        // Something else happened
        errorMessage += err.message || 'An unexpected error occurred.';
      } else {
        errorMessage += 'An unexpected error occurred.';
      }

      setError(errorMessage);

      // Show error notification
      notificationService.addNotification({
        title: 'Error Creating Paywall',
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Render step navigation for mobile
  const renderStepNavigation = () => (
    <div className="mb-6">
      <div className="flex items-center justify-center">
        {[1, 2, 3].map(step => (
          <React.Fragment key={step}>
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full ${
                step === currentStep
                  ? 'bg-indigo-600 text-white'
                  : step < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {step}
            </div>
            {step < 3 && <div className="h-0.5 w-8 bg-gray-200 dark:bg-gray-700"></div>}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Step {currentStep} of 3</p>
      </div>
    </div>
  );

  // Render current step content for mobile
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Content Selection
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Select Content
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaywallType('file')}
                  className={`p-4 border rounded-lg text-center transition-all ${
                    paywallType === 'file'
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-400'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex flex-col items-center">
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="mt-2 text-xs text-gray-900 dark:text-white">Upload</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaywallType('url')}
                  className={`p-4 border rounded-lg text-center transition-all ${
                    paywallType === 'url'
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-400'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex flex-col items-center">
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
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <span className="mt-2 text-xs text-gray-900 dark:text-white">Link</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaywallType('content')}
                  className={`p-4 border rounded-lg text-center transition-all ${
                    paywallType === 'content'
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-400'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex flex-col items-center">
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <span className="mt-2 text-xs text-gray-900 dark:text-white">Library</span>
                  </div>
                </button>
              </div>
            </div>

            {/* File Upload Section */}
            <div className={`space-y-4 ${paywallType !== 'file' ? 'hidden' : ''}`}>
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  Upload Files
                </h4>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md dark:bg-gray-700"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <svg
                          className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <FileUpload
                    onFileSelect={file => {
                      setFiles(prev => [...prev, file]);
                    }}
                    multiple={true}
                  />
                </div>
                {files.length === 0 && (
                  <div className="mt-2">
                    <EmptyState
                      title="No files"
                      description="Tap to upload"
                      icon={
                        <svg
                          className="h-6 w-6 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Content Library Section */}
            <div className={`space-y-4 ${paywallType !== 'content' ? 'hidden' : ''}`}>
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  Content Library
                </h4>
                <div className="space-y-3">
                  {selectedContent.map((contentItem, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md dark:bg-gray-700"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <svg
                          className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                            {contentItem.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {contentItem.type.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelectedContent(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <ContentSelector
                    selectedContent={selectedContent}
                    onContentSelect={setSelectedContent}
                  />
                </div>
                {selectedContent.length === 0 && (
                  <div className="mt-2">
                    <EmptyState
                      title="No content"
                      description="Select from library"
                      icon={
                        <svg
                          className="h-6 w-6 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            {/* URL Section */}
            <div className={`space-y-4 ${paywallType !== 'url' ? 'hidden' : ''}`}>
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Add URLs</h4>
                <div className="space-y-3">
                  {urls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={url}
                        onChange={e => updateUrl(index, e.target.value)}
                        className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        placeholder="https://example.com"
                      />
                      {urls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUrlField(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addUrlField}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  >
                    <svg
                      className="-ml-0.5 mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add URL
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {urls.map((url, index) =>
                    url ? <ContentPreview key={index} file={null} url={url} type="url" /> : null
                  )}
                </div>
                {urls.every(url => !url) && (
                  <div className="mt-2">
                    <EmptyState
                      title="No URLs"
                      description="Enter links to protect"
                      icon={
                        <svg
                          className="h-6 w-6 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 2: // Quick Pricing
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Set Price</h3>
              <div className="grid grid-cols-4 gap-3">
                {getSuggestedPrices().map(suggestion => (
                  <button
                    key={suggestion.amount}
                    type="button"
                    onClick={() => setPrice(suggestion.amount)}
                    className={`p-3 border rounded-lg text-center transition-all ${
                      price === suggestion.amount
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-400'
                        : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {suggestion.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom Price
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                    {CURRENCY_SYMBOLS[currency] || '$'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price || ''}
                    onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Currency
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="NGN">Nigerian Naira (₦)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="GHS">Ghanaian Cedi (GH₵)</option>
                <option value="ZAR">South African Rand (R)</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
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
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Pro Tip</h3>
                  <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      Start with a lower price to build initial sales, then increase as you gain
                      traction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Publish
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Publish Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="E-book: Mastering React Hooks"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Describe what customers will get..."
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Preview</h4>
              <div className="bg-gray-50 rounded-lg p-4 dark:bg-gray-800">
                <PaywallPreview
                  title={title || 'Your Paywall Title'}
                  description={description || 'Your paywall description will appear here'}
                  price={price}
                  currency={currency}
                  fileCount={
                    paywallType === 'file'
                      ? files.length
                      : paywallType === 'content'
                        ? selectedContent.length
                        : 0
                  }
                  urlCount={paywallType === 'url' ? urls.filter(url => url).length : 0}
                />
              </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
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
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    Ready to Go Live
                  </h3>
                  <div className="mt-1 text-sm text-green-700 dark:text-green-300">
                    <p>Your paywall will be published immediately after creation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render step actions for mobile
  const renderStepActions = () => (
    <div className="mt-6 flex justify-between">
      <button
        type="button"
        onClick={prevStep}
        disabled={currentStep === 1}
        className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
        } dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600`}
      >
        <svg
          className="-ml-1 mr-2 h-5 w-5 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back
      </button>

      {currentStep < 3 ? (
        <button
          type="button"
          onClick={nextStep}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Next
          <svg
            className="ml-2 -mr-1 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isCreating}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isCreating
              ? 'bg-indigo-400 cursor-not-allowed dark:bg-indigo-600'
              : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
          }`}
        >
          {isCreating ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </>
          ) : (
            'Publish Paywall'
          )}
        </button>
      )}
    </div>
  );

  const headerActions = (
    <div className="flex space-x-3">
      <Link to="/content">
        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
          <svg className="-ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Library
        </button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Create Paywall" subtitle="Quick mobile setup" actions={headerActions} />
      <main>
        <div className="max-w-md mx-auto py-6 px-4">
          <div className="bg-white shadow sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
            <div className="px-4 py-5 sm:p-6">
              {renderStepNavigation()}

              <form onSubmit={handleSubmit}>
                {renderStepContent()}

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Error
                        </h3>
                        <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {renderStepActions()}
              </form>
            </div>
          </div>

          {/* Tips section */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
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
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Quick Tips</h3>
                <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use clear, benefit-focused titles</li>
                    <li>Price based on the value you provide</li>
                    <li>Consider offering a preview or sample</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MobilePaywallCreator;
