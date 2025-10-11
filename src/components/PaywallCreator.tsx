import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import notificationService from '../services/notificationService';
import { useToast } from '../contexts';
import FileUpload from './FileUpload';
import ContentSelector from './ContentSelector';
import EnhancedPricingSelector from './EnhancedPricingSelector';
import PaywallPreview from './PaywallPreview';
import ContentPreview from './ContentPreview';
import EmptyState from './EmptyState';
import Modal from './Modal';
import paywallService, { type CreatePaywallData } from '../services/paywallService';
import contentService from '../services/contentService';
import { useAppData } from '../contexts/AppDataContext';
import { useAuth } from '../contexts/AuthContext';
import type { ContentItem } from '../types/content.types';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

const PaywallCreator: React.FC = () => {
  const navigate = useNavigate();
  const { content, paywalls } = useAppData();
  const { user } = useAuth();
  const { showToast } = useToast(); // Get showToast from context
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0); // Changed from 29.99 to 0
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem[]>([]); // For content library items
  const [urls, setUrls] = useState<string[]>(['']);
  const [paywallType, setPaywallType] = useState<'file' | 'content' | 'url'>('file');
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeSelectedContent = (index: number) => {
    setSelectedContent(prev => prev.filter((_, i) => i !== index));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if file is an image
      if (file.type.startsWith('image/')) {
        setThumbnail(file);
        // Create preview URL
        const previewUrl = file ? URL.createObjectURL(file) : '';
        setThumbnailPreview(previewUrl);
      } else {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
      }
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    // Clear the file input
    const fileInput = document.getElementById('thumbnail-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!title) {
      setError('Please enter a title for your paywall');
      return;
    }

    if (paywallType === 'file' && files.length === 0) {
      setError('Please upload at least one file');
      return;
    }

    if (paywallType === 'content' && selectedContent.length === 0) {
      setError('Please select at least one item from your content library');
      return;
    }

    if (paywallType === 'url' && !urls.some(url => url.trim() !== '')) {
      setError('Please enter at least one URL');
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      // Create the paywall data based on the selected type
      let paywallData: CreatePaywallData;

      if (paywallType === 'file' && files.length > 0) {
        // For file uploads, we need to upload the first file and create a paywall for it
        // In a real implementation, we might want to handle multiple files differently
        const file = files[0];
        if (!file) {
          throw new Error('No file selected');
        }
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

        let thumbnailUrl;
        if (thumbnail) {
          try {
            const thumbnailResult = await contentService.uploadFile(thumbnail);
            if (thumbnailResult.data) {
              thumbnailUrl = thumbnailResult.data.url;
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
          type: 'file',
          url: uploadResult.data?.url || '',
          fileSize: uploadResult.data?.size
            ? `${(uploadResult.data.size / (1024 * 1024)).toFixed(2)} MB`
            : undefined,
          thumbnailUrl,
          pricingModel: 'one-time',
        };
      } else if (paywallType === 'content' && selectedContent.length > 0) {
        // For content library items, we reference the first selected item
        // In a real implementation, we might want to handle multiple items differently
        const contentItem = selectedContent[0];

        let thumbnailUrl;
        if (thumbnail) {
          try {
            const thumbnailResult = await contentService.uploadFile(thumbnail);
            if (thumbnailResult.data) {
              thumbnailUrl = thumbnailResult.data.url;
            }
          } catch (thumbnailError) {
            console.error('Error uploading thumbnail:', thumbnailError);
            // Continue without thumbnail if upload fails
          }
        }

        paywallData = {
          title,
          description,
          price,
          currency,
          type: contentItem?.type || 'file',
          contentId: contentItem?.id || '',
          url: contentItem?.url || '',
          thumbnailUrl,
          pricingModel: 'one-time',
        };
      } else if (paywallType === 'url' && urls.some(url => url.trim() !== '')) {
        // For URLs, we create a paywall for the first URL
        // In a real implementation, we might want to handle multiple URLs differently
        const url = urls.find(u => u.trim() !== '') || '';

        let thumbnailUrl;
        if (thumbnail) {
          try {
            const thumbnailResult = await contentService.uploadFile(thumbnail);
            if (thumbnailResult.data) {
              thumbnailUrl = thumbnailResult.data.url;
            }
          } catch (thumbnailError) {
            console.error('Error uploading thumbnail:', thumbnailError);
            // Continue without thumbnail if upload fails
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
          pricingModel: 'one-time',
        };
      } else {
        throw new Error('Please select content for your paywall');
      }

      // Log the data being sent for debugging
      console.log('Creating paywall with data:', paywallData);

      // Create the paywall
      const result = await paywallService.createPaywall(paywallData);
      console.log('Paywall created successfully:', result);

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

      // Refresh paywalls to update the UI
      if (paywalls?.refreshPaywalls) {
        paywalls.refreshPaywalls();
      }
      // Navigate to success page with paywall data
      navigate('/paywall-success', { state: { paywall: result } });
    } catch (err: unknown) {
      console.error('Error creating paywall:', err);

      let errorMessage = 'Failed to create paywall. ';

      // Check if it's an API error with response data
      if (isAxiosError(err) && err.response) {
        const { status, data } = err.response;
        const errorData = data as { error?: string; message?: string };
        if (status === 500) {
          // For 500 errors, try to get the specific error message from the server
          errorMessage +=
            errorData?.error ||
            errorData?.message ||
            'The server encountered an error. Please try again later.';
        } else if (status === 400) {
          errorMessage +=
            errorData?.message ||
            errorData?.error ||
            'Invalid data provided. Please check your inputs.';
        } else if (status === 401) {
          errorMessage +=
            errorData?.message ||
            errorData?.error ||
            'You are not authorized to create a paywall. Please log in.';
        } else if (status === 403) {
          errorMessage +=
            errorData?.message ||
            errorData?.error ||
            'You do not have permission to create a paywall.';
        } else if (status === 429) {
          errorMessage +=
            errorData?.message ||
            errorData?.error ||
            'Too many requests. Please wait a moment before trying again.';
        } else {
          errorMessage +=
            errorData?.message || errorData?.error || `Server responded with status ${status}.`;
        }
      } else if (isAxiosError(err) && err.request) {
        // Request was made but no response received
        errorMessage += 'Unable to connect to the server. Please check your internet connection.';
      } else {
        // Something else happened
        errorMessage += (err as Error).message || 'An unexpected error occurred.';
      }

      setError(errorMessage);

      // Show error notification
      notificationService.addNotification({
        title: 'Error Creating Paywall',
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getContentType = () => {
    if (title.toLowerCase().includes('ebook') || title.toLowerCase().includes('book')) {
      return 'ebook';
    } else if (title.toLowerCase().includes('course') || title.toLowerCase().includes('class')) {
      return 'course';
    } else if (title.toLowerCase().includes('template') || title.toLowerCase().includes('pack')) {
      return 'template';
    } else if (title.toLowerCase().includes('video') || title.toLowerCase().includes('course')) {
      return 'video';
    } else if (title.toLowerCase().includes('audio') || title.toLowerCase().includes('podcast')) {
      return 'audio';
    }
    return 'general';
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
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Paywall Details
                </h3>
                <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                          rows={3}
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

                      {/* Content Type Selection and Content Area */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {paywallType === 'file' && 'Upload Files'}
                            {paywallType === 'content' && 'Select from Content Library'}
                            {paywallType === 'url' && 'Add URLs'}
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsTypeModalOpen(true)}
                            className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Change
                          </button>
                        </div>
                      </div>

                      {/* File Upload Section */}
                      <div className={`mb-6 ${paywallType !== 'file' ? 'hidden' : ''}`}>
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
                            onFileSelect={() => {
                              // This won't be called when multiple is true, but it's required
                            }}
                            onFilesSelect={fileList => {
                              // Convert FileList to array and add all files
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

                      {/* Content Library Section */}
                      <div className={`mb-6 ${paywallType !== 'content' ? 'hidden' : ''}`}>
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
                                    {contentItem?.title || 'Unknown'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {contentItem?.type?.toUpperCase() || 'UNKNOWN'}{' '}
                                    {contentItem?.size ? `• ${contentItem.size}` : ''}
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

                      {/* URL Section */}
                      <div className={`mb-6 ${paywallType !== 'url' ? 'hidden' : ''}`}>
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
                            url ? (
                              <ContentPreview key={index} file={null} url={url} type="url" />
                            ) : null
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
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Select the currency you want to sell this paywall in
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Price
                        </label>
                        <EnhancedPricingSelector
                          selectedPrice={price}
                          onPriceChange={setPrice}
                          contentType={getContentType()}
                          currency={currency}
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Link to="/">
                          <button
                            type="button"
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </Link>
                        <button
                          type="submit"
                          disabled={
                            !title ||
                            (paywallType === 'file' && files.length === 0) ||
                            (paywallType === 'content' && selectedContent.length === 0) ||
                            (paywallType === 'url' && urls.every(url => !url)) ||
                            loading
                          }
                          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            !title ||
                            (paywallType === 'file' && files.length === 0) ||
                            (paywallType === 'content' && selectedContent.length === 0) ||
                            (paywallType === 'url' && urls.every(url => !url)) ||
                            loading
                              ? 'bg-gray-400 cursor-not-allowed dark:bg-gray-600'
                              : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                          }`}
                        >
                          {loading ? (
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
                      </div>
                      {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
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
                                Error creating paywall
                              </h3>
                              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                <p>{error}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>

                  <div>
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

            {/* Paywall Type Selection Modal */}
            <Modal
              isOpen={isTypeModalOpen}
              onClose={() => setIsTypeModalOpen(false)}
              title="Select Content Type"
            >
              <div className="mt-4 space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setPaywallType('file');
                    setIsTypeModalOpen(false);
                  }}
                  className="w-full inline-flex items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                >
                  <svg
                    className="h-5 w-5 text-gray-400 mr-3"
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
                  Upload Files
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaywallType('content');
                    setIsTypeModalOpen(false);
                  }}
                  className="w-full inline-flex items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                >
                  <svg
                    className="h-5 w-5 text-gray-400 mr-3"
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
                  Select from Content Library
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaywallType('url');
                    setIsTypeModalOpen(false);
                  }}
                  className="w-full inline-flex items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                >
                  <svg
                    className="h-5 w-5 text-gray-400 mr-3"
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
                  Add URLs
                </button>
              </div>
            </Modal>

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
