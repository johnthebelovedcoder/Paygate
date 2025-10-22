import { useState, useEffect } from 'react';
import contentService, { type ContentItem } from '../services/contentService';
import { useAuth } from '../contexts';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

interface UseContentReturn {
  content: ContentItem[];
  loading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
  updateContent: (id: string, data: Partial<ContentItem>) => Promise<void>;
}

const useContent = (): UseContentReturn => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchContent = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const response = await contentService.getAllContent(); // Changed from getContent to getAllContent
      // The service returns an object with success and content properties
      // Only set the content array, not the entire response object
      setContent(response.data || []);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching content:', err);
      let errorMessage = 'Failed to fetch content. Please try again.';

      if (isAxiosError(err)) {
        if (err.message.includes('Authentication')) {
          errorMessage = 'Authentication required. Please log in.';
          // Redirect to login page for authentication errors
          window.location.href = '/login';
        } else if (err.message.includes('Access forbidden')) {
          errorMessage = 'You do not have permission to access content.';
        } else if (
          err.message.includes('Network Error') ||
          err.message.includes('Failed to fetch')
        ) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (err.message.includes('Rate limit')) {
          errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
        } else {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (id: string, data: Partial<ContentItem>) => {
    try {
      await contentService.updateContent(id, data);
      await fetchContent();
    } catch (err: unknown) {
      console.error(`Error updating content ${id}:`, err);
      if (isAxiosError(err) && err.response?.data) {
        const responseData = err.response.data;
        if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'message' in responseData
        ) {
          setError((responseData as { message: string }).message || 'Failed to update content');
        } else {
          setError('Failed to update content');
        }
      } else if (err instanceof Error) {
        setError(err.message || 'Failed to update content');
      } else {
        setError('Failed to update content');
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchContent();
    }
  }, [isAuthenticated]);

  return {
    content,
    loading,
    error,
    refreshContent: () => fetchContent(true),
    updateContent,
  };
};

export default useContent;
