import { api, apiService } from './api';
import type { AxiosError } from 'axios';
import type { ContentResponse, ContentItem, ContentType } from '../types/content.types';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

const getAllContent = async (): Promise<ContentResponse<ContentItem[]>> => {
  try {
    const response: ContentResponse<ContentItem[]> =
      await apiService.get<ContentResponse<ContentItem[]>>('/content');
    // Assuming response.data is the ContentResponse object
    return {
      success: true,
      message: 'Content fetched successfully',
      data: response.data || [],
    };
  } catch (error: unknown) {
    console.error('Error fetching all content:', error);
    if (isAxiosError(error) && error.response?.data) {
      const responseData = error.response.data;
      if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
        throw new Error(
          (responseData as { message: string }).message || 'Failed to fetch all content'
        );
      } else {
        throw new Error('Failed to fetch all content');
      }
    } else if (error instanceof Error) {
      throw new Error(error.message || 'Failed to fetch all content');
    } else {
      throw new Error('Failed to fetch all content');
    }
  }
};

const getContentById = async (id: string): Promise<ContentResponse<ContentItem>> => {
  try {
    const response: ContentResponse<ContentItem> = await apiService.get<
      ContentResponse<ContentItem>
    >(`/content/${id}`);
    return {
      success: true,
      message: `Content with id ${id} fetched successfully`,
      data: response.data || null,
    };
  } catch (error: unknown) {
    console.error('Error fetching content by id:', error);
    let errorMessage = 'Failed to fetch content';
    if (isAxiosError(error) && error.response?.data) {
      const responseData = error.response.data;
      if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
        errorMessage = (responseData as { message: string }).message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

const createContent = async (
  content: Omit<ContentItem, 'id'>
): Promise<ContentResponse<ContentItem>> => {
  try {
    const response: ContentResponse<ContentItem> = await apiService.post<
      ContentResponse<ContentItem>
    >('/content', content);
    return {
      success: true,
      message: 'Content created successfully',
      data: response.data || null,
    };
  } catch (error: unknown) {
    console.error('Error creating content:', error);
    let errorMessage = 'Failed to create content';
    if (isAxiosError(error) && error.response?.data) {
      const responseData = error.response.data;
      if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
        errorMessage = (responseData as { message: string }).message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

const updateContent = async (
  id: string,
  content: Partial<ContentItem>
): Promise<ContentResponse<ContentItem>> => {
  try {
    const response: ContentResponse<ContentItem> = await apiService.put<
      ContentResponse<ContentItem>
    >(`/content/${id}`, content);
    return {
      success: true,
      message: `Content with id ${id} updated successfully`,
      data: response.data || null,
    };
  } catch (error: unknown) {
    console.error(`Error updating content ${id}:`, error);
    if (isAxiosError(error) && error.response?.data) {
      const responseData = error.response.data;
      if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
        throw new Error(
          (responseData as { message: string }).message || `Failed to update content ${id}`
        );
      } else {
        throw new Error(`Failed to update content ${id}`);
      }
    } else if (error instanceof Error) {
      throw new Error(error.message || `Failed to update content ${id}`);
    } else {
      throw new Error(`Failed to update content ${id}`);
    }
  }
};

const deleteContent = async (id: string): Promise<ContentResponse<null>> => {
  try {
    await apiService.delete<ContentResponse<null>>(`/content/${id}`);
    return {
      success: true,
      message: 'Content deleted successfully',
      data: null,
    };
  } catch (error: unknown) {
    console.error('Error deleting content:', error);
    let errorMessage = `Failed to delete content with id ${id}`;
    if (isAxiosError(error) && error.response?.data) {
      const responseData = error.response.data;
      if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
        errorMessage = (responseData as { message: string }).message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

interface UploadData {
  url: string;
  size: number;
  originalName: string;
  mimeType: string;
}

export interface FileUploadResponse {
  success: boolean;
  data: UploadData | null;
  message: string;
}

// Add file upload function
export const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Use the raw axios instance for file uploads which require multipart/form-data
    const response = await api.post('/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      data: response.data,
      message: 'File uploaded successfully',
    };
  } catch (error: unknown) {
    console.error('Error uploading file:', error);
    let errorMessage = 'File upload failed';
    if (isAxiosError(error) && error.response?.data) {
      const responseData = error.response.data;
      if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
        errorMessage = (responseData as { message: string }).message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

// Add updateContentProtection function
export interface UpdateContentProtectionData {
  isProtected: boolean;
  price?: number;
  currency?: string;
  paywallTitle?: string;
  paywallDescription?: string;
}

interface ContentProtectionResponse {
  success: boolean;
  data: unknown;
  message: string;
}

export const updateContentProtection = async (
  id: string,
  protectionData: UpdateContentProtectionData | boolean
): Promise<ContentProtectionResponse> => {
  try {
    // Handle both the object parameter and direct boolean parameter
    const dataToSend =
      typeof protectionData === 'object' ? protectionData : { isProtected: protectionData };

    const response = await apiService.put(`/content/${id}/protection`, dataToSend);

    return {
      success: true,
      data: response,
      message: 'Content protection updated successfully',
    };
  } catch (error: unknown) {
    console.error('Error updating content protection:', error);
    let errorMessage = 'Failed to update content protection';
    if (isAxiosError(error) && error.response?.data) {
      const responseData = error.response.data;
      if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
        errorMessage = (responseData as { message: string }).message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

export default {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  uploadFile,
  updateContentProtection,
};

// Re-export types for convenience
export type { ContentItem, ContentType, ContentResponse };
