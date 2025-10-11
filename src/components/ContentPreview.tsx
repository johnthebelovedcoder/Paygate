import React, { useState, useEffect } from 'react';

interface ContentPreviewProps {
  file: File | null;
  url: string;
  type: 'file' | 'url' | 'paywall' | 'document' | 'video' | 'image' | 'content' | 'content_package';
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ file, url, type }) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (type === 'file' && file) {
      // Reset state when file changes
      setFileContent(null);
      setLoading(true);
      setError(null);

      // For text-based files, try to read content
      if (
        file.type.startsWith('text/') ||
        file.type === 'application/json' ||
        file.type === 'application/xml' ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.csv')
      ) {
        const reader = new FileReader();
        reader.onload = e => {
          setFileContent((e.target?.result as string) || null);
          setLoading(false);
        };
        reader.onerror = () => {
          setError('Failed to read file content');
          setLoading(false);
        };
        reader.readAsText(file);
      } else {
        setLoading(false);
      }
    }
  }, [file, type]);

  const handleOpenFile = () => {
    if (type === 'file' && file) {
      // For images, open in new tab
      if (file.type.startsWith('image/')) {
        const fileUrl = URL.createObjectURL(file);
        window.open(fileUrl, '_blank');
      } else {
        // For other file types, create a download link
        const fileUrl = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(fileUrl);
      }
    } else if (type === 'url' && url) {
      window.open(url, '_blank');
    }
  };

  if (type === 'file' && file) {
    // Preview for different file types
    if (file.type.startsWith('image/')) {
      return (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">File Preview</h4>
            <button
              onClick={handleOpenFile}
              className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Open File
            </button>
          </div>
          <img
            src={URL.createObjectURL(file)}
            alt="Content preview"
            className="mt-2 max-h-96 w-full object-contain border rounded dark:border-gray-600"
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{file.name}</p>
        </div>
      );
    } else if (file.type.startsWith('video/')) {
      return (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Video Preview</h4>
            <button
              onClick={handleOpenFile}
              className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Open File
            </button>
          </div>
          <video controls className="mt-2 max-h-96 w-full border rounded dark:border-gray-600">
            <source src={URL.createObjectURL(file)} type={file.type} />
            Your browser does not support the video tag.
          </video>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{file.name}</p>
        </div>
      );
    } else if (file.type.startsWith('audio/')) {
      return (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Audio Preview</h4>
            <button
              onClick={handleOpenFile}
              className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Open File
            </button>
          </div>
          <audio controls className="mt-2 w-full">
            <source src={URL.createObjectURL(file)} type={file.type} />
            Your browser does not support the audio tag.
          </audio>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{file.name}</p>
        </div>
      );
    } else if (fileContent) {
      // For text-based files that we can display
      return (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              File Content Preview
            </h4>
            <button
              onClick={handleOpenFile}
              className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Open File
            </button>
          </div>
          <div className="mt-2 p-4 border rounded dark:border-gray-600 bg-gray-50 dark:bg-gray-700 max-h-96 overflow-auto">
            <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {fileContent}
            </pre>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{file.name}</p>
        </div>
      );
    } else if (loading) {
      return (
        <div className="mt-4 flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      );
    } else if (error) {
      return (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Preview Error</h4>
          <div className="mt-2 p-4 border rounded dark:border-gray-600 bg-red-50 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{file.name}</p>
        </div>
      );
    } else {
      // For documents and other file types
      return (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">File Details</h4>
            <button
              onClick={handleOpenFile}
              className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Open File
            </button>
          </div>
          <div className="mt-2 p-4 border rounded dark:border-gray-600">
            <div className="flex items-center">
              <svg
                className="h-12 w-12 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{file.type}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  } else if (type === 'url' && url) {
    // For URLs, try to create an iframe preview if it's a web page
    const isWebPage =
      url.startsWith('http') &&
      !url.endsWith('.pdf') &&
      !url.endsWith('.jpg') &&
      !url.endsWith('.png') &&
      !url.endsWith('.gif');

    return (
      <div className="mt-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Link Preview</h4>
          <button
            onClick={handleOpenFile}
            className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Open Link
          </button>
        </div>
        {isWebPage ? (
          <div className="mt-2 border rounded dark:border-gray-600 overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{url}</p>
            </div>
            <iframe
              src={url}
              title="URL Preview"
              className="w-full h-96"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : (
          <div className="mt-2 p-4 border rounded dark:border-gray-600">
            <div className="flex items-center">
              <svg
                className="h-12 w-12 text-indigo-600 dark:text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">{url}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {url.endsWith('.pdf') ? 'PDF Document' : 'External Resource'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Preview Unavailable</h4>
      <div className="mt-2 p-4 border rounded dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No preview available for this content.
        </p>
      </div>
    </div>
  );
};

export default ContentPreview;
