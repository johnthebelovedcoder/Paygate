// services/communicationService.ts - Communication management service
import { apiService } from './api';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export interface Communication {
  id: string;
  type: string;
  subject: string | null;
  content: string;
  status: string;
  customerId: string;
  userId: string;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunicationData {
  type: string;
  subject?: string;
  content: string;
  customerId: string;
}

export interface BulkCommunicationData {
  customerIds: string[];
  communicationData: {
    type: string;
    subject?: string;
    content: string;
  };
}

export interface CommunicationResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
}

class CommunicationService {
  // Create a new communication
  async createCommunication(data: CreateCommunicationData): Promise<Communication> {
    try {
      const response = await apiService.post<CommunicationResponse<Communication>>(
        '/communications',
        data
      );
      return response.data as Communication;
    } catch (error: unknown) {
      console.error('Error creating communication:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to create communication' };
    }
  }

  // Get all communications for the current user
  async getCommunications(): Promise<Communication[]> {
    try {
      const response =
        await apiService.get<CommunicationResponse<Communication[]>>('/communications');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: unknown) {
      console.error('Error fetching communications:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch communications' };
    }
  }

  // Get communications for a specific customer
  async getCustomerCommunications(customerId: string): Promise<Communication[]> {
    try {
      const response = await apiService.get<CommunicationResponse<Communication[]>>(
        `/communications/customer/${customerId}`
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: unknown) {
      console.error('Error fetching customer communications:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch customer communications' };
    }
  }

  // Update communication status
  async updateCommunicationStatus(
    communicationId: string,
    status: string,
    sentAt?: string
  ): Promise<Communication> {
    try {
      const response = await apiService.put<CommunicationResponse<Communication>>(
        `/communications/${communicationId}/status`,
        { status, sentAt }
      );
      return response.data as Communication;
    } catch (error: unknown) {
      console.error('Error updating communication status:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to update communication status' };
    }
  }

  // Send bulk communications
  async sendBulkCommunications(data: BulkCommunicationData): Promise<Communication[]> {
    try {
      const response = await apiService.post<CommunicationResponse<Communication[]>>(
        '/communications/bulk',
        data
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: unknown) {
      console.error('Error sending bulk communications:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to send bulk communications' };
    }
  }

  // Export communications
  async exportCommunications(): Promise<void> {
    try {
      const response = await apiService.get<Blob>('/communications/export', {
        responseType: 'blob',
      });

      // Create a download link
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'communications.csv');
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      console.error('Error exporting communications:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to export communications' };
    }
  }
}

const communicationService = new CommunicationService();
export default communicationService;
