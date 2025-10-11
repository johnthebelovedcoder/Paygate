import React, { useState, useEffect } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import contentService from '../services/contentService';
import type { ContentItem } from '../types/content.types';
import paywallService, { type CreatePaywallData } from '../services/paywallService';

interface PaywallTemplate {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  style?: string;
  contentItems: ContentItem[];
}

const ContentToPaywallWorkflow: React.FC = () => {
  const { content: contentData, paywalls: paywallsData } = useAppData();
  const { refreshContent } = contentData;
  const { refreshPaywalls } = paywallsData;
  const [availableContent, setAvailableContent] = useState<ContentItem[]>([]);
  const [paywallTemplates, setPaywallTemplates] = useState<PaywallTemplate[]>([]);
  const [newPaywallTitle, setNewPaywallTitle] = useState('');
  const [newPaywallPrice, setNewPaywallPrice] = useState(0);
  const [newPaywallCurrency, setNewPaywallCurrency] = useState('NGN');
  const [draggedItem, setDraggedItem] = useState<{ item: ContentItem; source: string } | null>(
    null
  );
  const [isDraggingOverAvailable, setIsDraggingOverAvailable] = useState(false);
  const [isDraggingOverPaywall, setIsDraggingOverPaywall] = useState<string | null>(null);

  useEffect(() => {
    if (contentData.content && Array.isArray(contentData.content)) {
      // Only show unprotected content for this workflow
      const unprotectedContent = (contentData.content as ContentItem[]).filter(
        item => !item.isProtected
      );
      setAvailableContent(unprotectedContent);
    }

    // Convert existing paywalls to templates for this workflow
    if (paywallsData.paywalls && Array.isArray(paywallsData.paywalls)) {
      const templates = paywallsData.paywalls
        .filter(paywall => paywall && paywall.id) // Ensure paywall exists and has an id
        .map(paywall => ({
          id: paywall.id,
          title: paywall.title,
          description: paywall.description || '',
          price: paywall.price || 0,
          currency: paywall.currency || 'NGN',
          contentItems: [] as ContentItem[], // Placeholder - would need to link content to paywall
        }));
      setPaywallTemplates(templates);
    }
  }, [contentData, paywallsData]);

  const handleDragStart = (e: React.DragEvent, item: ContentItem, source: string) => {
    setDraggedItem({ item, source });
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e: React.DragEvent, targetPaywallId?: string) => {
    e.preventDefault();
    if (targetPaywallId) {
      setIsDraggingOverPaywall(targetPaywallId);
      setIsDraggingOverAvailable(false);
    } else {
      setIsDraggingOverAvailable(true);
      setIsDraggingOverPaywall(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetPaywallId?: string) => {
    e.preventDefault();

    setIsDraggingOverAvailable(false);
    setIsDraggingOverPaywall(null);

    if (!draggedItem) return;

    // If dropping into a specific paywall
    if (targetPaywallId) {
      setPaywallTemplates(prev =>
        prev.map(template => {
          if (template.id === targetPaywallId) {
            // Only add if not already in this paywall
            if (!template.contentItems.some(ci => ci.id === draggedItem.item.id)) {
              return {
                ...template,
                contentItems: [...template.contentItems, draggedItem.item],
              };
            }
          }
          return template;
        })
      );
    }
    // If dropping back to available content (not implemented in this UI)
    else {
      // For this implementation, we'll focus on moving to paywalls
    }

    setDraggedItem(null);
  };

  const createNewPaywall = async () => {
    if (!newPaywallTitle.trim()) {
      alert('Please enter a title for the new paywall');
      return;
    }

    try {
      const paywallData: CreatePaywallData = {
        title: newPaywallTitle,
        description: `Paywall for ${newPaywallTitle}`,
        price: newPaywallPrice,
        currency: newPaywallCurrency,
        type: 'content_package', // Special type for content packages
        status: 'draft',
        tags: [],
        previewEnabled: true,
        previewSettings: { style: '' },
        socialShareEnabled: true,
        pricingModel: 'one-time',
      };

      const result = await paywallService.createPaywall(paywallData);

      // Ensure result exists before continuing
      if (!result) {
        throw new Error('Failed to create paywall: No response received');
      }

      // Add the new paywall to our templates
      const newTemplate: PaywallTemplate = {
        id: result.id ?? '',
        title: result.title ?? '',
        description: result.description || '',
        price: result.price ?? 0,
        currency: result.currency ?? 'USD',
        style: 'default',
        contentItems: [],
      };

      setPaywallTemplates(prev => [...prev, newTemplate]);
      setNewPaywallTitle('');
      setNewPaywallPrice(0);

      // Refresh paywalls
      refreshPaywalls();
    } catch (error) {
      console.error('Error creating paywall:', error);
      alert('Failed to create paywall. Please try again.');
    }
  };

  const updatePaywall = async (templateId: string, contentItems: ContentItem[]) => {
    try {
      // Update the paywall with content information
      // In a real implementation, we might link content to paywall differently
      // This is a simplified approach

      // First, get the template to get the price, currency, and other details
      const template = paywallTemplates.find(t => t.id === templateId);

      if (!template) {
        throw new Error('Template not found');
      }

      // Update the content items to be protected and associated with this paywall
      for (const contentItem of contentItems) {
        await contentService.updateContentProtection(contentItem.id, {
          isProtected: true,
          price: template.price,
          currency: template.currency,
          paywallTitle: template.title,
          paywallDescription: template.description || '',
        });
      }

      // Refresh both content and paywalls
      refreshContent();
      refreshPaywalls();

      alert('Paywall updated successfully!');
    } catch (error) {
      console.error('Error updating paywall:', error);
      alert('Failed to update paywall. Please try again.');
    }
  };

  const publishPaywall = async (templateId: string) => {
    try {
      // In a real implementation, we would update the paywall status to published
      // This is a placeholder for the actual API call
      const template = paywallTemplates.find(t => t.id === templateId);
      if (template) {
        if (template.contentItems.length > 0) {
          // Update paywall status to published
          // await paywallService.updatePaywall(templateId, { status: 'published' });

          // In our implementation, we'll just update the status in the service
          await paywallService.updatePaywall(templateId, {
            title: template.title,
            description: template.description || '',
            price: template.price,
            status: 'published',
          });

          refreshPaywalls();
          alert('Paywall published successfully!');
        } else {
          alert('Cannot publish empty paywall. Please add content first.');
        }
      } else {
        alert('Paywall template not found.');
      }
    } catch (error) {
      console.error('Error publishing paywall:', error);
      alert('Failed to publish paywall. Please try again.');
    }
  };

  const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? '#e0f2fe' : '#f9fafb',
    padding: '16px',
    width: '100%',
    minHeight: '200px',
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
  });

  const removeContentFromPaywall = (paywallId: string, contentId: string) => {
    setPaywallTemplates(prev =>
      prev.map(template => {
        if (template.id === paywallId) {
          return {
            ...template,
            contentItems: template.contentItems.filter(item => item.id !== contentId),
          };
        }
        return template;
      })
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Create New Paywall
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              placeholder="Enter paywall title"
            />
          </div>
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
          <div className="flex items-end">
            <button
              type="button"
              onClick={createNewPaywall}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Create Paywall
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Content to Paywall Workflow
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Content */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Available Content
            </h4>
            <div
              style={getListStyle(isDraggingOverAvailable)}
              onDragOver={e => handleDragOver(e)}
              onDrop={e => handleDrop(e)} // This would handle dropping back to available
            >
              {availableContent.map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={e => handleDragStart(e, item, 'available')}
                  className="p-3 mb-2 bg-white border border-gray-200 rounded-md cursor-move hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.type}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {availableContent.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No available content to drag
                </div>
              )}
            </div>
          </div>

          {/* Paywall Templates */}
          <div className="lg:col-span-2">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Paywall Templates
            </h4>
            <div className="space-y-6">
              {paywallTemplates.map(template => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        {template.title}
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {template.currency}
                        {template.price} • {template.contentItems.length} items
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => updatePaywall(template.id, template.contentItems)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => publishPaywall(template.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600"
                      >
                        Publish
                      </button>
                    </div>
                  </div>

                  <div
                    style={getListStyle(isDraggingOverPaywall === template.id)}
                    onDragOver={e => handleDragOver(e, template.id)}
                    onDrop={e => handleDrop(e, template.id)}
                  >
                    {template.contentItems.map(item => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={e => handleDragStart(e, item, `paywall-${template.id}`)}
                        className="p-3 mb-2 bg-white border border-gray-200 rounded-md cursor-move hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 flex justify-between"
                      >
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.type}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeContentFromPaywall(template.id, item.id)}
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {template.contentItems.length === 0 && (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                        Drag content here to add to paywall
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {paywallTemplates.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Create a paywall template to start dragging content
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentToPaywallWorkflow;
