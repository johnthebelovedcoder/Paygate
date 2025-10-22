// contentPreviewService.ts - Content preview service
import { apiService } from './api';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export interface ContentPreview {
  id: string;
  title: string;
  description: string | undefined;
  type: 'file' | 'url';
  previewUrl: string | null;
  previewType: 'sample' | 'clip' | 'thumbnail' | 'metadata';
  previewMetadata: unknown;
  paywallId: string;
  createdAt: string;
}

export interface ContentPreviewResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ContentPreviewService {
  // Get content preview for a paywall
  async getContentPreview(paywallId: string): Promise<ContentPreview | null> {
    try {
      const response = await apiService.get<ContentPreviewResponse<ContentPreview>>(
        `/content-preview/${paywallId}`
      );
      return response.data || null;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null; // Preview not found
      }
      console.error('Error fetching content preview:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch content preview' };
    }
  }
}

const contentPreviewService = new ContentPreviewService();
export default contentPreviewService;
