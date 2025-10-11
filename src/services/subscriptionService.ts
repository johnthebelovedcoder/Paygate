// services/subscriptionService.ts - Subscription management service
import { apiService } from './api';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'pro' | 'business' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string | null;
  cancelAtPeriodEnd: boolean;
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

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  transactionFeePercent: number;
  transactionFeeFixed: number;
  paywallLimit: number;
}

export interface SubscriptionResponse {
  success: boolean;
  data?: Subscription;
  message?: string;
}

export interface InvoicesResponse {
  success: boolean;
  data?: Invoice[];
  count?: number;
  message?: string;
}

export interface PlansResponse {
  success: boolean;
  data?: Plan[];
  message?: string;
}

class SubscriptionService {
  // Get current subscription
  async getSubscription(): Promise<Subscription> {
    try {
      const response = await apiService.get<SubscriptionResponse>('/subscriptions');
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch subscription');
      }
      return response.data!;
    } catch (error: unknown) {
      console.error('Error fetching subscription:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to fetch subscription' };
    }
  }

  // Update subscription
  async updateSubscription(plan: string): Promise<Subscription> {
    try {
      const response = await apiService.put<SubscriptionResponse>('/subscriptions', { plan });
      if (!response.success) {
        throw new Error(response.message || 'Failed to update subscription');
      }
      return response.data!;
    } catch (error: unknown) {
      console.error('Error updating subscription:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to update subscription' };
    }
  }

  // Complete subscription upgrade
  async completeSubscriptionUpgrade(plan: string): Promise<Subscription> {
    try {
      const response = await apiService.post<SubscriptionResponse>('/subscriptions/upgrade', {
        plan,
      });
      if (!response.success) {
        throw new Error(response.message || 'Failed to upgrade subscription');
      }
      return response.data!;
    } catch (error: unknown) {
      console.error('Error upgrading subscription:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to upgrade subscription' };
    }
  }

  // Cancel subscription
  async cancelSubscription(): Promise<Subscription> {
    try {
      const response = await apiService.post<SubscriptionResponse>('/subscriptions/cancel');
      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel subscription');
      }
      return response.data!;
    } catch (error: unknown) {
      console.error('Error cancelling subscription:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      throw { message: 'Failed to cancel subscription' };
    }
  }

  // Get subscription invoices
  async getInvoices(): Promise<Invoice[]> {
    try {
      const response = await apiService.get<InvoicesResponse>('/subscriptions/invoices');
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

  // Get available plans
  async getPlans(): Promise<Plan[]> {
    try {
      const response: PlansResponse = await apiService.get<PlansResponse>('/subscriptions/plans');
      return response.data || [];
    } catch (error: unknown) {
      console.error('Error fetching plans:', error);
      if (isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      } else if (error instanceof Error) {
        throw { message: error.message };
      }
      // Return empty array as fallback
      return [];
    }
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;
