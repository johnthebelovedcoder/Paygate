// paymentService.ts - Payment and transaction service
import { apiService } from './api';
import type { AxiosError } from 'axios';

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
  // Create a new payment with Paystack
  async createPayment(data: CreatePaymentRequest): Promise<PaystackResponse> {
    try {
      const response = await apiService.post<PaystackResponse>('/payments', data);
      return response;
    } catch (error: unknown) {
      console.error('Error creating payment:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to create payment' };
    }
  }

  // Get recent payments for the current user
  async getRecentPayments(limit: number = 5): Promise<Payment[]> {
    try {
      const response = await apiService.get<Payment[]>(
        `/payments?limit=${limit}&sort=createdAt:desc`
      );
      return Array.isArray(response) ? response : [];
    } catch (error: unknown) {
      console.error('Error fetching recent payments:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch recent payments' };
    }
  }

  // Verify a payment with Paystack
  async verifyPayment(reference: string): Promise<{ payment: Payment; paystack_data: any }> {
    try {
      const response = await apiService.get<{ payment: Payment; paystack_data: any }>(
        `/payments/verify/${reference}`
      );
      return response;
    } catch (error: unknown) {
      console.error('Error verifying payment:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to verify payment' };
    }
  }

  // Get payment details
  async getPayment(reference: string): Promise<Payment> {
    try {
      const response = await apiService.get<Payment>(`/payments/${reference}`);
      return response;
    } catch (error: unknown) {
      console.error('Error fetching payment:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch payment' };
    }
  }

  // Initialize Paystack payment
  async initializePayment(
    amount: number,
    email: string,
    reference: string,
    currency: string = 'NGN'
  ): Promise<PaystackResponse> {
    try {
      const data = {
        amount,
        email,
        reference,
        currency,
      };

      const response = await apiService.post<PaystackResponse>('/payments', data);
      return response;
    } catch (error: unknown) {
      console.error('Error initializing payment:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to initialize payment' };
    }
  }

  // Process payment webhook
  async processWebhook(payload: any, signature: string): Promise<void> {
    // This would typically be called server-side, so we'll make a mock implementation
    console.log('Processing payment webhook:', payload, signature);
  }
}

const paymentService = new PaymentService();
export default paymentService;
