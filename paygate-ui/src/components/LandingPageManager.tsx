import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  conversions: number;
  conversionRate: number;
  createdAt: string;
  updatedAt: string;
}

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
}

const LandingPageManager: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pages' | 'templates' | 'builder'>('pages');
  const [pages, setPages] = useState<Page[]>([]);
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockPages: Page[] = [
      {
        id: '1',
        title: 'Premium Course Launch',
        slug: 'premium-course',
        status: 'published',
        views: 2450,
        conversions: 124,
        conversionRate: 5.06,
        createdAt: '2023-05-15',
        updatedAt: '2023-07-20',
      },
      {
        id: '2',
        title: 'E-book Sales Page',
        slug: 'ebook-sales',
        status: 'published',
        views: 1890,
        conversions: 98,
        conversionRate: 5.19,
        createdAt: '2023-06-10',
        updatedAt: '2023-07-15',
      },
      {
        id: '3',
        title: 'Webinar Registration',
        slug: 'webinar-reg',
        status: 'draft',
        views: 0,
        conversions: 0,
        conversionRate: 0,
        createdAt: '2023-07-25',
        updatedAt: '2023-07-25',
      },
    ];

    const mockTemplates: PageTemplate[] = [
      {
        id: '1',
        name: 'Product Launch',
        description: 'Perfect for launching new products or services',
        category: 'sales',
        thumbnail: 'https://placehold.co/300x200/e2e8f0/64748b?text=Product+Launch',
      },
      {
        id: '2',
        name: 'Course Sales',
        description: 'Designed for online course sales',
        category: 'education',
        thumbnail: 'https://placehold.co/300x200/c7d2fe/4f46e5?text=Course+Sales',
      },
      {
        id: '3',
        name: 'Service Landing',
        description: 'Great for service-based businesses',
        category: 'services',
        thumbnail: 'https://placehold.co/300x200/d1fae5/059669?text=Service+Page',
      },
      {
        id: '4',
        name: 'Event Registration',
        description: 'Perfect for event and webinar signups',
        category: 'events',
        thumbnail: 'https://placehold.co/300x200/fecaca/dc2626?text=Event+Page',
      },
      {
        id: '5',
        name: 'Lead Generation',
        description: 'Optimized for collecting leads',
        category: 'leads',
        thumbnail: 'https://placehold.co/300x200/fef3c7/f59e0b?text=Lead+Gen',
      },
      {
        id: '6',
        name: 'App Showcase',
        description: 'Showcase your application or software',
        category: 'apps',
        thumbnail: 'https://placehold.co/300x200/dbeafe/3b82f6?text=App+Showcase',
      },
    ];

    setPages(mockPages);
    setTemplates(mockTemplates);
  }, []);

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setActiveTab('builder');
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Landing Pages</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'pages'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            My Pages
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'templates'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'builder'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Page Builder
          </button>
        </div>
      </div>

      {activeTab === 'pages' && (
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                My Landing Pages
              </h4>
              <button
                onClick={() => setActiveTab('templates')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Page
              </button>
            </div>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Views
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Conversions
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Conversion Rate
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {pages.map(page => (
                    <tr key={page.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                        {page.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            page.status === 'published'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : page.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {page.views.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {page.conversions}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {page.conversionRate.toFixed(2)}%
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => navigate(`/page/${page.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/page/${page.id}/edit`)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-900">
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
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Landing Page Tips
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use clear and compelling headlines</li>
                    <li>Include social proof and testimonials</li>
                    <li>Optimize for mobile devices</li>
                    <li>Test different versions with A/B testing</li>
                    <li>Minimize distractions and focus on the CTA</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div>
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-4 dark:text-white">
              Page Templates
            </h4>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow dark:border-gray-700"
                >
                  <div className="h-40 bg-gray-200 flex items-center justify-center">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h5 className="text-md font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {template.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Category: {template.category}</p>
                    <div className="mt-4">
                      <button
                        onClick={() => handleUseTemplate(template.id)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'builder' && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4 dark:text-white">Page Builder</h4>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center dark:border-gray-700">
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
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Build your landing page
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {selectedTemplate
                ? "You've selected a template. The page builder would open here to customize your page."
                : 'Start by selecting a template or create a blank page.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setActiveTab('templates')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Browse Templates
              </button>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 p-6 rounded-lg dark:bg-gray-700">
            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Page Builder Features
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-5 w-5 text-green-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Drag & drop components
                </p>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 h-5 w-5 text-green-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="ml-2 text-sm text-gray-700 dark:text-gray-300">Real-time preview</p>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 h-5 w-5 text-green-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="ml-2 text-sm text-gray-700 dark:text-gray-300">Mobile responsive</p>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 h-5 w-5 text-green-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="ml-2 text-sm text-gray-700 dark:text-gray-300">SEO optimization</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPageManager;
