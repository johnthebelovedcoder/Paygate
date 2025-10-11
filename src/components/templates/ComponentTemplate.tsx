/**
 * Component Template
 *
 * This is a template for creating new components following best practices
 * Copy this file and modify it for your new component
 */

import { useState, useEffect, type ReactNode } from 'react';
import errorHandler from '@/utils/error.utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ComponentTemplateProps {
  /** Component title */
  title: string;
  /** Optional description */
  description?: string;
  /** Child components */
  children?: ReactNode;
  /** Optional CSS classes */
  className?: string;
  /** Callback when action is triggered */
  onAction?: () => void;
}

interface DataItem {
  id: string;
  name: string;
  value: number;
}

// ============================================================================
// Component
// ============================================================================

const ComponentTemplate = ({
  title,
  description,
  children,
  className = '',
  onAction,
}: ComponentTemplateProps) => {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------
  useEffect(() => {
    fetchData();
  }, []);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      const response = await fetch('/api/data');
      const result = (await response.json()) as DataItem[];

      setData(result);
    } catch (err) {
      const message = errorHandler.getUserMessage(err);
      setError(message);
      errorHandler.log(err, 'ComponentTemplate.fetchData');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
  };

  // --------------------------------------------------------------------------
  // Render Helpers
  // --------------------------------------------------------------------------
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4">
          <p className="text-danger-800 dark:text-danger-200">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-sm text-danger-600 dark:text-danger-400 hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No data available</div>
      );
    }

    return (
      <div className="space-y-2">
        {data.map(item => (
          <div key={item.id} className="card-hover">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
              <span className="text-gray-600 dark:text-gray-400">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // Main Render
  // --------------------------------------------------------------------------
  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">{renderContent()}</div>

      {/* Children */}
      {children && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">{children}</div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <button onClick={handleAction} className="btn-primary" disabled={loading}>
          Action
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Exports
// ============================================================================

export default ComponentTemplate;
export type { ComponentTemplateProps, DataItem };
