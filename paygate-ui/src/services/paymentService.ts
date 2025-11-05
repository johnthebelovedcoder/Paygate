// paymentService.ts - Payment and transaction service
import type { AxiosError, AxiosInstance } from 'axios';

// Define the API client interface
export interface IApiClient {
  get: <T>(url: string, config?: any) => Promise<T>;
  post: <T>(url: string, data?: any, config?: any) => Promise<T>;
  put: <T>(url: string, data?: any, config?: any) => Promise<T>;
  delete: <T>(url: string, config?: any) => Promise<T>;
  getAxiosInstance: () => AxiosInstance;
}

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paywallId: string | null;
  paywallTitle?: string;
  customerEmail?: string;
  customerName?: string;
  reference: string;
  paymentMethod?: string;
  channel?: string;
  gatewayResponse?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  reference: string;
  customerEmail: string;
  customerName?: string;
  paymentMethod?: string;
  channel?: string;
  description?: string;
  transactionMetadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  paywallId: string;
  amount: number;
  currency: string;
  customer_email: string;
  customer_name?: string;
  payment_method?: string;
  channel?: string;
}

export interface PaystackResponse {
  access_token?: string;
  authorization_url?: string;
  reference: string;
  status: boolean;
  message?: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

class PaymentService {
  private api: IApiClient;

  constructor(apiClient: IApiClient) {
    this.api = apiClient;
  }

  // Create a new payment with Paystack
  async createPayment(data: CreatePaymentRequest): Promise<PaystackResponse> {
    try {
      const response = await this.api.post<PaystackResponse>('/payments', data);
      return response;
    } catch (error) {
      const err = error as Error;
      console.error('Error creating payment:', err);
      throw err;
    }
  }

  // Get recent payments for the current user
  async getRecentPayments(limit: number = 5): Promise<Payment[]> {
    try {
      const response = await this.api.get<{ data: Payment[] }>(`/payments/recent?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching recent payments:', err);
      throw err;
    }
  }

  // Get all payments
  async getPayments(): Promise<{ data: Payment[] }> {
    return this.api.get<{ data: Payment[] }>('/payments');
  }

  // Update a payment
  async updatePayment(id: string, data: Partial<Payment>): Promise<{ data: Payment }> {
    return this.api.put<{ data: Payment }>(`/payments/${id}`, data);
  }

  // Delete a payment
  async deletePayment(id: string): Promise<void> {
    return this.api.delete(`/payments/${id}`);
  }

  // Verify a payment with Paystack
  async verifyPayment(reference: string): Promise<{ payment: Payment; paystack_data: any }> {
    try {
      const response = await this.api.get<{ data: { payment: Payment; paystack_data: any } }>(`/payments/verify/${reference}`);
      return response.data;
    } catch (error) {
      const err = error as Error;
      console.error('Error verifying payment:', err);
      throw err;
    }
  }

  // Get payment details
  async getPayment(reference: string): Promise<Payment> {
    try {
      const response = await this.api.get<{ data: Payment }>(`/payments/${reference}`);
      return response.data;
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching payment:', err);
      throw err;
    }
  }

  // Initialize Paystack payment
  async initializePayment(amount: number, email: string, reference: string, currency: string = 'NGN'): Promise<PaystackResponse> {
    try {
      const response = await this.api.post<PaystackResponse>('/payments/initialize', {
        amount,
        email,
        reference,
        currency,
      });
      return response;
    } catch (error) {
      const err = error as Error;
      console.error('Error initializing payment:', err);
      throw err;
    }
  }

  // Process payment webhook
  async processWebhook(payload: any, signature: string): Promise<void> {
    try {
      await this.api.post(
        '/payments/webhook',
        { payload },
        {
          headers: {
            'x-paystack-signature': signature,
          },
        }
      );
    } catch (error) {
      const err = error as Error;
      console.error('Error processing webhook:', err);
      throw err;
    }
  }
}

// Create a default instance for backward compatibility
import { apiService } from './api';
const defaultPaymentService = new PaymentService({
  get: apiService.get,
  post: apiService.post,
  put: apiService.put,
  delete: apiService.delete,
  getAxiosInstance: () => apiService.getAxiosInstance(),
});

export { PaymentService };
export default defaultPaymentService;
