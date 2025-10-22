import React, { useState, useEffect } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import contentService from '../services/contentService';
import type { ContentItem } from '../types/content.types';

const DragDropContentManager: React.FC = () => {
  const { content: contentData } = useAppData();
  const { refreshContent: fetchContent } = contentData;
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [protectedContent, setProtectedContent] = useState<ContentItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    if (contentData.content && Array.isArray(contentData.content)) {
      const allContent = contentData.content as ContentItem[];
      setContentItems(allContent.filter(item => !item.isProtected));
      setProtectedContent(allContent.filter(item => item.isProtected));
    }
  }, [contentData]);

  const handleDragStart = (e: React.DragEvent, item: ContentItem) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetList: 'unprotected' | 'protected') => {
    e.preventDefault();

    if (!draggedItem) return;

    if (targetList === 'protected' && !draggedItem.isProtected) {
      // Move from unprotected to protected
      setContentItems(prev => prev.filter(item => item.id !== draggedItem.id));
      setProtectedContent(prev => [...prev, { ...draggedItem, isProtected: true }]);
      toggleProtection(draggedItem.id, true);
    } else if (targetList === 'unprotected' && draggedItem.isProtected) {
      // Move from protected to unprotected
      setProtectedContent(prev => prev.filter(item => item.id !== draggedItem.id));
      setContentItems(prev => [...prev, { ...draggedItem, isProtected: false }]);
      toggleProtection(draggedItem.id, false);
    }

    setDraggedItem(null);
  };

  const toggleProtection = async (contentId: string, isProtected: boolean) => {
    try {
      await contentService.updateContentProtection(contentId, { isProtected });
      // Refresh content after update
      fetchContent();
    } catch (error) {
      console.error('Error toggling content protection:', error);
      // Revert UI changes if API call fails
      fetchContent();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Unprotected Content
        </h3>
        <div
          className="bg-f9fafb p-4 w-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg"
          onDragOver={handleDragOver}
          onDrop={e => handleDrop(e, 'protected')}
        >
          {contentItems.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={e => handleDragStart(e, item)}
              className="p-3 mb-2 bg-white border border-gray-200 rounded-md cursor-move hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 flex justify-between items-center"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {item.description}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {item.type} • {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.isProtected
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {item.isProtected ? 'Protected' : 'Public'}
                </span>
              </div>
            </div>
          ))}
          {contentItems.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No unprotected content
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Protected Content
        </h3>
        <div
          className="bg-f9fafb p-4 w-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg"
          onDragOver={handleDragOver}
          onDrop={e => handleDrop(e, 'unprotected')}
        >
          {protectedContent.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={e => handleDragStart(e, item)}
              className="p-3 mb-2 bg-white border border-gray-200 rounded-md cursor-move hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 flex justify-between items-center"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {item.description}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {item.type} • {new Date(item.createdAt).toLocaleDateString()}
                  {item.price && ` • ${item.currency || 'NGN'}${item.price}`}
                </div>
              </div>
              <div className="flex items-center">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.isProtected
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {item.isProtected ? 'Protected' : 'Public'}
                </span>
              </div>
            </div>
          ))}
          {protectedContent.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No protected content
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DragDropContentManager;
