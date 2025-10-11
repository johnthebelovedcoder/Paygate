// socialShareService.ts - Social sharing service
import { apiService } from './api';

export interface SocialShare {
  id: string;
  paywallId: string;
  platform: string;
  shareUrl: string;
  userId: string;
  createdAt: string;
}

export interface SocialShareAnalytics {
  platform: string;
  shareCount: number;
  lastShared: string | null;
}

export interface ShareUrls {
  facebook: string;
  twitter: string;
  linkedin: string;
  pinterest: string;
  reddit: string;
  whatsapp: string;
  email: string;
}

export interface SocialShareResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
}

class SocialShareService {
  // Record a social share
  async recordShare(paywallId: string, platform: string, shareUrl: string): Promise<SocialShare> {
    const response = await apiService.post<SocialShareResponse<SocialShare>>('/social-shares', {
      paywallId,
      platform,
      shareUrl,
    });
    return response.data as SocialShare;
  }

  // Get all social shares for the current user
  async getSocialShares(): Promise<SocialShare[]> {
    const response = await apiService.get<SocialShareResponse<SocialShare[]>>('/social-shares');
    return Array.isArray(response.data) ? response.data : [];
  }

  // Get social shares for a specific paywall
  async getPaywallSocialShares(paywallId: string): Promise<SocialShare[]> {
    const response = await apiService.get<SocialShareResponse<SocialShare[]>>(
      `/social-shares/paywall/${paywallId}`
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  // Get social sharing analytics for the current user
  async getSocialShareAnalytics(): Promise<SocialShareAnalytics[]> {
    const response = await apiService.get<SocialShareResponse<SocialShareAnalytics[]>>(
      '/social-shares/analytics'
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  // Get social sharing analytics for a specific paywall
  async getPaywallShareAnalytics(paywallId: string): Promise<SocialShareAnalytics[]> {
    const response = await apiService.get<SocialShareResponse<SocialShareAnalytics[]>>(
      `/social-shares/analytics/${paywallId}`
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  // Generate social share URLs for a paywall
  async generateShareUrls(paywallId: string): Promise<ShareUrls> {
    const response = await apiService.get<SocialShareResponse<ShareUrls>>(
      `/social-shares/generate/${paywallId}`
    );
    return response.data as ShareUrls;
  }
}

const socialShareService = new SocialShareService();
export default socialShareService;
