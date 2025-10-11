import React, { useState, useEffect, useMemo, useRef } from 'react';
import EmptyState from './EmptyState';
import ContentPreview from './ContentPreview';
import { useAppData } from '../contexts';
import contentService from '../services/contentService';

// Define ContentItem interface for UI-specific fields
interface ContentItem {
  id: string;
  title: string;
  description?: string;
  type: 'file' | 'url' | 'paywall' | 'document' | 'video' | 'image' | 'content' | 'content_package';
  fileType?: string;
  size?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  tags: string[];
  // Paywall-specific fields
  isProtected?: boolean;
  price?: number;
  currency?: string;
  paywallTitle?: string;
  paywallDescription?: string;
}

interface ContentLibraryProps {
  filterType?: 'all' | 'protected' | 'unprotected';
}

const ContentLibrary: React.FC<ContentLibraryProps> = ({ filterType = 'all' }) => {
  const { content: contentData } = useAppData(); // Destructure to avoid naming conflict
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>(
    'all'
  );
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'title' | 'type'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Increased for grid view
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Added view mode toggle
  const fileRefs = useRef<Record<string, File>>({});

  // Extract content array, loading, error, and refresh function from the hook result
  const contentArray = contentData.content;
  const loading = contentData.loading;
  const error = contentData.error;
  const refreshContent = contentData.refreshContent;

  useEffect(() => {
    if (contentArray) {
      // Map the Content objects to ContentItem objects, filtering out undefined or invalid items
      let filteredContent = contentArray.filter(item => item && item.id); // Ensure item exists and has an id

      // Apply filter based on protection status
      if (filterType === 'protected') {
        filteredContent = filteredContent.filter(item => item.isProtected);
      } else if (filterType === 'unprotected') {
        filteredContent = filteredContent.filter(item => !item.isProtected);
      }

      const mappedItems: ContentItem[] = filteredContent.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        url: item.url,
        size: item.size,
        createdAt: item.createdAt
          ? item.createdAt.split('T')[0] || item.createdAt
          : new Date().toISOString(),
        updatedAt: item.updatedAt
          ? item.updatedAt.split('T')[0] || item.updatedAt
          : new Date().toISOString(),
        status: item.status,
        tags: item.tags || [],
        // Add protection fields
        isProtected: item.isProtected,
        price: item.price,
        currency: item.currency,
        paywallTitle: item.paywallTitle,
        paywallDescription: item.paywallDescription,
      }));
      setContentItems(mappedItems);
    }
  }, [contentArray, filterType]);

  // Clean up file URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any file URLs we created (if we stored them)
      Object.values(fileRefs.current).forEach(file => {
        // File objects don't need explicit cleanup, but we clear the ref
      });
    };
  }, []);

  // Get all unique tags
  const allTags = useMemo(
    () => Array.from(new Set(contentItems.flatMap(item => item.tags || []))),
    [contentItems]
  );

  // Filter and sort content items
  const filteredAndSortedItems = useMemo(() => {
    return contentItems
      .filter(item => {
        const matchesSearch =
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesTags =
          selectedTags.length === 0 || selectedTags.every(tag => item.tags.includes(tag));
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

        return matchesSearch && matchesTags && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'title') {
          comparison = a.title.localeCompare(b.title);
        } else if (sortBy === 'type') {
          comparison = a.type.localeCompare(b.type);
        } else if (sortBy === 'createdAt') {
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortBy === 'updatedAt') {
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [contentItems, searchTerm, selectedTags, statusFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedItems, currentPage, itemsPerPage]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const updateStatus = async (id: string, status: 'draft' | 'published' | 'archived') => {
    try {
      // Update status in the backend
      await contentService.updateContent(id, { status });
      // Refresh content to get the latest data
      if (refreshContent) {
        await refreshContent();
      }
    } catch (error) {
      console.error('Error updating content status:', error);
      // Fallback to local update if backend update fails
      setContentItems(items => items.map(item => (item.id === id ? { ...item, status } : item)));
    }
  };

  const deleteItem = async (id: string) => {
    try {
      // Delete content in the backend
      await contentService.deleteContent(id);
      // Refresh content to get the latest data
      if (refreshContent) {
        await refreshContent();
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      // Fallback to local deletion if backend deletion fails
      setContentItems(items => items.filter(item => item.id !== id));
    }
  };

  const handleOpenContent = (item: ContentItem) => {
    if (item.type === 'url' && item.url) {
      // Open URL in new tab
      window.open(item.url, '_blank');
    } else if (item.type === 'file') {
      // Show preview for files
      setPreviewItem(item);
      setShowPreview(true);
    }
  };

  const handlePreview = (item: ContentItem) => {
    setPreviewItem(item);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewItem(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      // Process each file
      for (const file of Array.from(files)) {
        // First upload the file to get a URL
        const uploadResult = await contentService.uploadFile(file);

        // Create content item with the uploaded file info
        if (uploadResult.data) {
          await contentService.createContent({
            title: file.name,
            description: `Uploaded file: ${file.name}`,
            type: 'file',
            url: uploadResult.data.url,
            tags: [],
            status: 'draft', // Default status
            isProtected: false, // Default protection status
            userId: '', // Will be filled by the backend
            createdAt: new Date().toISOString(), // Client-side timestamp
            updatedAt: new Date().toISOString(), // Client-side timestamp
          });
        }
      }

      // Refresh content to get the latest data from the backend
      if (refreshContent) {
        await refreshContent();
      }

      // Reset the input
      event.target.value = '';

      alert(`${files.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');

      // Create temporary content items for preview as fallback
      const newItems: ContentItem[] = Array.from(files).map((file, index) => ({
        id: `temp-${Date.now()}-${index}`,
        title: file.name,
        type: 'file',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        createdAt: new Date().toISOString().split('T')[0] || new Date().toISOString(),
        updatedAt: new Date().toISOString().split('T')[0] || new Date().toISOString(),
        status: 'draft',
        tags: [],
      }));

      // Store files in ref
      newItems.forEach((item, index) => {
        const file = Array.from(files)[index];
        if (file) {
          fileRefs.current[item.id] = file;
        }
      });

      setContentItems(prev => [...newItems, ...prev]);

      // Reset the input
      event.target.value = '';
    }
  };

  const handleSaveContent = async () => {
    try {
      // Find temporary items to save to backend
      const tempItems = contentItems.filter(item => item.id.startsWith('temp-'));

      for (const item of tempItems) {
        // Create content using the service
        await contentService.createContent({
          title: item.title,
          description: item.description,
          type: item.type, // Correct type
          url: item.url,
          tags: item.tags,
          status: item.status || 'draft',
          isProtected: item.isProtected || false,
          userId: '', // Will be filled by the backend
          createdAt: new Date().toISOString(), // Client-side timestamp
          updatedAt: new Date().toISOString(), // Client-side timestamp
        });
      }

      // Refresh content to get the latest data from the backend
      if (refreshContent) {
        await refreshContent();
      }

      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content. Please try again.');
    }
  };

  const handleSort = (field: 'createdAt' | 'updatedAt' | 'title' | 'type') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: 'createdAt' | 'updatedAt' | 'title' | 'type') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Get file type icon
  const getFileTypeIcon = (item: ContentItem) => {
    if (item.type === 'url') {
      return (
        <svg
          className="h-8 w-8 text-green-500"
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
      );
    }

    // For files, determine icon based on extension
    const extension = item.title.split('.').pop()?.toLowerCase() || '';
    switch (extension) {
      case 'pdf':
        return (
          <svg
            className="h-8 w-8 text-red-500"
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
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <svg
            className="h-8 w-8 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case 'mp4':
      case 'mov':
      case 'avi':
        return (
          <svg
            className="h-8 w-8 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-8 w-8 text-gray-500"
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
        );
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Content Library</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage all your digital content in one place
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {viewMode === 'grid' ? (
              <>
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                List View
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                Grid View
              </>
            )}
          </button>
          <button
            onClick={handleSaveContent}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Save All
          </button>
          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload Content
          </button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            multiple
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div>
          <label htmlFor="search" className="sr-only">
            Search content
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              placeholder="Search content..."
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
            >
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as 'draft' | 'published' | 'archived' | 'all')
              }
              className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Items */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900/20 dark:border-red-900">
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
                Error loading content
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={refreshContent}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:text-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <EmptyState
          title="No content found"
          description="Try adjusting your search or filter criteria, or upload your first piece of content."
          actionText="Upload Content"
          onClick={() => document.getElementById('file-upload')?.click()}
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
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
      ) : (
        <>
          {viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedItems.map(item => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 dark:border-gray-700 dark:bg-gray-700/50"
                >
                  <div className="p-5">
                    <div className="flex justify-center mb-4">{getFileTypeIcon(item)}</div>
                    <h3
                      className="text-lg font-medium text-gray-900 mb-2 truncate dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                      onClick={() => handleOpenContent(item)}
                    >
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2 dark:text-gray-400">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.type === 'file' ? 'File' : 'URL'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.size || '-'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePreview(item)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={async () => {
                            const newStatus =
                              item.status === 'draft'
                                ? 'published'
                                : item.status === 'published'
                                  ? 'archived'
                                  : 'draft';
                            await updateStatus(item.id, newStatus);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          {item.status === 'draft' ? (
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : item.status === 'published' ? (
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
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                              />
                            </svg>
                          ) : (
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
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg dark:ring-gray-700">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-white"
                    >
                      Content
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      <button
                        onClick={() => handleSort('type')}
                        className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        Type {getSortIcon('type')}
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Size
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        Created {getSortIcon('createdAt')}
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      <button
                        onClick={() => handleSort('updatedAt')}
                        className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        Updated {getSortIcon('updatedAt')}
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800 dark:divide-gray-700">
                  {paginatedItems.map(item => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 dark:text-white">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {item.type === 'file' ? (
                              <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                                <svg
                                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
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
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-green-100 flex items-center justify-center dark:bg-green-900/30">
                                <svg
                                  className="h-6 w-6 text-green-600 dark:text-green-400"
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
                            )}
                          </div>
                          <div className="ml-4">
                            <div
                              className="font-medium text-indigo-600 hover:text-indigo-900 cursor-pointer dark:text-indigo-400 dark:hover:text-indigo-300"
                              onClick={() => handleOpenContent(item)}
                            >
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-gray-500 text-xs truncate max-w-xs dark:text-gray-400">
                                {item.description}
                              </div>
                            )}
                            {item.type === 'url' && (
                              <div
                                className="text-gray-500 text-xs truncate max-w-xs dark:text-gray-400 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                                onClick={() => handleOpenContent(item)}
                              >
                                {item.url}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          {item.type === 'file' ? (
                            <>
                              <svg
                                className="flex-shrink-0 h-5 w-5 text-gray-400 mr-1.5"
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
                              {item.fileType}
                            </>
                          ) : (
                            <>
                              <svg
                                className="flex-shrink-0 h-5 w-5 text-gray-400 mr-1.5"
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
                              URL
                            </>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {item.size || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {item.createdAt}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {item.updatedAt}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                        >
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center space-x-2 justify-end">
                          <button
                            onClick={async () => {
                              const newStatus =
                                item.status === 'draft'
                                  ? 'published'
                                  : item.status === 'published'
                                    ? 'archived'
                                    : 'draft';
                              await updateStatus(item.id, newStatus);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            {item.status === 'draft'
                              ? 'Publish'
                              : item.status === 'published'
                                ? 'Archive'
                                : 'Draft'}
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedItems.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedItems.length)} of{' '}
                {filteredAndSortedItems.length} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === i + 1
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {showPreview && previewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {previewItem.title}
                </h3>
                <button
                  onClick={closePreview}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <ContentPreview
                file={previewItem ? fileRefs.current[previewItem.id] || null : null}
                url={previewItem?.url || ''}
                type={previewItem?.type || 'file'}
              />
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Details</h4>
                  <dl className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Type</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">
                        {previewItem.type === 'file' ? 'File' : 'URL'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Status</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(previewItem.status)}`}
                        >
                          {previewItem.status.charAt(0).toUpperCase() + previewItem.status.slice(1)}
                        </span>
                      </dd>
                    </div>
                    {previewItem.size && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Size</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {previewItem.size}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Created</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">
                        {previewItem.createdAt}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Updated</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">
                        {previewItem.updatedAt}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Tags</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {previewItem.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closePreview}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:hover:bg-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentLibrary;
