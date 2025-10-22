export interface GeographicData {
  country: string;
  countryCode: string;
  sales: number;
  revenue: number;
  currency: string;
  percentage: number;
}

export interface TrafficSource {
  id: string;
  name: string;
  visits: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  totalVisitors: number;
  conversionRate: number;
  avgOrderValue: number;
  activePaywalls: number;
  recentPayments: number;
  totalCustomers?: number;
}

export interface RevenueBreakdown {
  revenueByTime: { date: string; revenue: number }[];
  revenueByProduct: { productId: string; revenue: number; productName: string }[];
  revenueBySegment: { segmentId: string; revenue: number; segmentName: string }[];
}

export interface ConversionFunnel {
  totalViews: number;
  totalPurchases: number;
  conversionRate: number;
  dropOffPoints: { step: string; count: number; dropOff: number }[];
}

export interface TopPaywall {
  id: string;
  title: string;
  sales: number;
  revenue: number;
}

export interface CustomerLifetimeValue {
  id: string;
  customerId: string;
  totalSpent: number;
  purchaseCount: number;
  avgOrderValue: number;
  customerLifetimeDays: number;
  customer: {
    email: string;
    name: string;
  };
}

export interface RevenueForecastData {
  date: string;
  predictedRevenue: number;
}

export interface RevenueForecast {
  forecast: RevenueForecastData[];
  trend: string;
  confidence: number;
}

export interface CustomerGrowthData {
  date: string;
  newCustomers: number;
}

export interface CustomerData {
  totalCustomers: number;
  customerGrowth: CustomerGrowthData[];
}
