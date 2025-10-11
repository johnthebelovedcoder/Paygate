import React, { useState } from 'react';
import { useAppData } from '../contexts';
import type { ContentItem } from '../types/content.types';
import EmptyState from './EmptyState';

interface ContentSelectorProps {
  selectedContent: ContentItem[];
  onContentSelect: (content: ContentItem[]) => void;
}

const ContentSelector: React.FC<ContentSelectorProps> = ({ selectedContent, onContentSelect }) => {
  const { content } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter content items - show all content, not just published
  const filteredItems =
    (content.content || [])?.filter(item => {
      // Filter out undefined/null items first
      if (!item) return false;

      const matchesSearch =
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    }) || [];

  const toggleContentSelection = (item: ContentItem) => {
    if (!item || !item.id) return; // Guard against undefined items

    const isSelected = selectedContent.some(selected => selected.id === item.id);

    if (isSelected) {
      // Remove from selection
      onContentSelect(selectedContent.filter(selected => selected.id !== item.id));
    } else {
      // Add to selection
      onContentSelect([...selectedContent, item]);
    }
  };

  const isContentSelected = (id: string) => {
    return selectedContent.some(item => item.id === id);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
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

      {/* Content Items */}
      {content.loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : content.error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-900">
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
                <p>{content.error}</p>
              </div>
            </div>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No content found"
          description="Try adjusting your search or upload your first piece of content."
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
        <div className="border border-gray-200 rounded-md dark:border-gray-700">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {filteredItems
              .filter(item => item && item.id)
              .map(item => (
                <li key={item.id} className="relative">
                  <div className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={isContentSelected(item.id)}
                      onChange={() => toggleContentSelection(item)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <div className="ml-3 flex items-center min-w-0 flex-1">
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
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate dark:text-white">
                          {item.title || 'Untitled Content'}
                        </div>
                        {item.description && (
                          <div className="text-sm text-gray-500 truncate dark:text-gray-400">
                            {item.description}
                          </div>
                        )}
                        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            {(item.type || '').toUpperCase()}
                          </span>
                          {item.size && <span className="ml-2">{item.size}</span>}
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                            {item.status || 'draft'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ContentSelector;
