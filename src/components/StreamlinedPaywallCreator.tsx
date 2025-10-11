import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import notificationService from '../services/notificationService';
import { useToast } from '../contexts';
import FileUpload from './FileUpload';
import ContentSelector from './ContentSelector';
import PaywallPreview from './PaywallPreview';
import EmptyState from './EmptyState';
import paywallService, { type CreatePaywallData } from '../services/paywallService';
import contentService, { type ContentItem } from '../services/contentService';
import { useAppData } from '../contexts/AppDataContext';
import { useAuth } from '../contexts/AuthContext';
import { CURRENCY_SYMBOLS } from '../utils/constants.utils';
import type { ContentResponse } from '../types/content.types';

// Currency names mapping
const CURRENCY_NAMES: Record<string, string> = {
  NGN: 'Nigerian Naira',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  GHS: 'Ghanaian Cedi',
  ZAR: 'South African Rand',
};

// Content type mapping for smart defaults
const CONTENT_TYPE_TITLES: Record<string, string> = {
  ebook: 'E-book: ',
  course: 'Course: ',
  template: 'Template Pack: ',
  video: 'Video: ',
  audio: 'Audio: ',
  general: 'Digital Content: ',
};

const StreamlinedPaywallCreator: React.FC = () => {
  const navigate = useNavigate();

  const { user } = useAuth();
  const { showToast } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Content Selection
  const [paywallType, setPaywallType] = useState<'file' | 'content' | 'url'>('file');
  const [files, setFiles] = useState<File[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem[]>([]);
  const [urls, setUrls] = useState<string[]>(['']);

  // Pricing & Access
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

  // Paywall Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState('Get Instant Access');
  const [customButtonText, setCustomButtonText] = useState('');
  const [brandColor, setBrandColor] = useState('#4f46e5');
  const [previewStyle] = useState<'blurred' | 'locked' | 'custom'>('blurred');
  const [creatorName, setCreatorName] = useState(user?.name || '');
  const [creatorPhoto] = useState<string | null>(user?.avatar || null);
  const [testimonial, setTestimonial] = useState('');
  const [guarantee, setGuarantee] = useState('30-day refund');

  // Smart defaults
  const [contentType, setContentType] = useState('general');

  // Refs for form elements
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Initialize with smart defaults
  useEffect(() => {
    // Auto-generate title based on content
    if (paywallType === 'file' && files.length > 0) {
      const firstFile = files[0];
      const fileName = firstFile.name.replace(/\.[^/.]+$/, ''); // Remove extension
      setTitle(`${CONTENT_TYPE_TITLES[contentType] || ''}${fileName}`);
    } else if (paywallType === 'url' && urls.some(url => url.trim() !== '')) {
      const firstUrl = urls.find(url => url.trim() !== '') || '';
      try {
        const urlObj = new URL(firstUrl);
        setTitle(`${CONTENT_TYPE_TITLES[contentType] || ''}${urlObj.hostname}`);
      } catch (e) {
        setTitle(`${CONTENT_TYPE_TITLES[contentType] || ''}Protected Link`);
      }
    }
  }, [paywallType, files, urls, contentType]);

  // Determine content type for smart defaults
  useEffect(() => {
    if (title.toLowerCase().includes('ebook') || title.toLowerCase().includes('book')) {
      setContentType('ebook');
    } else if (title.toLowerCase().includes('course') || title.toLowerCase().includes('class')) {
      setContentType('course');
    } else if (title.toLowerCase().includes('template') || title.toLowerCase().includes('pack')) {
      setContentType('template');
    } else if (title.toLowerCase().includes('video')) {
      setContentType('video');
    } else if (title.toLowerCase().includes('audio') || title.toLowerCase().includes('podcast')) {
      setContentType('audio');
    } else {
      setContentType('general');
    }
  }, [title]);

  // Set default prices based on content type
  useEffect(() => {
    const defaultPrices: Record<string, number> = {
      ebook: 29.99,
      course: 99.99,
      template: 49.99,
      video: 19.99,
      audio: 14.99,
      general: 24.99,
    };

    setPrice(defaultPrices[contentType]);
    setMonthlyPrice(defaultPrices[contentType] / 3);
    setAnnualPrice(defaultPrices[contentType] * 10);
    setMinimumAmount(defaultPrices[contentType] / 5);
  }, [contentType]);

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

  const validateForm = (): boolean => {
    // Validate content selection
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

    // Validate pricing
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

    // Validate title
    if (!title.trim()) {
      setError('Please enter a title for your paywall');
      return false;
    }

    setError(null);
    return true;
  };

  const [publishOption, setPublishOption] = useState<'draft' | 'published'>('draft');

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
      let contentTypeForPaywall: 'file' | 'url' | 'content' | 'content_package' = 'file';
      let contentUrl: string | undefined;
      let contentId: string | undefined;
      let thumbnailUrl: string | undefined;

      // Determine content type and URL/ID based on paywall type
      if (paywallType === 'file' && files.length > 0) {
        contentTypeForPaywall = 'file';
        // Files would be uploaded and URLs returned - assuming they are in state
      } else if (paywallType === 'content' && selectedContent.length > 0) {
        contentTypeForPaywall = 'content';
        contentId = selectedContent[0].id; // Use first selected content
      } else if (paywallType === 'url' && urls.length > 0 && urls[0].trim() !== '') {
        contentTypeForPaywall = 'url';
        contentUrl = urls[0]; // Use first URL
      }

      // Upload thumbnail if exists
      if (thumbnail) {
        const thumbnailUpload = await contentService.uploadFile(thumbnail);
        if (thumbnailUpload.success && thumbnailUpload.data) {
          const uploadData = thumbnailUpload.data;
          if (
            uploadData &&
            typeof uploadData === 'object' &&
            'url' in uploadData &&
            uploadData.url &&
            typeof uploadData.url === 'string'
          ) {
            thumbnailUrl = uploadData.url;
          }
        }
      }

      // Define pricing details based on pricing model
      let pricingDetails: Partial<CreatePaywallData> = {};
      if (pricingModel === 'one-time') {
        pricingDetails = { price };
      } else if (pricingModel === 'subscription') {
        pricingDetails = { monthlyPrice, annualPrice };
      } else if (pricingModel === 'pay-what-you-want') {
        pricingDetails = { minimumAmount };
      }

      const paywallData: CreatePaywallData = {
        title,
        description,
        currency,
        type: contentTypeForPaywall,
        url: contentUrl,
        contentId,
        thumbnailUrl,
        pricingModel,
        ...pricingDetails,
        downloadLimit: downloadLimit === 'custom' ? downloadLimitValue : undefined,
        accessDuration: accessDuration === 'custom' ? accessDurationValue : undefined,
        customerLimit: customerLimit === 'custom' ? customerLimitValue : undefined,
        buttonText: buttonText === 'custom' ? customButtonText : buttonText,
        brandColor,
        previewEnabled: previewStyle !== 'locked',
        previewSettings: { style: previewStyle },
        creatorName,
        creatorPhoto: creatorPhoto || undefined,
        testimonial,
        guarantee,
        status: publishOption,
        tags: [], // Assuming no direct UI for tags in this component
        socialShareEnabled: true, // Assuming social sharing is enabled by default
      };

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
      navigate('/paywall-success', { state: { paywall: result } });
    } catch (err: unknown) {
      console.error('Error creating paywall:', err);

      let errorMessage = 'Failed to create paywall. ';

      if (axios.isAxiosError(err)) {
        if (err.response) {
          const { status, data } = err.response;
          if (status === 500) {
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
            errorMessage +=
              data?.message || data?.error || `Server responded with status ${status}.`;
          }
        } else if (err.request) {
          errorMessage += 'Unable to connect to the server. Please check your internet connection.';
        } else {
          errorMessage += err.message || 'An unexpected error occurred.';
        }
      } else if (err instanceof Error) {
        errorMessage += err.message || 'An unexpected error occurred.';
      } else {
        errorMessage += 'An unknown error occurred.';
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
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Content Selection Section */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        1. Content Selection
                      </h2>
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
                            onContentSelect={(content: ContentItem[]) =>
                              setSelectedContent(content)
                            }
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
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                          Add URLs
                        </h4>
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
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Access Section */}
                  <div className="space-y-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      2. Pricing & Access
                    </h2>

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
                                  Savings:{' '}
                                  {((1 - annualPrice / 12 / monthlyPrice) * 100).toFixed(0)}% with
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
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">
                        Access Settings
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Download Limits
                          </label>
                          <div className="space-y-2">
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
                                Unlimited
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
                                  Custom:
                                  <input
                                    type="number"
                                    min="1"
                                    value={downloadLimitValue}
                                    onChange={e =>
                                      setDownloadLimitValue(parseInt(e.target.value) || 1)
                                    }
                                    disabled={downloadLimit === 'unlimited'}
                                    className="ml-2 w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  />
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Access Duration
                          </label>
                          <div className="space-y-2">
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
                                Lifetime
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
                                  Custom:
                                  <input
                                    type="number"
                                    min="1"
                                    value={accessDurationValue}
                                    onChange={e =>
                                      setAccessDurationValue(parseInt(e.target.value) || 1)
                                    }
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
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Customer Limits
                          </label>
                          <div className="space-y-2">
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
                                Unlimited
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
                                  Limit:
                                  <input
                                    type="number"
                                    min="1"
                                    value={customerLimitValue}
                                    onChange={e =>
                                      setCustomerLimitValue(parseInt(e.target.value) || 1)
                                    }
                                    disabled={customerLimit === 'unlimited'}
                                    className="ml-2 w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  />
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Paywall Details */}
                  <div className="space-y-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      3. Paywall Details
                    </h2>

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
                            Call-to-Action Button
                          </label>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="button-default"
                                name="button-text"
                                checked={buttonText !== 'custom'}
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
                                    value={customButtonText}
                                    onChange={e => setCustomButtonText(e.target.value)}
                                    className="ml-2 flex-1 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                      </div>

                      <div>
                        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                          Preview
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
                            Trust Signals
                          </h4>

                          <div className="space-y-4">
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
                                    checked={
                                      !['30-day refund', 'Satisfaction guarantee'].includes(
                                        guarantee
                                      )
                                    }
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
                  </div>

                  {/* Publish Settings */}
                  <div className="space-y-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      4. Publish Settings
                    </h2>
                    <div className="flex items-center">
                      <input
                        id="publish-draft"
                        name="publish-option"
                        type="radio"
                        checked={publishOption === 'draft'}
                        onChange={() => setPublishOption('draft')}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label
                        htmlFor="publish-draft"
                        className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Save as Draft
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="publish-immediate"
                        name="publish-option"
                        type="radio"
                        checked={publishOption === 'published'}
                        onChange={() => setPublishOption('published')}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label
                        htmlFor="publish-immediate"
                        className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Publish Immediately
                      </label>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
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

                  {/* Submit Button */}
                  <div className="flex justify-end pt-6">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        isCreating
                          ? 'bg-indigo-400 cursor-not-allowed dark:bg-indigo-600'
                          : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                      }`}
                    >
                      {isCreating ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                          Creating Paywall...
                        </>
                      ) : (
                        'Create Paywall'
                      )}
                    </button>
                  </div>
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

export default StreamlinedPaywallCreator;
