import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import notificationService from '../services/notificationService';
import { useToast } from '../contexts';
import FileUpload from './FileUpload';
import ContentSelector from './ContentSelector';
import PaywallPreview from './PaywallPreview';
import ContentPreview from './ContentPreview';
import EmptyState from './EmptyState';
import Modal from './Modal';
import paywallService, { type CreatePaywallData, type Paywall } from '../services/paywallService';
import contentService from '../services/contentService';
import { useAppData } from '../contexts/AppDataContext';
import { useAuth } from '../contexts/AuthContext';
import { CURRENCY_SYMBOLS } from '../utils/constants.utils';
import type { ContentResponse, ContentItem } from '../types/content.types';
import axios, { AxiosError } from 'axios';

// Currency names mapping
const CURRENCY_NAMES: Record<string, string> = {
  NGN: 'Nigerian Naira',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  GHS: 'Ghanaian Cedi',
  ZAR: 'South African Rand',
};

const PaywallCreator: React.FC = () => {
  const navigate = useNavigate();
  const { paywalls, content } = useAppData();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'pricing' | 'design'>('content');
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Content Selection
  const [paywallType, setPaywallType] = useState<'file' | 'content' | 'url'>('file');
  const [files, setFiles] = useState<File[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem[]>([]);
  const [urls, setUrls] = useState<string[]>(['']);

  // Pricing
  const [pricingModel, setPricingModel] = useState<
    'one-time' | 'subscription' | 'pay-what-you-want'
  >('one-time');
  const [price, setPrice] = useState(0);
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [annualPrice, setAnnualPrice] = useState(0);
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [suggestedAmounts] = useState([5, 10, 25]);
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [downloadLimit, setDownloadLimit] = useState<'unlimited' | 'custom'>('unlimited');
  const [downloadLimitValue, setDownloadLimitValue] = useState(5);
  const [accessDuration, setAccessDuration] = useState<'lifetime' | 'custom'>('lifetime');
  const [accessDurationValue, setAccessDurationValue] = useState(30);
  const [customerLimit, setCustomerLimit] = useState<'unlimited' | 'custom'>('unlimited');
  const [customerLimitValue, setCustomerLimitValue] = useState(100);

  // Design & Customization
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState('Get Instant Access');
  const [customButtonText, setCustomButtonText] = useState('');
  const [brandColor, setBrandColor] = useState('#4f46e5');
  const [creatorName, setCreatorName] = useState(user?.name || '');
  const [testimonial, setTestimonial] = useState('');
  const [guarantee, setGuarantee] = useState('30-day refund');
  const [previewStyle, setPreviewStyle] = useState<'blurred' | 'locked' | 'custom'>('blurred');

  // Refs for form elements
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [testMode, setTestMode] = useState<boolean>(true);
  const [publishOption, setPublishOption] = useState<'immediate' | 'scheduled' | 'private'>(
    'immediate'
  );
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [customDomain, setCustomDomain] = useState<string>('');

  // Initialize with smart defaults
  useEffect(() => {
    // Auto-generate title based on content
    if (paywallType === 'file' && files.length > 0) {
      const firstFile = files[0];
      const fileName = firstFile?.name?.replace(/\.[^/.]+$/, '') || ''; // Remove extension
      setTitle(`${fileName}`);
    } else if (paywallType === 'url' && urls.some(url => url.trim() !== '')) {
      const firstUrl = urls.find(url => url.trim() !== '') || '';
      try {
        const urlObj = new URL(firstUrl);
        setTitle(`${urlObj.hostname}`);
      } catch (e) {
        setTitle(`Protected Link`);
      }
    }
  }, [paywallType, files, urls]);

  // Navigation functions
  const goToTab = (tab: 'content' | 'pricing' | 'design') => {
    setActiveTab(tab);
  };

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render step navigation
  const renderStepNavigation = () => {
    const steps = [
      { number: 1, title: 'Content', description: 'Select your content' },
      { number: 2, title: 'Pricing', description: 'Set your pricing model' },
      { number: 3, title: 'Customize', description: 'Customize your paywall' },
      { number: 4, title: 'Preview', description: 'Preview and test' },
      { number: 5, title: 'Publish', description: 'Publish and share' },
    ];

    return (
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center relative w-full">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
                  currentStep >= step.number
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setCurrentStep(step.number)}
              >
                {step.number}
              </div>
              <div className="ml-3 text-left">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= step.number
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-1/2 h-0.5 -translate-y-1/2 ${
                    currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Validation functions
  const validateForm = (): boolean => {
    // Content Selection
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

    // Pricing
    if (pricingModel === 'one-time' && price <= 0) {
      setError('Please enter a valid price');
      return false;
    }
    if (pricingModel === 'subscription' && monthlyPrice <= 0 && annualPrice <= 0) {
      setError('Please enter valid subscription prices');
      return false;
    }
    if (pricingModel === 'pay-what-you-want' && minimumAmount < 0) {
      setError('Please enter a valid minimum amount');
      return false;
    }

    // Design & Customization
    if (!title.trim()) {
      setError('Please enter a title for your paywall');
      return false;
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

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setThumbnail(file);
        const previewUrl = URL.createObjectURL(file);
        setThumbnailPreview(previewUrl);
      } else {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
      }
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
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

    if (!validateForm()) {
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
          if (file) {
            uploadResult = await contentService.uploadFile(file);
          }
          if (!uploadResult || !uploadResult.data) {
            throw new Error('File upload response data is missing.');
          }
        } catch (uploadError: unknown) {
          const err = uploadError as Error;
          console.error('Error uploading file:', err);
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

        let thumbnailUrl;
        if (thumbnail) {
          try {
            const thumbnailResult = await contentService.uploadFile(thumbnail);
            if (!thumbnailResult.data) {
              throw new Error('Thumbnail upload response data is missing.');
            }
          } catch (thumbnailError: unknown) {
            const err = thumbnailError as Error;
            console.error('Error uploading thumbnail:', err);
          }
        }

        paywallData = {
          title,
          description,
          price,
          currency,
          type: 'file',
          url: uploadResult?.data?.url || '',
          thumbnailUrl,
          status: publishOption === 'immediate' ? 'published' : 'draft', // Map publishOption to status
          tags: [], // Assuming no direct UI for tags in this component
          previewEnabled: previewStyle !== 'locked', // Example mapping
          previewSettings: { style: previewStyle }, // Example mapping
          socialShareEnabled: true, // Assuming social sharing is enabled by default
          pricingModel,
        };
      } else if (paywallType === 'content' && selectedContent.length > 0) {
        const contentItem = selectedContent[0]; // Assuming only one content item is selected
        let thumbnailUrl;
        if (thumbnail) {
          try {
            const thumbnailResult = await contentService.uploadFile(thumbnail);
            if (thumbnailResult.data) {
              thumbnailUrl = thumbnailResult.data.url || undefined;
            }
          } catch (thumbnailError) {
            console.error('Error uploading thumbnail:', thumbnailError);
          }
        }

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
          url: contentItem?.url || '',
          thumbnailUrl,
          status: publishOption === 'immediate' ? 'published' : 'draft',
          tags: [],
          previewEnabled: previewStyle !== 'locked',
          previewSettings: { style: previewStyle },
          socialShareEnabled: true,
          pricingModel,
        };
      } else if (paywallType === 'url' && urls.some(url => url.trim() !== '')) {
        const url = urls.find(u => u.trim() !== '') || '';

        let thumbnailUrl;
        if (thumbnail) {
          try {
            const thumbnailResult = await contentService.uploadFile(thumbnail);
            if (thumbnailResult.data) {
              thumbnailUrl = thumbnailResult.data.url || undefined;
            }
          } catch (thumbnailError) {
            console.error('Error uploading thumbnail:', thumbnailError);
          }
        }

        paywallData = {
          title,
          description,
          price,
          currency,
          type: 'url',
          url,
          thumbnailUrl,
          status: publishOption === 'immediate' ? 'published' : 'draft',
          tags: [],
          previewEnabled: previewStyle !== 'locked',
          previewSettings: { style: previewStyle },
          socialShareEnabled: true,
          pricingModel,
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

  // Render tab navigation
  const renderTabNavigation = () => (
    <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => goToTab('content')}
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'content'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Content
        </button>
        <button
          onClick={() => goToTab('pricing')}
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'pricing'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Pricing
        </button>
        <button
          onClick={() => goToTab('design')}
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'design'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Design
        </button>
      </nav>
    </div>
  );

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Content Selection
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Select Content Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setPaywallType('file')}
                  className={`p-6 border rounded-lg text-left transition-all ${
                    paywallType === 'file'
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-400'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/30">
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
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                        Upload Files
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Documents, videos, audio, images
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaywallType('url')}
                  className={`p-6 border rounded-lg text-left transition-all ${
                    paywallType === 'url'
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-400'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/30">
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
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                        Protect a Link
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Google Drive, Dropbox, YouTube, etc.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaywallType('content')}
                  className={`p-6 border rounded-lg text-left transition-all ${
                    paywallType === 'content'
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-400'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/30">
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
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                        Content Library
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Select from your existing content
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* File Upload Section */}
            <div className={`space-y-6 ${paywallType !== 'file' ? 'hidden' : ''}`}>
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
                    onFilesSelect={fileList => {
                      const filesArray = Array.from(fileList);
                      setFiles(prev => [...prev, ...filesArray]);
                    }}
                    multiple={true}
                  />
                </div>
                {files.length === 0 && (
                  <div className="mt-4">
                    <EmptyState
                      title="No files selected"
                      description="Upload files to create your paywall. Supported formats include PDF, MP4, MP3, ZIP, and more."
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
            <div className={`space-y-6 ${paywallType !== 'content' ? 'hidden' : ''}`}>
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  Select from Content Library
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
                            {contentItem.type.toUpperCase()}{' '}
                            {contentItem.size ? `• ${contentItem.size}` : ''}
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
                  <div className="mt-4">
                    <EmptyState
                      title="No content selected"
                      description="Select content from your library to include in this paywall."
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
            <div className={`space-y-6 ${paywallType !== 'url' ? 'hidden' : ''}`}>
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
                        placeholder="https://example.com/resource"
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
                <div className="mt-4 space-y-3">
                  {urls.map((url, index) =>
                    url ? <ContentPreview key={index} file={null} url={url} type="url" /> : null
                  )}
                </div>
                {urls.every(url => !url) && (
                  <div className="mt-4">
                    <EmptyState
                      title="No URLs entered"
                      description="Enter URLs to protect and monetize external resources"
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

      case 2: // Pricing & Access
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Pricing Model
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setPricingModel('one-time')}
                  className={`p-6 border rounded-lg text-left transition-all ${
                    pricingModel === 'one-time'
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-400'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">
                    One-Time Payment
                  </h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Single payment for lifetime access
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPricingModel('subscription')}
                  className={`p-6 border rounded-lg text-left transition-all ${
                    pricingModel === 'subscription'
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-400'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">
                    Subscription
                  </h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Recurring payments for ongoing access
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPricingModel('pay-what-you-want')}
                  className={`p-6 border rounded-lg text-left transition-all ${
                    pricingModel === 'pay-what-you-want'
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-400'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  }`}
                >
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">
                    Pay-What-You-Want
                  </h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Let customers choose their own price
                  </p>
                </button>
              </div>
            </div>

            {/* Pricing options */}
            <div className="space-y-6">
              {pricingModel === 'one-time' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price
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
                        value={price}
                        onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Enter the price for your content in{' '}
                    {CURRENCY_NAMES[currency] || 'Nigerian Naira'}
                  </p>
                </div>
              )}

              {pricingModel === 'subscription' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Monthly Price
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
                          value={monthlyPrice}
                          onChange={e => setMonthlyPrice(parseFloat(e.target.value) || 0)}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Annual Price
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
                          value={annualPrice}
                          onChange={e => setAnnualPrice(parseFloat(e.target.value) || 0)}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {annualPrice > 0 && monthlyPrice > 0 && (
                        <p>
                          Savings: {((1 - annualPrice / 12 / monthlyPrice) * 100).toFixed(0)}% with
                          annual plan
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {pricingModel === 'pay-what-you-want' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Minimum Amount
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
                          value={minimumAmount}
                          onChange={e => setMinimumAmount(parseFloat(e.target.value) || 0)}
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Suggested Amounts
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {suggestedAmounts.map(amount => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setPrice(amount)}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            price === amount
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {CURRENCY_SYMBOLS[currency] || '$'}
                          {amount}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Currency selector */}
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

            {/* Access Settings */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Access Settings</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Download Limits
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="download-unlimited"
                      name="download-limit"
                      checked={downloadLimit === 'unlimited'}
                      onChange={() => setDownloadLimit('unlimited')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="download-unlimited"
                      className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Unlimited downloads
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="download-custom"
                      name="download-limit"
                      checked={downloadLimit === 'custom'}
                      onChange={() => setDownloadLimit('custom')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="download-custom"
                      className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className="flex items-center">
                        Custom limit:
                        <input
                          type="number"
                          min="1"
                          value={downloadLimitValue}
                          onChange={e => setDownloadLimitValue(parseInt(e.target.value) || 1)}
                          disabled={downloadLimit === 'unlimited'}
                          className="ml-2 w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        downloads
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Access Duration
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="duration-lifetime"
                      name="access-duration"
                      checked={accessDuration === 'lifetime'}
                      onChange={() => setAccessDuration('lifetime')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="duration-lifetime"
                      className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Lifetime access
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="duration-custom"
                      name="access-duration"
                      checked={accessDuration === 'custom'}
                      onChange={() => setAccessDuration('custom')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="duration-custom"
                      className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className="flex items-center">
                        Custom duration:
                        <input
                          type="number"
                          min="1"
                          value={accessDurationValue}
                          onChange={e => setAccessDurationValue(parseInt(e.target.value) || 1)}
                          disabled={accessDuration === 'lifetime'}
                          className="ml-2 w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        days
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer Limits
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="customer-unlimited"
                      name="customer-limit"
                      checked={customerLimit === 'unlimited'}
                      onChange={() => setCustomerLimit('unlimited')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="customer-unlimited"
                      className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Unlimited customers
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="customer-custom"
                      name="customer-limit"
                      checked={customerLimit === 'custom'}
                      onChange={() => setCustomerLimit('custom')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="customer-custom"
                      className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className="flex items-center">
                        Limit to
                        <input
                          type="number"
                          min="1"
                          value={customerLimitValue}
                          onChange={e => setCustomerLimitValue(parseInt(e.target.value) || 1)}
                          disabled={customerLimit === 'unlimited'}
                          className="ml-2 w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        customers
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Paywall Customization
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
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
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Give your paywall a clear, descriptive title that will attract buyers
                  </p>
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
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Describe what customers will get when they purchase this content..."
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Explain the value and benefits of your content to potential buyers
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Thumbnail Image (Optional)
                  </label>
                  <div className="mt-1 flex items-center">
                    {thumbnailPreview ? (
                      <div className="flex items-center">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="h-16 w-16 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={removeThumbnail}
                          className="ml-2 text-sm text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <label
                          htmlFor="thumbnail-input"
                          className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                        >
                          Upload Thumbnail
                        </label>
                        <input
                          ref={thumbnailInputRef}
                          id="thumbnail-input"
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Upload an image to represent your paywall (JPEG, PNG, GIF, etc.)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Button Text
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="button-default"
                        name="button-text"
                        checked={buttonText === 'Get Instant Access'}
                        onChange={() => setButtonText('Get Instant Access')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="button-default"
                        className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Get Instant Access (default)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="button-buy"
                        name="button-text"
                        checked={buttonText === 'Buy Now'}
                        onChange={() => setButtonText('Buy Now')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="button-buy"
                        className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Buy Now
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="button-custom"
                        name="button-text"
                        checked={buttonText === 'custom'}
                        onChange={() => setButtonText('custom')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="button-custom"
                        className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="flex items-center">
                          Custom:
                          <input
                            type="text"
                            value={buttonText === 'custom' ? customButtonText : ''}
                            onChange={e => setCustomButtonText(e.target.value)}
                            disabled={buttonText !== 'custom'}
                            className="ml-2 flex-1 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                            placeholder="Enter custom text"
                          />
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Brand Color
                  </label>
                  <div className="mt-2 flex items-center">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={e => setBrandColor(e.target.value)}
                      className="h-10 w-10 border border-gray-300 rounded-md cursor-pointer dark:border-gray-600"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      {brandColor}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Preview Style
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="preview-blurred"
                        name="preview-style"
                        checked={previewStyle === 'blurred'}
                        onChange={() => setPreviewStyle('blurred')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="preview-blurred"
                        className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Blurred preview
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="preview-locked"
                        name="preview-style"
                        checked={previewStyle === 'locked'}
                        onChange={() => setPreviewStyle('locked')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="preview-locked"
                        className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Locked icon
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="preview-custom"
                        name="preview-style"
                        checked={previewStyle === 'custom'}
                        onChange={() => setPreviewStyle('custom')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="preview-custom"
                        className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Custom overlay
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Trust Signals
                </h3>

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="creator-name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Creator Name
                    </label>
                    <input
                      type="text"
                      id="creator-name"
                      value={creatorName}
                      onChange={e => setCreatorName(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="testimonial"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Testimonial (Optional)
                    </label>
                    <textarea
                      id="testimonial"
                      rows={3}
                      value={testimonial}
                      onChange={e => setTestimonial(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="Add a customer testimonial..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Guarantee
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="guarantee-30"
                          name="guarantee"
                          checked={guarantee === '30-day refund'}
                          onChange={() => setGuarantee('30-day refund')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor="guarantee-30"
                          className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                        >
                          30-day refund
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="guarantee-satisfaction"
                          name="guarantee"
                          checked={guarantee === 'Satisfaction guarantee'}
                          onChange={() => setGuarantee('Satisfaction guarantee')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor="guarantee-satisfaction"
                          className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                        >
                          Satisfaction guarantee
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="guarantee-custom"
                          name="guarantee"
                          checked={!['30-day refund', 'Satisfaction guarantee'].includes(guarantee)}
                          onChange={() => setGuarantee('Custom guarantee')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor="guarantee-custom"
                          className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span className="flex items-center">
                            Custom:
                            <input
                              type="text"
                              value={
                                guarantee === '30-day refund' ||
                                guarantee === 'Satisfaction guarantee'
                                  ? ''
                                  : guarantee
                              }
                              onChange={e => setGuarantee(e.target.value)}
                              className="ml-2 flex-1 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="Enter custom guarantee"
                            />
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Preview & Test
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Live Preview
                </h3>
                <div className="bg-gray-50 rounded-lg p-6 dark:bg-gray-800">
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
                    thumbnailPreview={thumbnailPreview}
                  />
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                    Mobile Preview
                  </h4>
                  <div
                    className="bg-gray-50 rounded-lg p-4 dark:bg-gray-800"
                    style={{ maxWidth: '375px' }}
                  >
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
                      thumbnailPreview={thumbnailPreview}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Test Purchase
                </h3>
                <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">Test Mode</h4>
                    <button
                      type="button"
                      onClick={() => setTestMode(!testMode)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        testMode ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                      role="switch"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          testMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {testMode
                      ? 'Test mode is enabled. Transactions will be simulated without charging real money.'
                      : 'Enable test mode to simulate transactions without charging real money.'}
                  </p>

                  <button
                    type="button"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    Test Purchase Flow
                  </button>

                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                      Embed Preview
                    </h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 dark:border-gray-600">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Embedded paywall preview
                        </p>
                        <div className="mt-2 bg-white rounded-md shadow p-4 dark:bg-gray-700">
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
                            thumbnailPreview={thumbnailPreview}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Publish & Share
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Publishing Options
                </h3>
                <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Launch Settings
                      </label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="publish-immediate"
                            name="publish-option"
                            checked={publishOption === 'immediate'}
                            onChange={() => setPublishOption('immediate')}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label
                            htmlFor="publish-immediate"
                            className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                          >
                            Go Live Immediately
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="publish-scheduled"
                            name="publish-option"
                            checked={publishOption === 'scheduled'}
                            onChange={() => setPublishOption('scheduled')}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label
                            htmlFor="publish-scheduled"
                            className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                          >
                            <span className="flex items-center">
                              Schedule Launch:
                              <input
                                type="datetime-local"
                                value={scheduleDate}
                                onChange={e => setScheduleDate(e.target.value)}
                                disabled={publishOption !== 'scheduled'}
                                className="ml-2 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </span>
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="publish-private"
                            name="publish-option"
                            checked={publishOption === 'private'}
                            onChange={() => setPublishOption('private')}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label
                            htmlFor="publish-private"
                            className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                          >
                            Private Mode (Only visible with direct link)
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="paywall-url"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Paywall URL
                      </label>
                      <div className="mt-1 flex">
                        <input
                          type="text"
                          id="paywall-url"
                          value={`paygate.co/${user?.username || 'creator'}/your-paywall`}
                          readOnly
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `paygate.co/${user?.username || 'creator'}/your-paywall`
                            );
                            alert('URL copied to clipboard!');
                          }}
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md shadow-sm text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-500"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="custom-domain"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Custom Domain (Pro plan)
                      </label>
                      <input
                        type="text"
                        id="custom-domain"
                        value={customDomain}
                        onChange={e => setCustomDomain(e.target.value)}
                        placeholder="yoursite.com/exclusive-content"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="embed-code"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Embed Code
                      </label>
                      <div className="mt-1 relative">
                        <textarea
                          id="embed-code"
                          readOnly
                          value={`<iframe src="paygate.co/${user?.username || 'creator'}/your-paywall" width="100%" height="500" frameborder="0"></iframe>`}
                          className="block w-full h-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `<iframe src="paygate.co/${user?.username || 'creator'}/your-paywall" width="100%" height="500" frameborder="0"></iframe>`
                            );
                            alert('Embed code copied to clipboard!');
                          }}
                          className="absolute top-2 right-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:text-indigo-300 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    Sharing Tools
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Direct Link
                      </label>
                      <div className="mt-1 flex">
                        <input
                          type="text"
                          value={`paygate.co/${user?.username || 'creator'}/your-paywall`}
                          readOnly
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `paygate.co/${user?.username || 'creator'}/your-paywall`
                            );
                            alert('Link copied to clipboard!');
                          }}
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md shadow-sm text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-500"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Social Media
                      </label>
                      <div className="mt-2 flex space-x-3">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                        >
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                          </svg>
                          Twitter
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                        >
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                          LinkedIn
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                        >
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          Instagram
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Template
                      </label>
                      <div className="mt-2">
                        <textarea
                          readOnly
                          value={`Subject: New Exclusive Content Available!

Hi [Name],

I'm excited to share my latest content with you. Get instant access to "${title || 'Your Paywall Title'}" for just ${CURRENCY_SYMBOLS[currency] || '$'}${price.toFixed(2)}.

[Call to action button: Get Instant Access]

Best regards,
${creatorName || 'Your Name'}`}
                          className="block w-full h-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`Subject: New Exclusive Content Available!

Hi [Name],

I'm excited to share my latest content with you. Get instant access to "${title || 'Your Paywall Title'}" for just ${CURRENCY_SYMBOLS[currency] || '$'}${price.toFixed(2)}.

[Call to action button: Get Instant Access]

Best regards,
${creatorName || 'Your Name'}`);
                            alert('Email template copied to clipboard!');
                          }}
                          className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                        >
                          Copy Template
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preview</h3>
                <div className="bg-gray-50 rounded-lg p-6 dark:bg-gray-800">
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
                    thumbnailPreview={thumbnailPreview}
                  />
                </div>

                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                    Embed Instructions
                  </h4>
                  <div className="bg-white shadow rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      To embed this paywall in your website or Notion page, copy the embed code
                      above and paste it into your HTML editor or Notion page.
                    </p>
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        For Notion:
                      </h5>
                      <ol className="mt-1 text-sm text-gray-500 list-decimal list-inside dark:text-gray-400">
                        <li>Create a new page or open an existing one</li>
                        <li>Type "/embed" and press Enter</li>
                        <li>Paste the embed code URL</li>
                        <li>Click "Embed" to insert the paywall</li>
                      </ol>
                    </div>
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        For Websites:
                      </h5>
                      <ol className="mt-1 text-sm text-gray-500 list-decimal list-inside dark:text-gray-400">
                        <li>Open your website's HTML editor</li>
                        <li>Copy and paste the embed code where you want the paywall to appear</li>
                        <li>Save and publish your changes</li>
                      </ol>
                    </div>
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

  // Render tab actions
  const renderTabActions = () => (
    <div className="mt-8 flex justify-between">
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

      {currentStep < 5 ? (
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
            'Create Paywall'
          )}
        </button>
      )}
    </div>
  );

  const headerActions = (
    <div className="flex space-x-3">
      <Link to="/content">
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Content Library
        </button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Create Paywall"
        subtitle="Protect and monetize your digital content"
        actions={headerActions}
      />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
              <div className="px-4 py-5 sm:p-6">
                {renderStepNavigation()}

                <form onSubmit={handleSubmit}>
                  {renderStepContent()}

                  {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
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
                          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                            <p>{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {renderTabActions()}
                </form>
              </div>
            </div>

            {/* Tips section */}
            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-800">
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
                    Pro Tips for Creating Great Paywalls
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Use clear, benefit-focused titles that tell customers what they'll get
                      </li>
                      <li>Write detailed descriptions that explain the value and content</li>
                      <li>
                        Price based on the value you provide, not just the time it took to create
                      </li>
                      <li>Consider offering a preview or sample to build trust</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaywallCreator;
