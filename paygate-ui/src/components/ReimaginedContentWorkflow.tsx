import React, { useEffect, useMemo, useState } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { useAuth } from '../contexts/AuthContext';
import contentService from '../services/contentService';
import paywallService, { type CreatePaywallData } from '../services/paywallService';
import type { ContentItem } from '../types/content.types';

interface ContentPackage {
  id: string;
  title: string;
  description: string;
  contentIds: string[];
  type: 'bundle' | 'series' | 'course' | 'playlist';
  createdAt: string;
  updatedAt: string;
}

interface SmartPaywall {
  id: string;
  title: string;
  description: string;
  contentPackageId: string;
  pricing: {
    type: 'fixed' | 'dynamic' | 'tiered' | 'subscription';
    basePrice: number;
    currency: string;
  };
  customization: {
    theme: string;
    colors: {
      primary: string;
      secondary: string;
      background: string;
    };
    layout: 'minimal' | 'feature-rich' | 'premium';
  };
  analytics: {
    views: number;
    conversions: number;
    conversionRate: number;
  };
  status: 'draft' | 'published' | 'archived';
  previewUrl?: string;
}

const ReimaginedContentWorkflow: React.FC = () => {
  const { content, paywalls, fetchContent, fetchPaywalls } = useAppData();
  const { user } = useAuth();
  const [availableContent, setAvailableContent] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem[]>([]);
  const [contentPackages, setContentPackages] = useState<ContentPackage[]>([]);
  const [smartPaywalls, setSmartPaywalls] = useState<SmartPaywall[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'bundle' | 'create'>('discover');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newPackageTitle, setNewPackageTitle] = useState<string>('');
  const [newPackageType, setNewPackageType] = useState<'bundle' | 'series' | 'course' | 'playlist'>(
    'bundle'
  );
  const [newPackageDescription, setNewPackageDescription] = useState<string>('');

  // Paywall creation state
  const [newPaywallTitle, setNewPaywallTitle] = useState<string>('');
  const [newPaywallPrice, setNewPaywallPrice] = useState<number>(0);
  const [newPaywallCurrency, setNewPaywallCurrency] = useState<string>('NGN');
  const [newPaywallType, setNewPaywallType] = useState<
    'fixed' | 'dynamic' | 'tiered' | 'subscription'
  >('fixed');
  const [paywallTheme, setPaywallTheme] = useState<string>('default');
  const [paywallLayout, setPaywallLayout] = useState<'minimal' | 'feature-rich' | 'premium'>(
    'minimal'
  );

  // Initialize data
  useEffect(() => {
    if (content.content && Array.isArray(content.content)) {
      // Only show unprotected content for this workflow
      const unprotectedContent = (content.content as ContentItem[])
        .filter(item => !item.isProtected)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAvailableContent(unprotectedContent);
    }

    // Load content packages and smart paywalls
    loadContentPackages();
    loadSmartPaywalls();
  }, [content, paywalls]);

  const loadContentPackages = async () => {
    // In a real implementation, this would fetch from the API
    // For now, we'll use a mock implementation
    try {
      // This would typically come from a dedicated content package service
      const mockPackages: ContentPackage[] = [];
      setContentPackages(mockPackages);
    } catch (error) {
      console.error('Error loading content packages:', error);
    }
  };

  const loadSmartPaywalls = async () => {
    // Load paywalls with enhanced data
    try {
      if (paywalls.paywalls && Array.isArray(paywalls.paywalls)) {
        const enhancedPaywalls: SmartPaywall[] = paywalls.paywalls
          .filter(paywall => paywall && paywall.id)
          .map(paywall => {
            // Generate preview URL that works for draft paywalls
            // For draft paywalls, we might need a token-based URL to bypass status checks
            let previewUrl: string | undefined;

            if (paywall.status === 'draft') {
              // For draft paywalls, create a preview URL that includes authentication
              const token = localStorage.getItem('token');
              if (token) {
                previewUrl = `/api/paywalls/customer/${paywall.id}?preview=true&token=${encodeURIComponent(token)}`;
              } else {
                // Fallback for when no token is available
                previewUrl = undefined;
              }
            } else {
              previewUrl = `/paywall/${paywall.id}/preview`;
            }

            return {
              id: paywall.id,
              title: paywall.title,
              description: paywall.description || '',
              contentPackageId: paywall.contentId || '',
              pricing: {
                type: 'fixed',
                basePrice: paywall.price || 0,
                currency: paywall.currency || 'NGN',
              },
              customization: {
                theme: 'default',
                colors: {
                  primary: '#4F46E5',
                  secondary: '#60A5FA',
                  background: '#FFFFFF',
                },
                layout: 'minimal',
              },
              analytics: {
                views: 0,
                conversions: 0,
                conversionRate: 0,
              },
              status: paywall.status,
              previewUrl: previewUrl,
            };
          });
        setSmartPaywalls(enhancedPaywalls);
      }
    } catch (error) {
      console.error('Error loading smart paywalls:', error);
    }
  };

  // Filter content based on search and category
  const filteredContent = useMemo(() => {
    return availableContent.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.tags.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [availableContent, searchQuery, selectedCategory]);

  // Content selection handlers
  const toggleContentSelection = (item: ContentItem) => {
    setSelectedContent(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const selectAllContent = () => {
    setSelectedContent([...filteredContent]);
  };

  const clearSelection = () => {
    setSelectedContent([]);
  };

  // Smart package creation
  const createContentPackage = async () => {
    if (!newPackageTitle.trim() || selectedContent.length === 0) {
      alert('Please provide a title and select at least one content item');
      return;
    }

    try {
      const packageData: ContentPackage = {
        id: `pkg_${Date.now()}`,
        title: newPackageTitle,
        description: newPackageDescription,
        contentIds: selectedContent.map(item => item.id),
        type: newPackageType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // In a real implementation, this would call the content package service
      const newPackages = [...contentPackages, packageData];
      setContentPackages(newPackages);

      // Reset form
      setNewPackageTitle('');
      setNewPackageDescription('');
      setSelectedContent([]);

      alert('Content package created successfully!');
    } catch (error) {
      console.error('Error creating content package:', error);
      alert('Failed to create content package. Please try again.');
    }
  };

  // Smart paywall creation
  const createSmartPaywall = async () => {
    if (!newPaywallTitle.trim() || selectedContent.length === 0) {
      alert('Please provide a title and select at least one content item');
      return;
    }

    try {
      // First create the content package if content is selected
      if (selectedContent.length > 0) {
        const contentPackage: ContentPackage = {
          id: `pkg_${Date.now()}`,
          title: newPaywallTitle,
          description: `Package for paywall: ${newPaywallTitle}`,
          contentIds: selectedContent.map(item => item.id),
          type: 'bundle',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Create paywall data - default to draft so user can review before publishing
        const paywallData: CreatePaywallData = {
          title: newPaywallTitle,
          description: `Paywall for: ${newPaywallTitle}`,
          price: newPaywallPrice,
          currency: newPaywallCurrency,
          type: 'content', // This indicates it's tied to content
          status: 'draft', // Draft by default, user can publish later
          tags: [],
          previewEnabled: true,
          previewSettings: { style: paywallTheme },
          socialShareEnabled: true,
          pricingModel: 'one-time',
        };

        const result = await paywallService.createPaywall(paywallData);

        // Instead of adding to local state directly, refresh the paywalls to get the latest from the server
        setNewPaywallTitle('');
        setNewPaywallPrice(0);
        setSelectedContent([]);

        // Refresh paywalls to include the newly created one
        await fetchPaywalls();

        alert('Smart paywall created successfully! You can preview it using the preview button.');
      }
    } catch (error) {
      console.error('Error creating smart paywall:', error);
      alert('Failed to create smart paywall. Please try again.');
    }
  };

  // Content protection automation
  const protectContentAutomatically = async (packageId: string) => {
    try {
      const packageData = contentPackages.find(pkg => pkg.id === packageId);
      if (!packageData) return;

      // Update all content items in the package to be protected
      for (const contentId of packageData.contentIds) {
        await contentService.updateContentProtection(contentId, {
          isProtected: true,
          price: newPaywallPrice,
          currency: newPaywallCurrency,
          paywallTitle: newPaywallTitle,
          paywallDescription: `Paywall for: ${newPaywallTitle}`,
        });
      }

      // Refresh content and paywalls
      await fetchContent();
      await fetchPaywalls();

      alert('Content protection updated successfully!');
    } catch (error) {
      console.error('Error updating content protection:', error);
      alert('Failed to update content protection. Please try again.');
    }
  };

  // Get unique tags for category filtering
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    availableContent.forEach(item => {
      item.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [availableContent]);

  return (
    <div className="space-y-8">
      {/* Header with Tab Navigation */}
      <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Smart Content & Paywall Workflow
          </h2>
          <div className="mt-4 md:mt-0 flex space-x-1 bg-gray-100 p-1 rounded-lg dark:bg-gray-700">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'discover'
                  ? 'bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('discover')}
            >
              Discover Content
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'bundle'
                  ? 'bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('bundle')}
            >
              Bundle Content
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'create'
                  ? 'bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('create')}
            >
              Create Paywall
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Search Content
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Search by title or description..."
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <button
                  type="button"
                  onClick={selectAllContent}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Content Selection Grid */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Available Content ({filteredContent.length} items)
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedContent.length} selected
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContent.map(item => {
                  const isSelected = selectedContent.some(i => i.id === item.id);

                  return (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 hover:border-indigo-300 dark:border-gray-700 dark:hover:border-indigo-500'
                      }`}
                      onClick={() => toggleContentSelection(item)}
                    >
                      <div className="flex items-start">
                        <div
                          className={`flex items-center h-5 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`}
                        >
                          <svg
                            className={`h-5 w-5 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            {isSelected ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            )}
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {item.type} • {item.size || 'N/A'}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.tags.slice(0, 2).map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              >
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                +{item.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredContent.length === 0 && (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No content found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bundle' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Create Content Package
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Selected Content ({selectedContent.length} items)
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedContent.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-white rounded-md border dark:bg-gray-600 dark:border-gray-500"
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleContentSelection(item)}
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
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {selectedContent.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          No content selected. Go to Discover Content tab to select items.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="packageTitle"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Package Title
                      </label>
                      <input
                        type="text"
                        id="packageTitle"
                        value={newPackageTitle}
                        onChange={e => setNewPackageTitle(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter package title..."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="packageType"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Package Type
                      </label>
                      <select
                        id="packageType"
                        value={newPackageType}
                        onChange={e =>
                          setNewPackageType(
                            e.target.value as 'bundle' | 'series' | 'course' | 'playlist'
                          )
                        }
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="bundle">Bundle</option>
                        <option value="series">Series</option>
                        <option value="course">Course</option>
                        <option value="playlist">Playlist</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="packageDescription"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        id="packageDescription"
                        value={newPackageDescription}
                        onChange={e => setNewPackageDescription(e.target.value)}
                        rows={3}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Describe your content package..."
                      />
                    </div>

                    <button
                      type="button"
                      onClick={createContentPackage}
                      disabled={selectedContent.length === 0 || !newPackageTitle.trim()}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                      Create Package
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Packages */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Content Packages
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentPackages.map(pkg => (
                  <div
                    key={pkg.id}
                    className="border border-gray-200 rounded-lg p-4 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{pkg.title}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {pkg.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {pkg.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {pkg.contentIds.length} items
                      </span>
                      <button
                        type="button"
                        onClick={() => protectContentAutomatically(pkg.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600"
                      >
                        Protect Content
                      </button>
                    </div>
                  </div>
                ))}

                {contentPackages.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No packages yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Create your first content package to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Create Smart Paywall
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Selected Content ({selectedContent.length} items)
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedContent.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-white rounded-md border dark:bg-gray-600 dark:border-gray-500"
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleContentSelection(item)}
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
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {selectedContent.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          No content selected. Go to Discover Content tab to select items.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="paywallTitle"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Paywall Title
                      </label>
                      <input
                        type="text"
                        id="paywallTitle"
                        value={newPaywallTitle}
                        onChange={e => setNewPaywallTitle(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter paywall title..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="paywallPrice"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Price
                        </label>
                        <input
                          type="number"
                          id="paywallPrice"
                          value={newPaywallPrice}
                          onChange={e => setNewPaywallPrice(Number(e.target.value))}
                          min="0"
                          step="0.01"
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="paywallCurrency"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Currency
                        </label>
                        <select
                          id="paywallCurrency"
                          value={newPaywallCurrency}
                          onChange={e => setNewPaywallCurrency(e.target.value)}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="NGN">NGN (Nigerian Naira)</option>
                          <option value="USD">USD (US Dollar)</option>
                          <option value="EUR">EUR (Euro)</option>
                          <option value="GBP">GBP (British Pound)</option>
                          <option value="GHS">GHS (Ghanaian Cedi)</option>
                          <option value="ZAR">ZAR (South African Rand)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="paywallType"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Pricing Model
                      </label>
                      <select
                        id="paywallType"
                        value={newPaywallType}
                        onChange={e =>
                          setNewPaywallType(
                            e.target.value as 'fixed' | 'dynamic' | 'tiered' | 'subscription'
                          )
                        }
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="fixed">Fixed Price</option>
                        <option value="dynamic">Dynamic Pricing</option>
                        <option value="tiered">Tiered Pricing</option>
                        <option value="subscription">Subscription</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="paywallTheme"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Theme
                      </label>
                      <select
                        id="paywallTheme"
                        value={paywallTheme}
                        onChange={e => setPaywallTheme(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="default">Default</option>
                        <option value="premium">Premium</option>
                        <option value="minimal">Minimal</option>
                        <option value="feature-rich">Feature Rich</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="paywallLayout"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Layout
                      </label>
                      <select
                        id="paywallLayout"
                        value={paywallLayout}
                        onChange={e =>
                          setPaywallLayout(e.target.value as 'minimal' | 'feature-rich' | 'premium')
                        }
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="minimal">Minimal</option>
                        <option value="feature-rich">Feature Rich</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={createSmartPaywall}
                      disabled={selectedContent.length === 0 || !newPaywallTitle.trim()}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                      Create Smart Paywall
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Smart Paywalls */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Smart Paywalls
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {smartPaywalls.map(paywall => (
                  <div
                    key={paywall.id}
                    className="border border-gray-200 rounded-lg p-4 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {paywall.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {paywall.pricing.currency}
                          {paywall.pricing.basePrice} • {paywall.pricing.type}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          paywall.status === 'published'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : paywall.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {paywall.status.charAt(0).toUpperCase() + paywall.status.slice(1)}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Views</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {paywall.analytics.views}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Conversions</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {paywall.analytics.conversions}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Rate</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {paywall.analytics.conversionRate}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      {paywall.previewUrl && (
                        <a
                          href={paywall.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Preview
                        </a>
                      )}
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                      >
                        Publish
                      </button>
                    </div>
                  </div>
                ))}

                {smartPaywalls.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No smart paywalls yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Create your first smart paywall to monetize your content.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReimaginedContentWorkflow;
