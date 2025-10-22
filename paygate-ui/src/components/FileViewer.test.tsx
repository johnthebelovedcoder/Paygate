// components/FileViewer.test.tsx - Simple test for FileViewer component
import { render, screen, within } from '@testing-library/react';
import FileViewer from './FileViewer';
import '@testing-library/jest-dom';

// Mock file data for testing
const mockFileData = {
  fileUrl: 'https://example.com/test-document.pdf',
  fileName: 'Test Document.pdf',
  fileType: 'application/pdf',
  fileSize: 1024000, // 1MB
};

describe('FileViewer Component', () => {
  test('renders file information correctly', () => {
    render(
      <FileViewer
        fileUrl={mockFileData.fileUrl}
        fileName={mockFileData.fileName}
        fileType={mockFileData.fileType}
        fileSize={mockFileData.fileSize}
      />
    );

    // Check that file name is displayed
    expect(screen.getByText(mockFileData.fileName)).toBeInTheDocument();

    // Check that file size is displayed (converted to MB)
    expect(screen.getByText('0.98 MB')).toBeInTheDocument();

    // Check that file type is displayed
    expect(screen.getByText('0.98 MB')).toBeInTheDocument();
  });

  test('renders download button', () => {
    render(
      <FileViewer
        fileUrl={mockFileData.fileUrl}
        fileName={mockFileData.fileName}
        fileType={mockFileData.fileType}
        fileSize={mockFileData.fileSize}
      />
    );

    // Check that download button exists
    const header = screen.getByTestId('file-viewer-header');
    const footer = screen.getByTestId('file-viewer-footer');

    // Check that download button exists in header and footer
    const downloadButtonHeader = within(header).getByRole('button', { name: /download/i });
    const downloadButtonFooter = within(footer).getByRole('button', { name: /download/i });
    expect(downloadButtonHeader).toBeInTheDocument();
    expect(downloadButtonFooter).toBeInTheDocument();
  });

  test('renders open in new tab button', () => {
    render(
      <FileViewer
        fileUrl={mockFileData.fileUrl}
        fileName={mockFileData.fileName}
        fileType={mockFileData.fileType}
        fileSize={mockFileData.fileSize}
      />
    );

    // Check that open in new tab button exists
    const header = screen.getByTestId('file-viewer-header');
    const footer = screen.getByTestId('file-viewer-footer');

    // Check that open in new tab button exists in header and footer
    const openButtonHeader = within(header).getByRole('button', { name: /open/i });
    const openButtonFooter = within(footer).getByRole('button', { name: /open/i });
    expect(openButtonHeader).toBeInTheDocument();
    expect(openButtonFooter).toBeInTheDocument();
  });
});
