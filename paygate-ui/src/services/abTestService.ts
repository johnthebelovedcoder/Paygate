// abTestService.ts - AB Testing service for managing experiments
import { apiService } from './api';
import type { AxiosError } from 'axios';

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  type: 'pricing' | 'content' | 'design' | 'messaging';
  objective: 'conversion' | 'revenue' | 'engagement';
  startDate: string;
  endDate: string;
  currentSample: number;
  isWinnerDetermined: boolean;
  winnerVariantId?: string;
  variants: ABTestVariant[];
}

interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  weight: number;
  convertedCount: number;
  totalVisitors: number;
  conversionRate: number;
}

interface ABTestCreate {
  name: string;
  description?: string;
  type: 'pricing' | 'content' | 'design' | 'messaging';
  objective: 'conversion' | 'revenue' | 'engagement';
  startDate?: string;
  endDate?: string;
  variants: ABTestVariantCreate[];
}

interface ABTestVariantCreate {
  name: string;
  description?: string;
  weight: number;
}

interface ABTestUpdate {
  name?: string;
  description?: string;
  status?: 'draft' | 'running' | 'paused' | 'completed';
  type?: 'pricing' | 'content' | 'design' | 'messaging';
  objective?: 'conversion' | 'revenue' | 'engagement';
  startDate?: string;
  endDate?: string;
}

interface ABTestResults {
  testId: string;
  winnerVariantId?: string;
  statisticalSignificance: number;
  conversionRates: {variantId: string, conversionRate: number, sampleSize: number}[];
}

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

class ABTestService {
  // Get all AB tests for the current user
  async getABTests(): Promise<ABTest[]> {
    try {
      const response = await apiService.get<{data: ABTest[]}>('/ab-tests');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching AB tests:', error);
      return [];
    }
  }

  // Get a specific AB test
  async getABTest(testId: string): Promise<ABTest | null> {
    try {
      const response = await apiService.get<{data: ABTest}>(`/ab-tests/${testId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching AB test:', error);
      return null;
    }
  }

  // Create a new AB test
  async createABTest(test: ABTestCreate): Promise<ABTest> {
    try {
      const response = await apiService.post<{data: ABTest}>('/ab-tests', test);
      return response.data.data;
    } catch (error) {
      console.error('Error creating AB test:', error);
      throw error;
    }
  }

  // Update an existing AB test
  async updateABTest(testId: string, test: ABTestUpdate): Promise<ABTest> {
    try {
      const response = await apiService.put<{data: ABTest}>(`/ab-tests/${testId}`, test);
      return response.data.data;
    } catch (error) {
      console.error('Error updating AB test:', error);
      throw error;
    }
  }

  // Delete an AB test
  async deleteABTest(testId: string): Promise<void> {
    try {
      await apiService.delete(`/ab-tests/${testId}`);
    } catch (error) {
      console.error('Error deleting AB test:', error);
      throw error;
    }
  }

  // Activate an AB test
  async activateABTest(testId: string): Promise<ABTest> {
    try {
      const response = await apiService.post<{data: ABTest}>(`/ab-tests/${testId}/activate`);
      return response.data.data;
    } catch (error) {
      console.error('Error activating AB test:', error);
      throw error;
    }
  }

  // Pause an AB test
  async pauseABTest(testId: string): Promise<ABTest> {
    try {
      const response = await apiService.post<{data: ABTest}>(`/ab-tests/${testId}/pause`);
      return response.data.data;
    } catch (error) {
      console.error('Error pausing AB test:', error);
      throw error;
    }
  }

  // Complete an AB test
  async completeABTest(testId: string): Promise<ABTest> {
    try {
      const response = await apiService.post<{data: ABTest}>(`/ab-tests/${testId}/complete`);
      return response.data.data;
    } catch (error) {
      console.error('Error completing AB test:', error);
      throw error;
    }
  }

  // Get AB test results
  async getABTestResults(testId: string): Promise<ABTestResults | null> {
    try {
      const response = await apiService.get<{data: ABTestResults}>(`/ab-tests/${testId}/results`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching AB test results:', error);
      return null;
    }
  }

  // Track a visit to an AB test variant
  async trackVisit(testId: string, variantId: string): Promise<void> {
    try {
      await apiService.post(`/ab-tests/${testId}/track-visit`, {
        variant_id: variantId
      });
    } catch (error) {
      console.error('Error tracking visit:', error);
      throw error;
    }
  }

  // Track a conversion for an AB test variant
  async trackConversion(testId: string, variantId: string): Promise<void> {
    try {
      await apiService.post(`/ab-tests/${testId}/track-conversion`, {
        variant_id: variantId
      });
    } catch (error) {
      console.error('Error tracking conversion:', error);
      throw error;
    }
  }
}

const abTestService = new ABTestService();
export default abTestService;
export type { ABTest, ABTestVariant, ABTestCreate, ABTestUpdate, ABTestResults };