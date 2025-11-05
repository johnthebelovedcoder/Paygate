import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import paywallService, { type CreatePaywallData } from '../services/paywallService';

const MockPaywallCreator: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const createMockPaywalls = async () => {
    setIsCreating(true);
    try {
      const mockPaywalls: CreatePaywallData[] = [
        {
          title: 'Premium Content Access',
          description: 'Unlock access to premium content and resources',
          price: 29.99,
          currency: 'USD',
          thumbnailUrl: 'https://placehold.co/300x200/4f46e5/white?text=Premium',
          type: 'content',
          contentId: 'content-1',
          url: 'https://example.com/premium',
          tags: ['premium', 'content'],
          status: 'published',
          pricingModel: 'one-time',
          buttonText: 'Unlock Now',
          brandColor: '#4f46e5'
        },
        {
          title: 'Exclusive Video Series',
          description: 'Access to our exclusive video series',
          price: 49.99,
          currency: 'USD',
          thumbnailUrl: 'https://placehold.co/300x200/ec4899/white?text=Videos',
          type: 'video',
          contentId: 'video-1',
          url: 'https://example.com/videos',
          tags: ['video', 'exclusive'],
          status: 'published',
          pricingModel: 'one-time',
          buttonText: 'Watch Now',
          brandColor: '#ec4899'
        },
        {
          title: 'Document Package',
          description: 'Download our premium document package',
          price: 19.99,
          currency: 'USD',
          thumbnailUrl: 'https://placehold.co/300x200/0ea5e9/white?text=Docs',
          type: 'document',
          contentId: 'doc-1',
          url: 'https://example.com/documents',
          tags: ['documents', 'pdf'],
          status: 'draft',
          pricingModel: 'one-time',
          buttonText: 'Download Now',
          brandColor: '#0ea5e9'
        },
        {
          title: 'Monthly Subscription',
          description: 'Subscribe monthly for ongoing access',
          price: 9.99,
          currency: 'USD',
          thumbnailUrl: 'https://placehold.co/300x200/10b981/white?text=Monthly',
          type: 'content',
          contentId: 'sub-1',
          url: 'https://example.com/subscription',
          tags: ['subscription', 'monthly'],
          status: 'published',
          pricingModel: 'subscription',
          buttonText: 'Subscribe',
          brandColor: '#10b981'
        },
        {
          title: 'Pay-What-You-Want Ebook',
          description: 'Our popular ebook with flexible pricing',
          price: 0,
          minimumAmount: 5,
          currency: 'USD',
          thumbnailUrl: 'https://placehold.co/300x200/f97316/white?text=Ebook',
          type: 'document',
          contentId: 'ebook-1',
          url: 'https://example.com/ebook',
          tags: ['ebook', 'flexible'],
          status: 'published',
          pricingModel: 'pay-what-you-want',
          buttonText: 'Pay & Download',
          brandColor: '#f97316'
        }
      ];

      // Create each mock paywall
      for (const paywallData of mockPaywalls) {
        await paywallService.createPaywall(paywallData);
        console.log(`Created paywall: ${paywallData.title}`);
      }

      alert(`Successfully created ${mockPaywalls.length} mock paywalls!`);
      navigate('/paywalls');
    } catch (error) {
      console.error('Error creating mock paywalls:', error);
      alert('Error creating mock paywalls. Please check the console for details.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Create Mock Paywalls" subtitle="Add sample paywalls for testing purposes" />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-8 dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Create Mock Paywalls
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This will create 5 sample paywalls with different configurations to test your management interface.
              </p>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">What will be created:</h4>
                  <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <li>1 Premium Content Access (published)</li>
                    <li>1 Exclusive Video Series (published)</li>
                    <li>1 Document Package (draft)</li>
                    <li>1 Monthly Subscription (published)</li>
                    <li>1 Pay-What-You-Want Ebook (published)</li>
                  </ul>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="confirmation"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="confirmation" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    I understand this will create sample paywalls in the system
                  </label>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={createMockPaywalls}
                    disabled={isCreating}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    {isCreating ? 'Creating...' : 'Create Mock Paywalls'}
                  </button>
                  
                  <button
                    onClick={() => navigate('/paywalls')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white shadow rounded-lg p-8 dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Manual Paywall Creation
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                If you prefer to create paywalls manually, use the button below:
              </p>
              <button
                onClick={() => navigate('/create-paywall')}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600"
              >
                Create Paywall Manually
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MockPaywallCreator;