// components/ComprehensiveDashboard.test.tsx - Simple test for ComprehensiveDashboard component
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ComprehensiveDashboard from './ComprehensiveDashboard';
import { AuthProvider } from '../contexts/AuthContext';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock window object for ApexCharts
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the contexts and hooks used in the dashboard
vi.mock('../contexts', () => ({
  useAppData: () => ({
    paywalls: {
      loading: false,
      error: null,
      paywalls: [],
    },
  }),
  useAuth: () => ({
    user: {
      currency: 'USD',
    },
    isLoading: false,
  }),
}));

// Mock the analytics hook
vi.mock('../hooks/useAnalytics', () => ({
  default: () => ({
    stats: {
      totalRevenue: 5000,
      totalSales: 100,
      conversionRate: 15,
      avgOrderValue: 50,
      activePaywalls: 5,
      recentPayments: 20,
      totalCustomers: 150,
    },
    revenueData: [
      { date: 'Jan 1', revenue: 1000 },
      { date: 'Jan 2', revenue: 1200 },
      { date: 'Jan 3', revenue: 800 },
    ],
    topPaywalls: [{ id: '1', title: 'Test Paywall', sales: 50, revenue: 2500 }],
    customerData: {
      totalCustomers: 150,
      customerGrowth: [
        { month: 'Jan', customers: 100 },
        { month: 'Feb', customers: 150 },
      ],
    },
    loading: false,
    error: null,
    refreshAnalytics: vi.fn(),
  }),
}));

// Mock the recent payments hook
vi.mock('../hooks/useRecentPayments', () => ({
  default: () => ({
    payments: [
      {
        id: '1',
        amount: 5000,
        currency: 'USD',
        status: 'succeeded',
        paywallId: '1',
        paywallTitle: 'Test Paywall',
        customerEmail: 'test@example.com',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    ],
    loading: false,
    error: null,
    refreshPayments: vi.fn(),
  }),
}));

describe('ComprehensiveDashboard Component', () => {
  test('renders dashboard title', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ComprehensiveDashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    // Check that dashboard title is displayed
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('renders quick stats cards', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ComprehensiveDashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    // Check that stats cards are displayed
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Active Paywalls')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
  });

  test('renders quick actions panel', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ComprehensiveDashboard />
        </AuthProvider>
      </BrowserRouter>
    );
    // Check that quick actions are displayed
    expect(screen.getByText('Create Paywall')).toBeInTheDocument();
    expect(screen.getByText('Upload Content')).toBeInTheDocument();
    expect(screen.getByText('View Customers')).toBeInTheDocument();
  });

  test('renders recent activity section', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ComprehensiveDashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    // Check that recent activity section is displayed
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('New Sale')).toBeInTheDocument();
  });
});
