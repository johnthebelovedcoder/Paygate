import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContentAnalytics from '../ContentAnalytics';
import analyticsService from '../../services/analyticsService';

// Mock the analyticsService
vi.mock('../../services/analyticsService', () => ({
  default: {
    getContentAnalytics: vi.fn(),
    getPopularContent: vi.fn(),
  },
}));

describe('ContentAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    vi.mocked(analyticsService.getContentAnalytics).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({}), 100);
      });
    });
    
    render(
      <MemoryRouter>
        <ContentAnalytics />
      </MemoryRouter>
    );

    // Initially, we won't see a loading spinner since the component doesn't have one built-in
    // But the data should be empty until loaded
    expect(screen.queryByText('Total Downloads')).not.toBeInTheDocument();
  });

  it('should render content analytics data when loaded', async () => {
    const mockAnalyticsData = {
      total_downloads: 1500,
      total_content: 50,
      content_by_type: { file: 30, url: 20 },
      download_trends: [
        { date: '2023-01-01', downloads: 100 },
        { date: '2023-01-02', downloads: 150 },
      ],
      popular_content: [
        { id: '1', title: 'Popular Content 1', type: 'file', status: 'published' },
        { id: '2', title: 'Popular Content 2', type: 'url', status: 'published' },
      ],
      top_performers: [
        { id: '1', title: 'Top Performer 1', type: 'file', status: 'published' },
      ],
    };

    const mockPopularContent = [
      { id: '1', title: 'Popular Content 1', type: 'file', status: 'published' },
      { id: '2', title: 'Popular Content 2', type: 'url', status: 'published' },
    ];

    vi.mocked(analyticsService.getContentAnalytics).mockResolvedValue(mockAnalyticsData);
    vi.mocked(analyticsService.getPopularContent).mockResolvedValue(mockPopularContent);

    render(
      <MemoryRouter>
        <ContentAnalytics />
      </MemoryRouter>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('Content Analytics')).toBeInTheDocument();
    });

    // Check that key analytics elements are rendered
    expect(screen.getByText('Total Downloads')).toBeInTheDocument();
    expect(screen.getByText('Active Content')).toBeInTheDocument();
    expect(screen.getByText('Content Types')).toBeInTheDocument();
    expect(screen.getByText('Avg. Downloads')).toBeInTheDocument();

    // Check if some of the data is displayed
    expect(screen.getByText('1,500')).toBeInTheDocument(); // total downloads
    expect(screen.getByText('50')).toBeInTheDocument(); // total content
  });

  it('should render error state when data fetch fails', async () => {
    vi.mocked(analyticsService.getContentAnalytics).mockRejectedValue(new Error('Failed to load'));

    render(
      <MemoryRouter>
        <ContentAnalytics />
      </MemoryRouter>
    );

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Error loading content analytics')).toBeInTheDocument();
    });
  });

  it('should render with empty data when service returns no data', async () => {
    vi.mocked(analyticsService.getContentAnalytics).mockResolvedValue({});
    vi.mocked(analyticsService.getPopularContent).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ContentAnalytics />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Content Analytics')).toBeInTheDocument();
    });

    // Check that it renders without crashing even with empty data
    expect(screen.getByText('Total Downloads')).toBeInTheDocument();
  });

  it('should handle different time range selections', async () => {
    const mockAnalyticsData = {
      total_downloads: 1000,
      total_content: 25,
      content_by_type: { file: 15, url: 10 },
      download_trends: [],
      popular_content: [],
      top_performers: [],
    };

    vi.mocked(analyticsService.getContentAnalytics).mockResolvedValue(mockAnalyticsData);
    vi.mocked(analyticsService.getPopularContent).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ContentAnalytics />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Content Analytics')).toBeInTheDocument();
    });

    // Check that time range buttons exist
    expect(screen.getByText('7 Days')).toBeInTheDocument();
    expect(screen.getByText('30 Days')).toBeInTheDocument();
    expect(screen.getByText('90 Days')).toBeInTheDocument();
    expect(screen.getByText('1 Year')).toBeInTheDocument();
  });

  it('should render popular content list', async () => {
    const mockAnalyticsData = {
      total_downloads: 500,
      total_content: 10,
      content_by_type: { file: 7, url: 3 },
      download_trends: [],
      popular_content: [
        { id: '1', title: 'First Popular Content', type: 'file', status: 'published' },
        { id: '2', title: 'Second Popular Content', type: 'url', status: 'published' },
      ],
      top_performers: [],
    };

    const mockPopularContent = [
      { id: '1', title: 'First Popular Content', type: 'file', status: 'published' },
      { id: '2', title: 'Second Popular Content', type: 'url', status: 'published' },
    ];

    vi.mocked(analyticsService.getContentAnalytics).mockResolvedValue(mockAnalyticsData);
    vi.mocked(analyticsService.getPopularContent).mockResolvedValue(mockPopularContent);

    render(
      <MemoryRouter>
        <ContentAnalytics />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Popular Content')).toBeInTheDocument();
    });

    // Check that popular content titles are displayed
    expect(screen.getByText('First Popular Content')).toBeInTheDocument();
    expect(screen.getByText('Second Popular Content')).toBeInTheDocument();
  });
});