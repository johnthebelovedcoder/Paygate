// services/supportService.ts - Customer support ticketing service
import { apiService } from './api';
import type { AxiosError, AxiosResponse } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  customerId: string | null;
  customer: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  userId: string;
  assignedToId: string | null;
  assignedTo: {
    id: string;
    name: string;
  } | null;
  responses: SupportTicketResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportCategory {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  ticketCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketResponse {
  id: string;
  content: string;
  ticketId: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupportTicketData {
  subject: string;
  description: string;
  priority?: string;
  categoryId?: string;
  customerId?: string;
}

export interface UpdateSupportTicketData {
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  categoryId?: string;
  customerId?: string;
  assignedToId?: string;
}

export interface CreateSupportCategoryData {
  name: string;
  description?: string;
}

export interface CreateSupportTicketResponseData {
  content: string;
  isInternal?: boolean;
}

export interface TicketStatistics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  urgentTickets: number;
  highPriorityTickets: number;
}

export interface SupportResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
}

class SupportService {
  // Create a new support ticket
  async createSupportTicket(data: CreateSupportTicketData): Promise<SupportTicket> {
    try {
      const response = await apiService.post<SupportResponse<SupportTicket>>(
        '/support/tickets',
        data
      );
      return response.data as SupportTicket;
    } catch (error: unknown) {
      console.error('Error creating support ticket:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to create support ticket' };
    }
  }

  // Get all support tickets for the current user
  async getSupportTickets(): Promise<SupportTicket[]> {
    try {
      const response = await apiService.get<SupportResponse<SupportTicket[]>>('/support/tickets');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: unknown) {
      console.error('Error fetching support tickets:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch support tickets' };
    }
  }

  // Get a single support ticket
  async getSupportTicket(id: string): Promise<SupportTicket> {
    try {
      const response = await apiService.get<SupportResponse<SupportTicket>>(
        `/support/tickets/${id}`
      );
      return response.data as SupportTicket;
    } catch (error: unknown) {
      console.error('Error fetching support ticket:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch support ticket' };
    }
  }

  // Update a support ticket
  async updateSupportTicket(id: string, data: UpdateSupportTicketData): Promise<SupportTicket> {
    try {
      const response = await apiService.put<SupportResponse<SupportTicket>>(
        `/support/tickets/${id}`,
        data
      );
      return response.data as SupportTicket;
    } catch (error: unknown) {
      console.error('Error updating support ticket:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to update support ticket' };
    }
  }

  // Delete a support ticket
  async deleteSupportTicket(id: string): Promise<void> {
    try {
      await apiService.delete<SupportResponse<void>>(`/support/tickets/${id}`);
    } catch (error: unknown) {
      console.error('Error deleting support ticket:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to delete support ticket' };
    }
  }

  // Create a support ticket response
  async createSupportTicketResponse(
    ticketId: string,
    data: CreateSupportTicketResponseData
  ): Promise<SupportTicketResponse> {
    try {
      const response = await apiService.post<SupportResponse<SupportTicketResponse>>(
        `/support/tickets/${ticketId}/responses`,
        data
      );
      return response.data as SupportTicketResponse;
    } catch (error: unknown) {
      console.error('Error creating support ticket response:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to create support ticket response' };
    }
  }

  // Get support categories for the current user
  async getSupportCategories(): Promise<SupportCategory[]> {
    try {
      const response =
        await apiService.get<SupportResponse<SupportCategory[]>>('/support/categories');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: unknown) {
      console.error('Error fetching support categories:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch support categories' };
    }
  }

  // Create a support category
  async createSupportCategory(data: CreateSupportCategoryData): Promise<SupportCategory> {
    try {
      const response = await apiService.post<SupportResponse<SupportCategory>>(
        '/support/categories',
        data
      );
      return response.data as SupportCategory;
    } catch (error: unknown) {
      console.error('Error creating support category:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to create support category' };
    }
  }

  // Get ticket statistics
  async getTicketStatistics(): Promise<TicketStatistics> {
    try {
      const response =
        await apiService.get<SupportResponse<TicketStatistics>>('/support/statistics');
      return response.data as TicketStatistics;
    } catch (error: unknown) {
      console.error('Error fetching ticket statistics:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch ticket statistics' };
    }
  }

  // Export support tickets
  async exportSupportTickets(): Promise<void> {
    try {
      const response: AxiosResponse<Blob> = await apiService.get<AxiosResponse<Blob>>(
        '/support/tickets/export',
        {
          responseType: 'blob',
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'support-tickets.csv');
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      console.error('Error exporting support tickets:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to export support tickets' };
    }
  }
}

const supportService = new SupportService();
export default supportService;
