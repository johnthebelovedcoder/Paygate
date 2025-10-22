import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UploadInterface from '../UploadInterface';
import { useAppData } from '../../contexts/AppDataContext';
import { apiService } from '../../services/api';

// Mock the context and service
vi.mock('../../contexts/AppDataContext', () => ({
  useAppData: vi.fn(),
}));

vi.mock('../../services/api', () => ({
  apiService: {
    post: vi.fn(),
  },
  api: {
    post: vi.fn(),
  },
}));

describe('UploadInterface', () => {
  const mockRefreshContent = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the useAppData hook
    (useAppData as vi.Mock).mockReturnValue({
      content: {
        content: [],
        loading: false,
        error: null,
        refreshContent: mockRefreshContent,
      },
    });
    
    // Mock the apiService to return successful responses
    vi.mocked(apiService.post).mockResolvedValue({
      success: true,
      url: 'http://example.com/uploaded/test.pdf',
      message: 'File uploaded successfully',
    });
  });

  it('should render upload interface with drag and drop zone', () => {
    render(
      <MemoryRouter>
        <UploadInterface />
      </MemoryRouter>
    );

    expect(screen.getByText('Upload Content')).toBeInTheDocument();
    expect(screen.getByText('or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('Upload files')).toBeInTheDocument();
  });

  it('should handle file selection via input', async () => {
    render(
      <MemoryRouter>
        <UploadInterface />
      </MemoryRouter>
    );

    const fileInput = screen.getByLabelText('Upload files');
    
    // Create a test file
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    // Mock the files property
    Object.defineProperty(fileInput, 'files', {
      value: [testFile],
    });

    // Fire the change event
    fireEvent.change(fileInput, { target: { files: [testFile] } });

    // Wait for the file to appear in the queue
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  it('should handle drag and drop events', async () => {
    render(
      <MemoryRouter>
        <UploadInterface />
      </MemoryRouter>
    );

    const dropZone = screen.getByText('or drag and drop').closest('div');
    
    // Create a test file
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const dataTransfer = {
      files: [testFile],
      items: [{
        kind: 'file',
        type: 'application/pdf',
        getAsFile: () => testFile,
      } as DataTransferItem],
    } as DataTransfer;

    if (dropZone) {
      fireEvent.dragEnter(dropZone, { dataTransfer });
      fireEvent.dragOver(dropZone, { dataTransfer });
      fireEvent.drop(dropZone, { dataTransfer });

      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });
    }
  });

  it('should start upload when start upload button is clicked', async () => {
    render(
      <MemoryRouter>
        <UploadInterface />
      </MemoryRouter>
    );

    // Add a file to the queue
    const fileInput = screen.getByLabelText('Upload files');
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [testFile],
    });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    // Click the start upload button
    const startUploadButton = screen.getByText('Start Upload');
    fireEvent.click(startUploadButton);

    // Wait for the upload to complete and check for success indicator
    await waitFor(() => {
      const successIcon = screen.getByRole('img', { hidden: true }); // Might need adjustment
      expect(successIcon).toBeInTheDocument();
    });
  });

  it('should handle upload errors gracefully', async () => {
    // Mock an upload error
    vi.mocked(apiService.post).mockRejectedValue(new Error('Upload failed'));

    render(
      <MemoryRouter>
        <UploadInterface />
      </MemoryRouter>
    );

    // Add a file to the queue
    const fileInput = screen.getByLabelText('Upload files');
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [testFile],
    });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    // Click the start upload button
    const startUploadButton = screen.getByText('Start Upload');
    fireEvent.click(startUploadButton);

    // Wait for the upload error to be reflected
    await waitFor(() => {
      // Check for error state
      const errorIcon = screen.queryByRole('alert'); // This may need adjustment based on actual implementation
      expect(errorIcon).toBeInTheDocument();
    });
  });

  it('should allow removing files from upload queue', async () => {
    render(
      <MemoryRouter>
        <UploadInterface />
      </MemoryRouter>
    );

    // Add a file to the queue
    const fileInput = screen.getByLabelText('Upload files');
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [testFile],
    });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    // Find and click the remove button
    const removeButton = screen.getByLabelText('Remove'); // Adjust selector as needed
    fireEvent.click(removeButton);

    // Verify the file is removed
    await waitFor(() => {
      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
  });

  it('should display upload progress during upload', async () => {
    // Mock a slow upload process to observe progress
    vi.mocked(apiService.post).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({
          success: true,
          url: 'http://example.com/uploaded/test.pdf',
          message: 'File uploaded successfully',
        }), 500);
      });
    });

    render(
      <MemoryRouter>
        <UploadInterface />
      </MemoryRouter>
    );

    // Add a file to the queue
    const fileInput = screen.getByLabelText('Upload files');
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [testFile],
    });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    // Click the start upload button
    const startUploadButton = screen.getByText('Start Upload');
    fireEvent.click(startUploadButton);

    // Progress bar should appear during upload
    const progressBar = screen.getByRole('progressbar'); // Adjust selector as needed
    expect(progressBar).toBeInTheDocument();
  });

  it('should show upload guidelines', () => {
    render(
      <MemoryRouter>
        <UploadInterface />
      </MemoryRouter>
    );

    expect(screen.getByText('Upload Guidelines')).toBeInTheDocument();
    expect(screen.getByText('Supported Formats')).toBeInTheDocument();
    expect(screen.getByText('Max File Size')).toBeInTheDocument();
    expect(screen.getByText('Processing Time')).toBeInTheDocument();
  });

  it('should handle multiple file uploads', async () => {
    render(
      <MemoryRouter>
        <UploadInterface />
      </MemoryRouter>
    );

    // Add multiple files
    const fileInput = screen.getByLabelText('Upload files');
    const testFile1 = new File(['test content 1'], 'test1.pdf', { type: 'application/pdf' });
    const testFile2 = new File(['test content 2'], 'test2.pdf', { type: 'application/pdf' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [testFile1, testFile2],
    });

    fireEvent.change(fileInput, { target: { files: [testFile1, testFile2] } });

    await waitFor(() => {
      expect(screen.getByText('test1.pdf')).toBeInTheDocument();
      expect(screen.getByText('test2.pdf')).toBeInTheDocument();
    });

    // Both files should appear in the queue
    expect(screen.getAllByText(/test\d\.pdf/).length).toBe(2);
  });

  it('should call refreshContent after successful uploads', async () => {
    render(
      <MemoryRouter>
        <UploadInterface />
      </MemoryRouter>
    );

    // Add a file to the queue
    const fileInput = screen.getByLabelText('Upload files');
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [testFile],
    });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    // Click the start upload button
    const startUploadButton = screen.getByText('Start Upload');
    fireEvent.click(startUploadButton);

    // Wait for upload to complete
    await waitFor(() => {
      expect(mockRefreshContent).toHaveBeenCalled();
    });
  });
});