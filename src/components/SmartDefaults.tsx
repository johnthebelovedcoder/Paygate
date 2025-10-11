import React, { useState, useEffect } from 'react';
import { FileWithPath } from 'react-dropzone';
import { CURRENCY_SYMBOLS } from '../utils/constants.utils';

interface SmartDefaultsProps {
  files: File[];
  urls: string[];
  paywallType: 'file' | 'content' | 'url';
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onPriceChange: (price: number) => void;
  onCurrencyChange: (currency: string) => void;
  onTagsChange: (tags: string[]) => void;
}

const SmartDefaults: React.FC<SmartDefaultsProps> = ({
  files,
  urls,
  paywallType,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onCurrencyChange,
  onTagsChange,
}) => {
  const [contentType, setContentType] = useState('general');
  const [detectedLanguage, setDetectedLanguage] = useState('en');

  // Content type mapping for smart defaults
  const CONTENT_TYPE_TITLES: Record<string, string> = {
    ebook: 'E-book: ',
    course: 'Course: ',
    template: 'Template Pack: ',
    video: 'Video: ',
    audio: 'Audio: ',
    general: 'Digital Content: ',
  };

  const DEFAULT_PRICES: Record<string, number> = {
    ebook: 29.99,
    course: 99.99,
    template: 49.99,
    video: 19.99,
    audio: 14.99,
    general: 24.99,
  };

  const CONTENT_TAGS: Record<string, string[]> = {
    ebook: ['ebook', 'digital-book', 'pdf', 'guide'],
    course: ['online-course', 'tutorial', 'learning', 'education'],
    template: ['template', 'design', 'resource', 'toolkit'],
    video: ['video', 'tutorial', 'content', 'media'],
    audio: ['audio', 'podcast', 'music', 'sound'],
    general: ['digital', 'content', 'exclusive'],
  };

  // Detect content type based on file extensions or URL patterns
  useEffect(() => {
    if (paywallType === 'file' && files.length > 0) {
      if (files[0]) {
        detectContentTypeFromFile(files[0]);
      }
    } else if (paywallType === 'url' && urls.some(url => url.trim() !== '')) {
      const firstUrl = urls.find(url => url.trim() !== '') || '';
      detectContentTypeFromUrl(firstUrl);
    }
  }, [files, urls, paywallType]);

  // Apply smart defaults when content type changes
  useEffect(() => {
    applySmartDefaults();
  }, [contentType]);

  const detectContentTypeFromFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    // E-book detection
    if (['pdf', 'epub', 'mobi'].includes(extension)) {
      setContentType('ebook');
      return;
    }

    // Video detection
    if (['mp4', 'mov', 'avi', 'mkv', 'wmv'].includes(extension)) {
      setContentType('video');
      return;
    }

    // Audio detection
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension)) {
      setContentType('audio');
      return;
    }

    // Template detection
    if (['zip', 'rar', 'psd', 'ai', 'sketch'].includes(extension)) {
      setContentType('template');
      return;
    }

    // Default to general
    setContentType('general');
  };

  const detectContentTypeFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // YouTube detection
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        setContentType('video');
        return;
      }

      // Vimeo detection
      if (hostname.includes('vimeo.com')) {
        setContentType('video');
        return;
      }

      // Google Drive detection
      if (hostname.includes('drive.google.com')) {
        setContentType('general');
        return;
      }

      // Dropbox detection
      if (hostname.includes('dropbox.com')) {
        setContentType('general');
        return;
      }

      // Default to general
      setContentType('general');
    } catch (e) {
      // Invalid URL, default to general
      setContentType('general');
    }
  };

  const applySmartDefaults = () => {
    // Generate title
    let title = '';
    if (paywallType === 'file' && files.length > 0) {
      const fileName = files[0]?.name?.replace(/\.[^/.]+$/, '') || ''; // Remove extension
      title = `${CONTENT_TYPE_TITLES[contentType] || ''}${fileName}`;
    } else if (paywallType === 'url' && urls.some(url => url.trim() !== '')) {
      const firstUrl = urls.find(url => url.trim() !== '') || '';
      try {
        const urlObj = new URL(firstUrl);
        title = `${CONTENT_TYPE_TITLES[contentType] || ''}${urlObj.hostname}`;
      } catch (e) {
        title = `${CONTENT_TYPE_TITLES[contentType] || ''}Protected Link`;
      }
    } else {
      title = `${CONTENT_TYPE_TITLES[contentType] || ''}Exclusive Content`;
    }

    onTitleChange(title);

    // Generate description
    const descriptions: Record<string, string> = {
      ebook: `Get instant access to this comprehensive ${contentType}. This digital resource contains valuable insights and practical knowledge that will help you achieve your goals.`,
      course: `Enroll in this complete ${contentType} and gain the skills you need to succeed. This step-by-step program includes everything from fundamentals to advanced techniques.`,
      template: `Access this professionally designed ${contentType} pack. These ready-to-use resources will save you hours of work and help you create stunning results.`,
      video: `Watch this high-quality ${contentType} and learn from industry experts. This engaging content delivers valuable information in an easy-to-consume format.`,
      audio: `Listen to this premium ${contentType} recording and absorb knowledge on the go. Perfect for learning during commutes, workouts, or downtime.`,
      general: `Unlock exclusive ${contentType} that's not available anywhere else. This carefully curated content provides unique value that you won't find elsewhere.`,
    };

    onDescriptionChange(descriptions[contentType] || descriptions.general || '');

    // Set price
    onPriceChange(DEFAULT_PRICES[contentType] || DEFAULT_PRICES.general || 0);

    // Set tags
    onTagsChange(CONTENT_TAGS[contentType] || CONTENT_TAGS.general || []);

    // Detect language (simplified)
    if (paywallType === 'file' && files.length > 0) {
      // In a real implementation, we might analyze the file content
      // For now, we'll just default to English
      setDetectedLanguage('en');
    }
  };

  // Currency suggestion based on detected language/region
  const suggestCurrency = () => {
    // This is a simplified implementation
    // In a real app, we might detect the user's region and suggest appropriate currency
    const userRegion = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (userRegion.includes('Africa')) {
      return 'NGN'; // Nigerian Naira as default for Africa
    } else if (userRegion.includes('Europe')) {
      return 'EUR'; // Euro for Europe
    } else if (userRegion.includes('UK')) {
      return 'GBP'; // British Pound for UK
    } else {
      return 'USD'; // US Dollar as default
    }
  };

  // Bulk creation helper
  const handleBulkCreation = () => {
    // In a real implementation, this would help users create multiple paywalls
    // with similar settings

    const bulkDefaults = {
      contentType,
      suggestedPrice: DEFAULT_PRICES[contentType] || DEFAULT_PRICES.general,
      suggestedCurrency: suggestCurrency(),
      suggestedTags: CONTENT_TAGS[contentType] || CONTENT_TAGS.general,
    };

    return bulkDefaults;
  };

  // Render smart defaults summary
  return (
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
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Smart Defaults Applied
          </h3>
          <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
            <ul className="list-disc list-inside space-y-1">
              <li>
                Detected content type: <span className="font-medium capitalize">{contentType}</span>
              </li>
              <li>
                Suggested price:{' '}
                <span className="font-medium">
                  {CURRENCY_SYMBOLS[suggestCurrency()] || '$'}
                  {DEFAULT_PRICES[contentType]?.toFixed(2) || DEFAULT_PRICES.general.toFixed(2)}
                </span>
              </li>
              <li>
                Auto-generated tags:{' '}
                <span className="font-medium">
                  {(CONTENT_TAGS[contentType] || CONTENT_TAGS.general).slice(0, 3).join(', ')}
                </span>
              </li>
            </ul>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => applySmartDefaults()}
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:text-blue-300 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
            >
              Regenerate Suggestions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDefaults;
