import { describe, it, expect, vi, beforeEach } from 'vitest';
import analyticsService from '../services/analyticsService';
import { apiService } from '../services/api';

// Mock the apiService
vi.mock('../services/api', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should fetch dashboard stats successfully', async () => {
      const mockStats = {
        totalRevenue: 1000,
        totalSales: 10,
        totalVisitors: 100,
        conversionRate: 10,
        avgOrderValue: 100,
        activePaywalls: 2,
        recentPayments: 5,
        totalCustomers: 50,
      };

      vi.mocked(apiService.get).mockResolvedValue({
        success: true,
        data: mockStats,
      });

      const result = await analyticsService.getDashboardStats();

      expect(apiService.get).toHaveBeenCalledWith('/analytics/dashboard');
      expect(result).toEqual(mockStats);
    });

    it('should return default stats when API call fails', async () => {
      vi.mocked(apiService.get).mockRejectedValue(new Error('API Error'));

      const result = await analyticsService.getDashboardStats();

      expect(result).toEqual({
        totalRevenue: 0,
        totalSales: 0,
        totalVisitors: 0,
        conversionRate: 0,
        avgOrderValue: 0,
        activePaywalls: 0,
        recentPayments: 0,
        totalCustomers: 0,
      });
    });
  });

  describe('getRevenueData', () => {
    it('should fetch revenue data with time range', async () => {
      const mockRevenueData = [
        { date: '2023-01-01', revenue: 1000, sales: 5 },
        { date: '2023-01-02', revenue: 1500, sales: 7 },
      ];

      vi.mocked(apiService.get).mockResolvedValue({
        success: true,
        data: mockRevenueData,
      });

      const result = await analyticsService.getRevenueData('this_month');

      expect(apiService.get).toHaveBeenCalledWith('/analytics/revenue?range=this_month');
      expect(result).toEqual(mockRevenueData);
    });

    it('should fetch revenue data with custom date range', async () => {
      const mockRevenueData = [
        { date: '2023-01-01', revenue: 1000, sales: 5 },
      ];

      vi.mocked(apiService.get).mockResolvedValue({
        success: true,
        data: mockRevenueData,
      });

      const result = await analyticsService.getRevenueData('custom', '2023-01-01', '2023-01-31');

      expect(apiService.get).toHaveBeenCalledWith(
        '/analytics/revenue?range=custom&startDate=2023-01-01&endDate=2023-01-31'
      );
      expect(result).toEqual(mockRevenueData);
    });

    it('should return empty array when API call fails', async () => {
      vi.mocked(apiService.get).mockRejectedValue(new Error('API Error'));

      const result = await analyticsService.getRevenueData();

      expect(result).toEqual([]);
    });
  });

  describe('getTopPaywalls', () => {
    it('should fetch top paywalls successfully', async () => {
      const mockTopPaywalls = [
        { id: '1', title: 'Paywall 1', revenue: 500, conversions: 5, conversionRate: 10 },
        { id: '2', title: 'Paywall 2', revenue: 300, conversions: 3, conversionRate: 8 },
      ];

      vi.mocked(apiService.get).mockResolvedValue({
        success: true,
        data: mockTopPaywalls,
      });

      const result = await analyticsService.getTopPaywalls();

      expect(apiService.get).toHaveBeenCalledWith('/analytics/top-paywalls');
      expect(result).toEqual(mockTopPaywalls);
    });

    it('should return empty array when API call fails', async () => {
      vi.mocked(apiService.get).mockRejectedValue(new Error('API Error'));

      const result = await analyticsService.getTopPaywalls();

      expect(result).toEqual([]);
    });
  });

  describe('getCustomerData', () => {
    it('should fetch customer data successfully', async () => {
      const mockCustomerData = {
        totalCustomers: 100,
        customerGrowth: [{ month: 'Jan', newCustomers: 10, totalCustomers: 100 }],
      };

      vi.mocked(apiService.get).mockResolvedValue({
        success: true,
        data: mockCustomerData,
      });

      const result = await analyticsService.getCustomerData();

      expect(apiService.get).toHaveBeenCalledWith('/analytics/customers');
      expect(result).toEqual(mockCustomerData);
    });

    it('should return default data when API call fails', async () => {
      vi.mocked(apiService.get).mockRejectedValue(new Error('API Error'));

      const result = await analyticsService.getCustomerData();

      expect(result).toEqual({
        totalCustomers: 0,
        customerGrowth: [],
      });
    });
  });

  describe('getRevenueForecast', () => {
    it('should fetch revenue forecast successfully', async () => {
      const mockForecast = {
        forecast: [{ date: '2023-01-01', forecasted_revenue: 1000 }],
        trend: 'positive',
        confidence: 0.85,
      };

      vi.mocked(apiService.get).mockResolvedValue({
        success: true,
        data: mockForecast,
      });

      const result = await analyticsService.getRevenueForecast();

      expect(apiService.get).toHaveBeenCalledWith('/analytics/revenue-forecast');
      expect(result).toEqual(mockForecast);
    });

    it('should return default forecast when API call fails', async () => {
      vi.mocked(apiService.get).mockRejectedValue(new Error('API Error'));

      const result = await analyticsService.getRevenueForecast();

      expect(result).toEqual({
        forecast: [],
        trend: 'stable',
        confidence: 0,
      });
    });
  });

  describe('getContentAnalytics', () => {
    it('should fetch content analytics successfully', async () => {
      const mockAnalytics = {
        total_content: 50,
        content_by_type: { file: 30, url: 20 },
        download_trends: [{ date: '2023-01-01', downloads: 100 }],
        top_performers: [],
        total_downloads: 1000,
      };

      vi.mocked(apiService.get).mockResolvedValue({
        success: true,
        data: mockAnalytics,
      });

      const result = await analyticsService.getContentAnalytics();

      expect(apiService.get).toHaveBeenCalledWith('/analytics/creator/content-analytics');
      expect(result).toEqual(mockAnalytics);
    });

    it('should return default analytics when API call fails', async () => {
      vi.mocked(apiService.get).mockRejectedValue(new Error('API Error'));

      const result = await analyticsService.getContentAnalytics();

      expect(result).toEqual({});
    });
  });

  describe('getPopularContent', () => {
    it('should fetch popular content successfully', async () => {
      const mockPopularContent = [
        { id: '1', title: 'Popular Content', type: 'file' },
      ];

      vi.mocked(apiService.get).mockResolvedValue({
        success: true,
        data: mockPopularContent,
      });

      const result = await analyticsService.getPopularContent();

      expect(apiService.get).toHaveBeenCalledWith('/analytics/creator/content-popular');
      expect(result).toEqual(mockPopularContent);
    });

    it('should return empty array when API call fails', async () => {
      vi.mocked(apiService.get).mockRejectedValue(new Error('API Error'));

      const result = await analyticsService.getPopularContent();

      expect(result).toEqual([]);
    });
  });

  describe('getContentProtectionSettings', () => {
    it('should fetch content protection settings successfully', async () => {
      const mockSettings = {
        drm: { enableDrm: true, drmProvider: 'widevine' },
        watermark: { enableWatermark: true, watermarkText: 'Sample' },
        accessControls: { ipRestrictions: false },
      };

      vi.mocked(apiService.get).mockResolvedValue({
        success: true,
        data: mockSettings,
      });

      const result = await analyticsService.getContentProtectionSettings();

      expect(apiService.get).toHaveBeenCalledWith('/analytics/creator/content-protection');
      expect(result).toEqual(mockSettings);
    });

    it('should return default settings when API call fails', async () => {
      vi.mocked(apiService.get).mockRejectedValue(new Error('API Error'));

      const result = await analyticsService.getContentProtectionSettings();

      expect(result.drm).toBeDefined();
      expect(result.watermark).toBeDefined();
      expect(result.accessControls).toBeDefined();
    });
  });

  describe('updateContentProtectionSettings', () => {
    it('should update content protection settings successfully', async () => {
      const mockSettings = {
        drm: { enableDrm: true, drmProvider: 'widevine' },
      };

      vi.mocked(apiService.put).mockResolvedValue({
        success: true,
        data: mockSettings,
      });

      const result = await analyticsService.updateContentProtectionSettings(mockSettings);

      expect(apiService.put).toHaveBeenCalledWith('/analytics/creator/content-protection', mockSettings);
      expect(result).toEqual(mockSettings);
    });

    it('should return empty object when API call fails', async () => {
      vi.mocked(apiService.put).mockRejectedValue(new Error('API Error'));

      const result = await analyticsService.updateContentProtectionSettings({});

      expect(result).toEqual({});
    });
  });
});