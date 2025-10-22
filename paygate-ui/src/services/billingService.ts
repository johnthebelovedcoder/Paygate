// services/billingService.ts - Billing and payment management service
import { apiService } from './api';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  description: string;
  status: 'paid' | 'pending' | 'failed';
  paidAt: string | null;
  createdAt: string;
}

export interface AddPaymentMethodData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
}

export interface PaymentMethodResponse {
  success: boolean;
  data?: PaymentMethod;
  message?: string;
}

export interface PaymentMethodsResponse {
  success: boolean;
  data?: PaymentMethod[];
  message?: string;
}

export interface InvoiceResponse {
  success: boolean;
  data?: Invoice[];
  count?: number;
  message?: string;
}

class BillingService {
  // Get all payment methods for the user
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await apiService.get<PaymentMethodsResponse>('/billing/payment-methods');
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch payment methods');
      }
      return response.data || [];
    } catch (error: unknown) {
      console.error('Error fetching payment methods:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch payment methods' };
    }
  }

  // Add a new payment method
  async addPaymentMethod(data: AddPaymentMethodData): Promise<PaymentMethod> {
    try {
      // Parse expiry date
      const [month, year] = data.expiryDate.split('/').map(Number);

      const requestData = {
        cardNumber: data.cardNumber.replace(/\s/g, ''),
        expiryMonth: month,
        expiryYear: year,
        cvv: data.cvv,
        cardHolderName: data.cardHolderName,
      };

      const response = await apiService.post<PaymentMethodResponse>(
        '/billing/payment-methods',
        requestData
      );
      if (!response.success) {
        throw new Error(response.message || 'Failed to add payment method');
      }
      return response.data!;
    } catch (error: unknown) {
      console.error('Error adding payment method:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to add payment method' };
    }
  }

  // Delete a payment method
  async deletePaymentMethod(id: string): Promise<void> {
    try {
      const response = await apiService.delete<PaymentMethodResponse>(
        `/billing/payment-methods/${id}`
      );
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete payment method');
      }
    } catch (error: unknown) {
      console.error('Error deleting payment method:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to delete payment method' };
    }
  }

  // Set a payment method as default
  async setDefaultPaymentMethod(id: string): Promise<void> {
    try {
      const response = await apiService.put<PaymentMethodResponse>(
        `/billing/payment-methods/${id}/default`,
        {}
      );
      if (!response.success) {
        throw new Error(response.message || 'Failed to set default payment method');
      }
    } catch (error: unknown) {
      console.error('Error setting default payment method:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to set default payment method' };
    }
  }

  // Get invoice history
  async getInvoices(): Promise<Invoice[]> {
    try {
      const response = await apiService.get<InvoiceResponse>('/billing/invoices');
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch invoices');
      }
      return response.data || [];
    } catch (error: unknown) {
      console.error('Error fetching invoices:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch invoices' };
    }
  }

  // Get a specific invoice
  async getInvoice(id: string): Promise<Invoice> {
    try {
      const response = await apiService.get<InvoiceResponse>(`/billing/invoices/${id}`);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch invoice');
      }
      return response.data && response.data.length > 0 ? response.data[0] : undefined;
    } catch (error: unknown) {
      console.error('Error fetching invoice:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch invoice' };
    }
  }

  // Download invoice as PDF
  async downloadInvoice(id: string): Promise<Blob> {
    try {
      const response = await apiService.get<Blob>(`/billing/invoices/${id}/download`, {
        responseType: 'blob',
      });
      return response;
    } catch (error: unknown) {
      console.error('Error downloading invoice:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to download invoice' };
    }
  }
}

const billingService = new BillingService();
export default billingService;
