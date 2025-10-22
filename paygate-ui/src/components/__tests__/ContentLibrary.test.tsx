import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContentLibrary from '../ContentLibrary';
import { useAppData } from '../../contexts/AppDataContext';
import contentService from '../../services/contentService';

// Mock the context and service
vi.mock('../../contexts/AppDataContext', () => ({
  useAppData: vi.fn(),
}));

vi.mock('../../services/contentService', () => ({
  default: {
    updateContent: vi.fn(),
    deleteContent: vi.fn(),
    uploadFile: vi.fn(),
    createContent: vi.fn(),
  },
}));

describe('ContentLibrary', () => {
  const mockContent = [
    {
      id: '1',
      title: 'Test Document',
      description: 'A test document',
      type: 'file',
      url: 'http://example.com/test.pdf',
      size: '2.5 MB',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      status: 'published',
      tags: ['document', 'test'],
      isProtected: false,
      price: 0,
      currency: 'USD',
      paywallTitle: '',
      paywallDescription: '',
    },
    {
      id: '2',
      title: 'Test Video',
      description: 'A test video',
      type: 'video',
      url: 'http://example.com/test.mp4',
      size: '15.2 MB',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
      status: 'draft',
      tags: ['video', 'media'],
      isProtected: true,
      price: 10,
      currency: 'USD',
      paywallTitle: 'Premium Video',
      paywallDescription: 'Access to premium video content',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the useAppData hook
    (useAppData as vi.Mock).mockReturnValue({
      content: {
        content: mockContent,
        loading: false,
        error: null,
        refreshContent: vi.fn(),
      },
    });
  });

  it('should render content library with content items', async () => {
    render(
      <MemoryRouter>
        <ContentLibrary />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Content Library')).toBeInTheDocument();
    });

    // Check that content items are displayed
    expect(screen.getByText('Test Document')).toBeInTheDocument();
    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });

  it('should render loading state when content is loading', () => {
    (useAppData as vi.Mock).mockReturnValue({
      content: {
        content: [],
        loading: true,
        error: null,
        refreshContent: vi.fn(),
      },
    });

    render(
      <MemoryRouter>
        <ContentLibrary />
      </MemoryRouter>
    );

    // Check for loading indicator
    const loadingSpinner = screen.getByRole('status'); // Assuming the spinner has role="status"
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('should render error state when there is an error', () => {
    const errorMessage = 'Failed to load content';
    (useAppData as vi.Mock).mockReturnValue({
      content: {
        content: [],
        loading: false,
        error: errorMessage,
        refreshContent: vi.fn(),
      },
    });

    render(
      <MemoryRouter>
        <ContentLibrary />
      </MemoryRouter>
    );

    expect(screen.getByText('Error loading content')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should display content in grid view by default', async () => {
    render(
      <MemoryRouter>
        <ContentLibrary />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Content Library')).toBeInTheDocument();
    });

    // Check that grid view elements are present
    const gridItems = screen.getAllByRole('listitem');
    expect(gridItems.length).toBeGreaterThan(0);
  });

  it('should switch to list view when list view button is clicked', async () => {
    render(
      <MemoryRouter>
        <ContentLibrary />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Content Library')).toBeInTheDocument();
    });

    // Click the list view button
    const listButton = screen.getByText('List View');
    fireEvent.click(listButton);

    // Verify list view is active
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should filter content by search term', async () => {
    render(
      <MemoryRouter>
        <ContentLibrary />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Content Library')).toBeInTheDocument();
    });

    // Find and use the search input
    const searchInput = screen.getByPlaceholderText('Search content...');
    fireEvent.change(searchInput, { target: { value: 'Document' } });

    // Check that only the document is shown
    expect(screen.getByText('Test Document')).toBeInTheDocument();
    expect(screen.queryByText('Test Video')).not.toBeInTheDocument();
  });

  it('should filter content by status', async () => {
    render(
      <MemoryRouter>
        <ContentLibrary />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Content Library')).toBeInTheDocument();
    });

    // Find and use the status filter
    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'published' } });

    // Check that only published content is shown
    expect(screen.getByText('Test Document')).toBeInTheDocument();
    expect(screen.queryByText('Test Video')).not.toBeInTheDocument();
  });

  it('should update content status when status toggle is clicked', async () => {
    const mockRefreshContent = vi.fn();
    (useAppData as vi.Mock).mockReturnValue({
      content: {
        content: mockContent,
        loading: false,
        error: null,
        refreshContent: mockRefreshContent,
      },
    });

    vi.mocked(contentService.updateContent).mockResolvedValue({
      success: true,
      message: 'Content updated successfully',
      data: { ...mockContent[0], status: 'published' },
    });

    render(
      <MemoryRouter>
        <ContentLibrary />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Content Library')).toBeInTheDocument();
    });

    // Find and click the status toggle button (the one with publish icon)
    const publishButton = screen.getAllByRole('button')[2]; // Adjust index as needed
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(contentService.updateContent).toHaveBeenCalledWith('1', { status: 'published' });
      expect(mockRefreshContent).toHaveBeenCalled();
    });
  });

  it('should delete content when delete button is clicked', async () => {
    const mockRefreshContent = vi.fn();
    (useAppData as vi.Mock).mockReturnValue({
      content: {
        content: mockContent,
        loading: false,
        error: null,
        refreshContent: mockRefreshContent,
      },
    });

    vi.mocked(contentService.deleteContent).mockResolvedValue({
      success: true,
      message: 'Content deleted successfully',
      data: null,
    });

    render(
      <MemoryRouter>
        <ContentLibrary />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Content Library')).toBeInTheDocument();
    });

    // Find and click the delete button
    const deleteButton = screen.getByLabelText('Delete'); // Adjust selector as needed
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(contentService.deleteContent).toHaveBeenCalledWith('1');
      expect(mockRefreshContent).toHaveBeenCalled();
    });
  });

  it('should render empty state when no content matches filters', async () => {
    (useAppData as vi.Mock).mockReturnValue({
      content: {
        content: mockContent,
        loading: false,
        error: null,
        refreshContent: vi.fn(),
      },
    });

    render(
      <MemoryRouter>
        <ContentLibrary />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Content Library')).toBeInTheDocument();
    });

    // Search for content that doesn't exist
    const searchInput = screen.getByPlaceholderText('Search content...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Content' } });

    // Should show empty state
    await waitFor(() => {
      expect(screen.getByText('No content found')).toBeInTheDocument();
    });
  });

  it('should maintain correct tag filtering', async () => {
    render(
      <MemoryRouter>
        <ContentLibrary />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Content Library')).toBeInTheDocument();
    });

    // Find and click on a tag button
    const tagButton = screen.getByText('document');
    fireEvent.click(tagButton);

    // The content should be filtered by this tag
    expect(screen.getByText('Test Document')).toBeInTheDocument();
    // Note: In our mock data, only the first item has 'document' tag
  });

  it('should handle pagination correctly', async () => {
    // Create a larger mock dataset
    const largeMockContent = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Content ${i + 1}`,
      description: `A test content ${i + 1}`,
      type: 'file',
      url: `http://example.com/test${i + 1}.pdf`,
      size: '2.5 MB',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      status: 'published',
      tags: ['test'],
      isProtected: false,
    }));

    (useAppData as vi.Mock).mockReturnValue({
      content: {
        content: largeMockContent,
        loading: false,
        error: null,
        refreshContent: vi.fn(),
      },
    });

    render(
      <MemoryRouter>
        <ContentLibrary />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Content Library')).toBeInTheDocument();
    });

    // Check that pagination elements are present
    expect(screen.getByText('Showing 1 to 12 of 25 results')).toBeInTheDocument();
    
    // Check for pagination controls
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeInTheDocument();
    
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeInTheDocument();
  });
});