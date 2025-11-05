import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import customerService from '../services/customerService';
import type { Paywall } from '../services/paywallService';
import { useAppData } from '../contexts/AppDataContext';
import type { Customer, CustomerSegment } from '../services/customerService';

interface Customer {
  id: string;
  name: string;
  email: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseDate: string;
  status: 'Active subscriber' | 'One-time buyer';
  purchases: Array<{
    id: string;
    paywallId: string;
    paywallTitle: string;
    amount: number;
    date: string;
  }>;
  communicationHistory: Array<{
    id: string;
    date: string;
    type: string;
    content: string;
  }>;
  notes: string[];
}

interface CustomerSegment {
  id: string;
  name: string;
  count: number;
  customers: Customer[];
}

const CustomersPage: React.FC = () => {
  const { paywalls } = useAppData();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'All' | 'Recent' | 'Top Spenders' | 'Subscribed'>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch customer data from the backend
  useEffect(() => {
    const loadCustomerData = async () => {
      setLoading(true);
      try {
        // Get customers from the backend
        const backendCustomers = await customerService.getCustomers();
        
        // Transform backend customers to UI format
        const transformedCustomers = backendCustomers.map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          totalPurchases: customer.totalPurchases,
          totalSpent: customer.totalSpent,
          lastPurchaseDate: customer.lastPurchase,
          status: customer.status === 'active' ? 'Active subscriber' : 'One-time buyer',
          purchases: [], // Backend doesn't provide detailed purchase history in this endpoint
          communicationHistory: [], // Backend doesn't provide communication history in this endpoint
          notes: [] // Notes would need a separate endpoint or be included in the customer object
        }));
        
        setCustomers(transformedCustomers);
        setFilteredCustomers(transformedCustomers);
      } catch (error) {
        console.error('Error loading customer data:', error);
        setError('Failed to load customer data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
  }, []);

  // Filter customers based on search term and filter selection
  useEffect(() => {
    let result = customers;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filter !== 'All') {
      switch (filter) {
        case 'Recent':
          // Show customers with purchases in the last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          result = result.filter(customer => 
            new Date(customer.lastPurchaseDate) >= thirtyDaysAgo
          );
          break;
        case 'Top Spenders':
          // Show top 20% spenders
          const sorted = [...result].sort((a, b) => b.totalSpent - a.totalSpent);
          const topIndex = Math.ceil(sorted.length * 0.2);
          const topSpenders = sorted.slice(0, topIndex).map(c => c.id);
          result = result.filter(customer => topSpenders.includes(customer.id));
          break;
        case 'Subscribed':
          result = result.filter(customer => customer.status === 'Active subscriber');
          break;
      }
    }

    setFilteredCustomers(result);
  }, [searchTerm, filter, customers]);

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleSendMessage = (customer: Customer) => {
    alert(`Sending message to ${customer.email}...`);
  };

  const handleRefund = (customer: Customer) => {
    alert(`Initiating refund for ${customer.name}...`);
  };

  const handleAddNote = () => {
    if (!selectedCustomer || !newNote.trim()) return;

    const updatedCustomer = {
      ...selectedCustomer,
      notes: [...selectedCustomer.notes, newNote.trim()]
    };

    setSelectedCustomer(updatedCustomer);

    // Update in main list
    setCustomers(prev => 
      prev.map(c => c.id === selectedCustomer.id ? updatedCustomer : c)
    );

    setNewNote('');
  };

  const handleGrantAccess = () => {
    if (!selectedCustomer) return;
    alert(`Granting access to ${selectedCustomer.name}...`);
  };

  const handleRevokeAccess = () => {
    if (!selectedCustomer) return;
    alert(`Revoking access from ${selectedCustomer.name}...`);
  };

  const handleIssueRefund = () => {
    if (!selectedCustomer) return;
    alert(`Issuing refund to ${selectedCustomer.name}...`);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active subscriber':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'One-time buyer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Customers" subtitle="Manage customer relationships and purchase history" />
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
        <Header title="Customers" subtitle="Manage customer relationships and purchase history" />
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
                      Error loading customers
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Customers" subtitle="Manage customer relationships and purchase history" />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Controls Section */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Customer List
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage all your customers and their purchase history
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
                      placeholder="Search customers..."
                    />
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await customerService.exportCustomers();
                      } catch (error) {
                        console.error('Error exporting customers:', error);
                        alert('Failed to export customers. Please try again.');
                      }
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setFilter('All')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      filter === 'All'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('Recent')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      filter === 'Recent'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Recent
                  </button>
                  <button
                    onClick={() => setFilter('Top Spenders')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      filter === 'Top Spenders'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Top Spenders
                  </button>
                  <button
                    onClick={() => setFilter('Subscribed')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      filter === 'Subscribed'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Subscribed
                  </button>
                </nav>
              </div>
            </div>

            {/* Customer Segments */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Customer Segments</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3 dark:bg-yellow-900/30">
                      <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">VIP Customers</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3 dark:bg-blue-900/30">
                      <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Buyers</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-100 rounded-md p-3 dark:bg-gray-700">
                      <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inactive</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3 dark:bg-green-900/30">
                      <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscribers</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer List Table */}
            <div className="bg-white shadow rounded-lg dark:bg-gray-800 dark:shadow-gray-900/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                      >
                        Customer
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                      >
                        Total Purchases
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                      >
                        Total Spent
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                      >
                        Last Purchase
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
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(customer => (
                        <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 dark:bg-gray-700 flex items-center justify-center">
                                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                                    {customer.name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {customer.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {customer.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {customer.totalPurchases}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">
                              ${customer.totalSpent.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(customer.lastPurchaseDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(customer.status)}`}
                            >
                              {customer.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleViewDetails(customer)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                title="View Details"
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
                                onClick={() => handleSendMessage(customer)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Send Message"
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
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleRefund(customer)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Refund"
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
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center dark:text-gray-400">
                          No customers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Detail Modal */}
        {showDetailModal && selectedCustomer && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Customer Details: {selectedCustomer.name}
                  </h3>
                  <button 
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg 
                      className="h-6 w-6" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Contact Information</h4>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <p><span className="font-medium">Name:</span> {selectedCustomer.name}</p>
                        <p><span className="font-medium">Email:</span> {selectedCustomer.email}</p>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Purchase Summary</h4>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <p><span className="font-medium">Total Purchases:</span> {selectedCustomer.totalPurchases}</p>
                        <p><span className="font-medium">Total Spent:</span> ${selectedCustomer.totalSpent.toFixed(2)}</p>
                        <p><span className="font-medium">Revenue Generated:</span> ${selectedCustomer.totalSpent.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Purchase History</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                              Paywall
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                              Amount
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                          {selectedCustomer.purchases.map(purchase => (
                            <tr key={purchase.id}>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {purchase.paywallTitle}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                ${purchase.amount.toFixed(2)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                {new Date(purchase.date).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Communication History</h4>
                    <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                      {selectedCustomer.communicationHistory.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedCustomer.communicationHistory.map(comm => (
                            <li key={comm.id} className="text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-medium">{new Date(comm.date).toLocaleDateString()}</span> - 
                              <span className="ml-2">{comm.type}:</span> {comm.content}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No communication history</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
                    <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                      {selectedCustomer.notes.length > 0 ? (
                        <ul className="space-y-1">
                          {selectedCustomer.notes.map((note, index) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                              • {note}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No notes yet</p>
                      )}
                      <div className="mt-3 flex">
                        <input
                          type="text"
                          value={newNote}
                          onChange={e => setNewNote(e.target.value)}
                          placeholder="Add a note..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button
                          onClick={handleAddNote}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleGrantAccess}
                        className="px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600"
                      >
                        Grant Access
                      </button>
                      <button
                        onClick={handleRevokeAccess}
                        className="px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
                      >
                        Revoke Access
                      </button>
                      <button
                        onClick={handleIssueRefund}
                        className="px-3 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                      >
                        Issue Refund
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomersPage;