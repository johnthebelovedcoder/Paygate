// customerService.ts - Customer management service
import { apiService } from './api';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  totalPurchases: number;
  lastPurchase: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface CustomerResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
}

export interface PurchaseTimelineItem {
  id: string;
  amount: number;
  currency: string;
  paywallTitle: string;
  paywallPrice: number;
  paywallCurrency: string;
  date: string;
}

// Define interfaces for customer-related data
export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  customerCount: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  customerGrowthRate: number;
  churnRate: number;
  averageCustomerLifetime: number;
  customerSegmentDistribution: {
    segment: string;
    count: number;
  }[];
}

class CustomerService {
  // Get all customers for the current user
  async getCustomers(): Promise<Customer[]> {
    try {
      const response = await apiService.get<CustomerResponse<Customer[]>>('/customers');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: unknown) {
      console.error('Error fetching customers:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch customers' };
    }
  }

  // Get customer segments
  async getCustomerSegments(): Promise<CustomerSegment[]> {
    try {
      const response =
        await apiService.get<CustomerResponse<CustomerSegment[]>>('/customers/segments');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: unknown) {
      console.error('Error fetching customer segments:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch customer segments' };
    }
  }

  // Get customer analytics
  async getCustomerAnalytics(): Promise<CustomerAnalytics> {
    try {
      const response =
        await apiService.get<CustomerResponse<CustomerAnalytics>>('/customers/analytics');
      return (
        response.data || {
          totalCustomers: 0,
          newCustomers: 0,
          customerGrowthRate: 0,
          churnRate: 0,
          averageCustomerLifetime: 0,
          customerSegmentDistribution: [],
        }
      );
    } catch (error: unknown) {
      console.error('Error fetching customer analytics:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch customer analytics' };
    }
  }

  // Update customer status
  async updateCustomerStatus(customerId: string, status: 'active' | 'inactive'): Promise<Customer> {
    try {
      const response = await apiService.put<CustomerResponse<Customer>>(
        `/customers/${customerId}`,
        { status }
      );
      return response.data as Customer;
    } catch (error: unknown) {
      console.error('Error updating customer status:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to update customer status' };
    }
  }

  // Get customer purchase timeline
  async getCustomerPurchaseTimeline(customerId: string): Promise<PurchaseTimelineItem[]> {
    try {
      const response = await apiService.get<CustomerResponse<PurchaseTimelineItem[]>>(
        `/customers/${customerId}/purchase-timeline`
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: unknown) {
      console.error('Error fetching customer purchase timeline:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch customer purchase timeline' };
    }
  }

  // Export customer data
  async exportCustomers(): Promise<void> {
    try {
      const response = await apiService.get<Blob>('/customers/export', {
        responseType: 'blob',
      });

      // Create a download link
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customers.csv');
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      console.error('Error exporting customers:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to export customers' };
    }
  }
}

const customerService = new CustomerService();
export default customerService;
