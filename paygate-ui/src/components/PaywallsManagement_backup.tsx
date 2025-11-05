import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import type { Paywall } from '../services/paywallService';
import paywallService from '../services/paywallService';
import { useAppData } from '../contexts/AppDataContext';
import { CURRENCY_SYMBOLS } from '../utils/constants.utils';
import AnalyticsChart from './AnalyticsChart';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

interface PaywallPerformanceData {
  views: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

interface EmbedCodeData {
  id: string;
  title: string;
  url: string;
}

const PaywallsManagement: React.FC = () => {
  const { paywalls } = useAppData();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'revenue' | 'views'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPaywall, setSelectedPaywall] = useState<Paywall | null>(null);
  const [performanceData, setPerformanceData] = useState<Record<string, PaywallPerformanceData>>(
    {}
  );
  const [accessSettings, setAccessSettings] = useState<
    Record<string, { downloadLimit: number; expirationDays: number }>
  >({});
  const [embedCodes, setEmbedCodes] = useState<Record<string, EmbedCodeData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPaywalls, setSelectedPaywalls] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const itemsPerPage = 10; // Number of items to show per page

  // Fetch paywalls data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real implementation, we would fetch actual performance data
        // For now, we'll generate mock data
        const mockPerformanceData: Record<string, PaywallPerformanceData> = {};
        const mockAccessSettings: Record<
          string,
          { downloadLimit: number; expirationDays: number }
        > = {};
        const mockEmbedCodes: Record<string, EmbedCodeData> = {};

        (paywalls?.paywalls || []).forEach(paywall => {
          if (!paywall) return; // Skip undefined paywalls

          mockPerformanceData[paywall.id] = {
            views: Math.floor(Math.random() * 1000) + 100,
            conversions: Math.floor(Math.random() * 100) + 10,
            conversionRate: parseFloat((Math.random() * 20 + 1).toFixed(2)),
            revenue: paywall.revenue || 0,
          };

          mockAccessSettings[paywall.id] = {
            downloadLimit: 5,
            expirationDays: 30,
          };

          mockEmbedCodes[paywall.id] = {
            id: paywall.id,
            title: paywall.title || 'Untitled Paywall',
            url: `${window.location.origin}/p/${paywall.id}`,
          };
        });

        setPerformanceData(mockPerformanceData);
        setAccessSettings(mockAccessSettings);
        setEmbedCodes(mockEmbedCodes);
      } catch (err: unknown) {
        console.error('Error fetching data:', err);
        if (isAxiosError(err)) {
          setError(err.message || 'Failed to load paywalls data');
        } else {
          setError('Failed to load paywalls data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (paywalls && paywalls.paywalls) {
      fetchData();
    }
  }, [paywalls]);

  const filteredAndSortedPaywalls = (paywalls?.paywalls || [])
    .filter(paywall => {
      // Filter out undefined/null paywalls first
      if (!paywall) return false;

      // Filter by status
      if (activeTab !== 'all' && paywall.status !== activeTab) {
        return false;
      }

      // Filter by search term - with null checks
      return (
        (paywall.title && paywall.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (paywall.description &&
          paywall.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    .sort((a, b) => {
      // Add null checks for sort comparison
      if (!a || !b) return 0;

      let comparison = 0;
      switch (sortBy) {
        case 'revenue':
          comparison = (a.revenue || 0) - (b.revenue || 0);
          break;
        case 'views':
          comparison = (performanceData[a.id]?.views || 0) - (performanceData[b.id]?.views || 0);
          break;
        case 'createdAt':
        default:
          comparison =
            new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: 'createdAt' | 'revenue' | 'views') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: 'createdAt' | 'revenue' | 'views') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Bulk selection handlers
  const toggleSelectPaywall = (paywallId: string) => {
    setSelectedPaywalls(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(paywallId)) {
        newSelected.delete(paywallId);
      } else {
        newSelected.add(paywallId);
      }
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPaywalls.size === filteredAndSortedPaywalls.length) {
      setSelectedPaywalls(new Set());
    } else {
      setSelectedPaywalls(new Set(filteredAndSortedPaywalls.map(p => p.id)));
    }
  };

  const handleBulkArchive = async () => {
    if (selectedPaywalls.size === 0) return;
    
    const paywallsToArchive = filteredAndSortedPaywalls.filter(p => selectedPaywalls.has(p.id));
    for (const paywall of paywallsToArchive) {
      try {
        await paywallService.updatePaywall(paywall.id, {
          ...paywall,
          status: 'archived',
        });
      } catch (err: unknown) {
        console.error('Error archiving paywall:', err);
      }
    }
    
    if (paywalls?.refreshPaywalls) {
      paywalls.refreshPaywalls();
    }
    setSelectedPaywalls(new Set());
  };

  const handleBulkActivate = async () => {
    if (selectedPaywalls.size === 0) return;
    
    const paywallsToActivate = filteredAndSortedPaywalls.filter(p => selectedPaywalls.has(p.id));
    for (const paywall of paywallsToActivate) {
      try {
        await paywallService.updatePaywall(paywall.id, {
          ...paywall,
          status: 'published',
        });
      } catch (err: unknown) {
        console.error('Error activating paywall:', err);
      }
    }
    
    if (paywalls?.refreshPaywalls) {
      paywalls.refreshPaywalls();
    }
    setSelectedPaywalls(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedPaywalls.size === 0) return;
    
    const paywallsToDelete = filteredAndSortedPaywalls.filter(p => selectedPaywalls.has(p.id));
    if (!window.confirm(`Are you sure you want to delete ${paywallsToDelete.length} paywall(s)?`)) {
      return;
    }
    
    for (const paywall of paywallsToDelete) {
      try {
        await paywallService.deletePaywall(paywall.id);
      } catch (err: unknown) {
        console.error('Error deleting paywall:', err);
      }
    }
    
    if (paywalls?.refreshPaywalls) {
      paywalls.refreshPaywalls();
    }
    setSelectedPaywalls(new Set());
  };

  const handleDuplicatePaywall = async (paywall: Paywall) => {
    try {
      if (!paywall || !paywall.id) {
        throw new Error('Cannot duplicate undefined paywall');
      }

      const newPaywallData = {
        title: `${paywall.title || 'Untitled Paywall'} (Copy)`,
        description: paywall.description,
        price: paywall.price,
        currency: paywall.currency,
        thumbnailUrl: paywall.thumbnailUrl,
        type: paywall.type,
        contentId: paywall.contentId,
        url: paywall.url,
        tags: paywall.tags,
        status: 'draft' as const,
        pricingModel: paywall.pricingModel || 'one-time',
      };

      const newPaywall = await paywallService.createPaywall(newPaywallData);
      if (paywalls?.refreshPaywalls) {
        paywalls.refreshPaywalls();
      }
      navigate(`/edit-paywall/${newPaywall.id}`);
    } catch (err: unknown) {
      console.error('Error duplicating paywall:', err);
      if (isAxiosError(err)) {
        setError(err.message || 'Failed to duplicate paywall');
      } else {
        setError('Failed to duplicate paywall');
      }
    }
  };

  const handleArchivePaywall = async (paywall: Paywall) => {
    try {
      if (!paywall || !paywall.id) {
        throw new Error('Cannot archive undefined paywall');
      }

      await paywallService.updatePaywall(paywall.id, {
        ...paywall,
        status: 'archived',
      });
      if (paywalls?.refreshPaywalls) {
        paywalls.refreshPaywalls();
      }
    } catch (err: unknown) {
      console.error('Error archiving paywall:', err);
      if (isAxiosError(err)) {
        setError(err.message || 'Failed to archive paywall');
      } else {
        setError('Failed to archive paywall');
      }
    }
  };

  const handleDeletePaywall = async (paywall: Paywall) => {
    if (!window.confirm('Are you sure you want to delete this paywall?')) {
      return;
    }
    
    try {
      if (!paywall || !paywall.id) {
        throw new Error('Cannot delete undefined paywall');
      }

      await paywallService.deletePaywall(paywall.id);
      if (paywalls?.refreshPaywalls) {
        paywalls.refreshPaywalls();
      }
    } catch (err: unknown) {
      console.error('Error deleting paywall:', err);
      if (isAxiosError(err)) {
        setError(err.message || 'Failed to delete paywall');
      } else {
        setError('Failed to delete paywall');
      }
    }
  };

  const handleSharePaywall = (paywall: Paywall) => {
    const url = `${window.location.origin}/p/${paywall.id}`;
    navigator.clipboard.writeText(url);
    alert('Paywall link copied to clipboard!');
  };

  const handleCopyEmbedCode = (paywallId: string) => {
    const embedCode = `<iframe src="${embedCodes[paywallId]?.url}" width="100%" height="500" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied to clipboard!');
  };

  const updateAccessSettings = (
    paywallId: string,
    settings: { downloadLimit: number; expirationDays: number }
  ) => {
    setAccessSettings(prev => ({
      ...prev,
      [paywallId]: settings,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Paywalls Management" subtitle="Manage all your monetized content" />
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Paywalls Management" subtitle="Manage all your monetized content" />
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
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
                      Error loading paywalls
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error}</p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:text-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const headerActions = (
    <div className="flex space-x-3">
      <Link to="/create-paywall">
        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600">
          Create New Paywall
        </button>
      </Link>
      <Link to="/mock-paywalls">
        <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-purple-500 dark:hover:bg-purple-600">
          Add Mock Paywalls
        </button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Paywalls Management"
        subtitle="Manage all your monetized content"
        actions={headerActions}
      />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Filter Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'all'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    All Paywalls
                  </button>
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'active'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setActiveTab('draft')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'draft'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Drafts
                  </button>
                  <button
                    onClick={() => setActiveTab('archived')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'archived'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Archived
                  </button>
                </nav>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedPaywalls.size > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {selectedPaywalls.size} paywall{selectedPaywalls.size > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleBulkActivate}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:text-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                    >
                      Activate
                    </button>
                    <button
                      onClick={handleBulkArchive}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:text-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50"
                    >
                      Archive
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:text-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedPaywalls(new Set())}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Your Paywalls
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage all your content paywalls
                  </p>
                </div>
                <div className="mt-4 md:mt-0 md:ml-4 flex space-x-3">
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="Search paywalls..."
                    />
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <svg
                            className="h-5 w-5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 6h16M4 10h16M4 14h16M4 18h16"
                            />
                          </svg>
                          List
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-5 w-5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                          </svg>
                          Grid
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value as 'createdAt' | 'revenue' | 'views');
                        setSortOrder('desc');
                      }}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="createdAt">Sort by Date</option>
                      <option value="revenue">Sort by Revenue</option>
                      <option value="views">Sort by Views</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {filteredAndSortedPaywalls.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center dark:bg-gray-800 dark:shadow-gray-900/50">
                {/* Empty State with Illustration */}
                <div className="mx-auto flex justify-center">
                  <svg 
                    className="w-24 h-24 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="1.5" 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Create your first paywall
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by creating your first paywall to monetize your content.
                </p>
                <div className="mt-6">
                  <Link
                    to="/create-paywall"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
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
                    Create Paywall
                  </Link>
                </div>
                <div className="mt-4">
                  <a 
                    href="#" 
                    className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Getting started guide would open here');
                    }}
                  >
                    Need help getting started?
                  </a>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedPaywalls.map(paywall => (
                  <div
                    key={paywall.id}
                    className="border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 dark:border-gray-700 dark:bg-gray-700/50"
                  >
                    {/* Checkbox for bulk selection */}
                    <div className="absolute top-3 left-3">
                      <input
                        type="checkbox"
                        checked={selectedPaywalls.has(paywall.id)}
                        onChange={() => toggleSelectPaywall(paywall.id)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    
                    <div className="p-5 pt-6">
                      {/* Thumbnail/preview image */}
                      <div className="mb-4">
                        {paywall.thumbnailUrl ? (
                          <img 
                            src={paywall.thumbnailUrl} 
                            alt={paywall.title || 'Paywall thumbnail'} 
                            className="w-full h-40 object-cover rounded-md"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-40 flex items-center justify-center dark:bg-gray-700">
                            <svg 
                              className="h-10 w-10 text-gray-400" 
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
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-start">
                        <Link
                          to={`/paywall/${paywall.id}`}
                          className="text-lg font-medium text-indigo-600 hover:text-indigo-900 truncate dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          {paywall.title || 'Untitled Paywall'}
                        </Link>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(paywall.status || 'draft')}`}
                        >
                          {(paywall.status || '').charAt(0).toUpperCase() +
                            (paywall.status || '').slice(1)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
                          {paywall.description || 'No description provided'}
                        </p>
                      </div>
                      
                      {/* Price */}
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {CURRENCY_SYMBOLS[paywall.currency || '']}
                            {typeof paywall.price === 'number' ? paywall.price.toFixed(2) : '0.00'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Stats: Views, Purchases, Revenue */}
                      {performanceData[paywall.id] && (
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                          <div className="px-2 py-1 bg-gray-50 rounded dark:bg-gray-600/50">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {performanceData[paywall.id]?.views || 0}
                            </p>
                          </div>
                          <div className="px-2 py-1 bg-gray-50 rounded dark:bg-gray-600/50">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Purchases</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {paywall.sales || 0}
                            </p>
                          </div>
                          <div className="px-2 py-1 bg-gray-50 rounded dark:bg-gray-600/50">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {CURRENCY_SYMBOLS[paywall.currency || '']}
                              {typeof paywall.revenue === 'number'
                                ? paywall.revenue.toFixed(2)
                                : '0.00'}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Quick Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleSharePaywall(paywall)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                          title="Share"
                        >
                          <svg 
                            className="h-4 w-4 mr-1" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                          </svg>
                          Share
                        </button>
                        <Link
                          to={`/edit-paywall/${paywall.id}`}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          <svg 
                            className="h-4 w-4 mr-1" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDuplicatePaywall(paywall)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                          title="Duplicate"
                        >
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleArchivePaywall(paywall)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-200 dark:hover:bg-yellow-900/50"
                          title="Archive"
                        >
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                            />
                          </svg>
                          Archive
                        </button>
                        <button
                          onClick={() => handleCopyEmbedCode(paywall.id)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200 dark:hover:bg-blue-900/50"
                          title="Copy Link"
                        >
                          <svg 
                            className="h-4 w-4 mr-1" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                          Copy Link
                        </button>
                        <button
                          onClick={() => handleDeletePaywall(paywall)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900/50"
                          title="Delete"
                        >
                          <svg 
                            className="h-4 w-4 mr-1" 
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
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="bg-white shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
                <div className="overflow-x-auto">
                  {/* Management Tools Section - moved to top of table section */}
                  <div className="mt-8 bg-white shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Management Tools
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Tools to help you manage your paywalls effectively
                      </p>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6 dark:border-gray-700">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                              <svg
                                className="h-6 w-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                Quick Create
                              </h4>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Create new paywalls quickly with our simplified flow
                              </p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Link
                              to="/create-paywall"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                            >
                              Create Paywall
                            </Link>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6 dark:border-gray-700">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                              <svg
                                className="h-6 w-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                Access Settings
                              </h4>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Configure download limits and expiration dates
                              </p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => alert('Access settings would be configured here')}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                              Configure
                            </button>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-6 dark:border-gray-700">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                              <svg
                                className="h-6 w-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                Embed Codes
                              </h4>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Get embeddable widgets for your websites and blogs
                              </p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => alert('Embed codes would be generated here')}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                              Generate
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* End Management Tools Section */}

                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={filteredAndSortedPaywalls.length > 0 && selectedPaywalls.size === filteredAndSortedPaywalls.length}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 cursor-pointer"
                          onClick={() => handleSort('title')}
                        >
                          <div className="flex items-center">
                            Paywall
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 cursor-pointer"
                          onClick={() => handleSort('createdAt')}
                        >
                          <div className="flex items-center">
                            Date
                            <span className="ml-1">{getSortIcon('createdAt')}</span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                        >
                          Stats
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 cursor-pointer"
                          onClick={() => handleSort('revenue')}
                        >
                          <div className="flex items-center">
                            Revenue
                            <span className="ml-1">{getSortIcon('revenue')}</span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {(() => {
                        // Calculate which paywalls to show on the current page
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedPaywalls = filteredAndSortedPaywalls.slice(
                          startIndex,
                          endIndex
                        );

                        return paginatedPaywalls.map(paywall => (
                          <tr
                            key={paywall.id}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedPaywalls.has(paywall.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedPaywalls.has(paywall.id)}
                                onChange={() => toggleSelectPaywall(paywall.id)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {paywall.thumbnailUrl ? (
                                    <img 
                                      src={paywall.thumbnailUrl} 
                                      alt={paywall.title || 'Paywall thumbnail'} 
                                      className="h-10 w-10 rounded-md object-cover"
                                    />
                                  ) : (
                                    <div className="bg-gray-200 border-2 border-dashed rounded-md w-10 h-10 flex items-center justify-center dark:bg-gray-700">
                                      <svg 
                                        className="h-5 w-5 text-gray-400" 
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
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {paywall.title || 'Untitled Paywall'}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                    {paywall.description || 'No description'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(paywall.createdAt || '').toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <span className="w-20 text-gray-500 dark:text-gray-400">Views:</span>
                                  <span className="font-medium">{performanceData[paywall.id]?.views || 0}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-20 text-gray-500 dark:text-gray-400">Purchases:</span>
                                  <span className="font-medium">{paywall.sales || 0}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-medium">
                                {CURRENCY_SYMBOLS[paywall.currency || '']}
                                {typeof paywall.revenue === 'number'
                                  ? paywall.revenue.toFixed(2)
                                  : '0.00'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(paywall.status || 'draft')}`}
                              >
                                {(paywall.status || '').charAt(0).toUpperCase() +
                                  (paywall.status || '').slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Link
                                  to={`/edit-paywall/${paywall.id}`}
                                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                  title="Edit"
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
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </Link>
                                <button
                                  onClick={() => handleSharePaywall(paywall)}
                                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                  title="Share"
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
                                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDuplicatePaywall(paywall)}
                                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                  title="Duplicate"
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
                                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleCopyEmbedCode(paywall.id)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Copy Link"
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
                                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleArchivePaywall(paywall)}
                                  className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                  title="Archive"
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
                                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeletePaywall(paywall)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  title="Delete"
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
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600'
                          : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage(prev =>
                          Math.min(
                            prev + 1,
                            Math.ceil(filteredAndSortedPaywalls.length / itemsPerPage)
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                          Math.ceil(filteredAndSortedPaywalls.length / itemsPerPage) ||
                        filteredAndSortedPaywalls.length === 0
                      }
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage ===
                          Math.ceil(filteredAndSortedPaywalls.length / itemsPerPage) ||
                        filteredAndSortedPaywalls.length === 0
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600'
                          : 'text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Showing{' '}
                        <span className="font-medium">
                          {Math.min(
                            (currentPage - 1) * itemsPerPage + 1,
                            filteredAndSortedPaywalls.length
                          )}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, filteredAndSortedPaywalls.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredAndSortedPaywalls.length}</span>{' '}
                        results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? 'text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600'
                              : 'text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {/* Page numbers */}
                        {Array.from(
                          {
                            length: Math.min(
                              5,
                              Math.ceil(filteredAndSortedPaywalls.length / itemsPerPage)
                            ),
                          },
                          (_, i) => {
                            // Calculate visible page range
                            const totalPages = Math.ceil(
                              filteredAndSortedPaywalls.length / itemsPerPage
                            );
                            let startPage = Math.max(1, currentPage - 2);
                            const endPage = Math.min(totalPages, startPage + 4);

                            if (endPage - startPage < 4) {
                              startPage = Math.max(1, endPage - 4);
                            }

                            const pageIndex = startPage + i;
                            if (pageIndex > totalPages) return null;

                            return (
                              <button
                                key={pageIndex}
                                onClick={() => setCurrentPage(pageIndex)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === pageIndex
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500 dark:text-indigo-300'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600'
                                }`}
                              >
                                {pageIndex}
                              </button>
                            );
                          }
                        )}

                        <button
                          onClick={() =>
                            setCurrentPage(prev =>
                              Math.min(
                                prev + 1,
                                Math.ceil(filteredAndSortedPaywalls.length / itemsPerPage)
                              )
                            )
                          }
                          disabled={
                            currentPage ===
                              Math.ceil(filteredAndSortedPaywalls.length / itemsPerPage) ||
                            filteredAndSortedPaywalls.length === 0
                          }
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage ===
                              Math.ceil(filteredAndSortedPaywalls.length / itemsPerPage) ||
                            filteredAndSortedPaywalls.length === 0
                              ? 'text-gray-400 bg-gray-100 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600'
                              : 'text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
                {/* End Pagination Controls */}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaywallsManagement;