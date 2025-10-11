import React, { useState, useRef } from 'react';
import { apiService } from '../services/api';
import { useAppData } from '../contexts/AppDataContext';
import { UPLOAD_SETTINGS } from '../config/uploads';
import type { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

const UploadInterface: React.FC = () => {
  const { content } = useAppData(); // Get content context to refresh after upload
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState<
    Record<string, 'idle' | 'uploading' | 'success' | 'error'>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const fileList = Array.from(files);
    setUploadedFiles(prev => [...prev, ...fileList]);

    // Initialize upload status for new files
    fileList.forEach(file => {
      setUploadStatus(prev => ({ ...prev, [file.name]: 'idle' }));
    });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    setUploadStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[fileName];
      return newStatus;
    });
  };

  const uploadFile = async (file: File) => {
    setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }));

    try {
      // First, upload file to backend to get S3 URL
      const formData = new FormData();
      formData.append('file', file);

      const uploadResult = (await apiService.post('/content/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })) as { success: boolean; url: string; message?: string };

      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Upload failed');
      }

      // After successful file upload, create content record in database
      const contentResult = (await apiService.post('/content', {
        title: file.name,
        description: `Uploaded file: ${file.name}`,
        type: 'file',
        url: uploadResult.url,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        tags: [],
      })) as { success: boolean; message?: string };

      if (!contentResult.success) {
        throw new Error(contentResult.message || 'Content creation failed');
      }

      // Update UI to show success
      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }));
    } catch (error: unknown) {
      console.error('Upload error:', error);
      if (isAxiosError(error)) {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
      } else if (error instanceof Error) {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
      } else {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
      }
      // Optionally show error to user
    }
  };

  const startUpload = async () => {
    // Process all files that are in 'idle' state
    const filesToUpload = uploadedFiles.filter(file => uploadStatus[file.name] === 'idle');

    // Upload all files sequentially to avoid overwhelming the server
    for (const file of filesToUpload) {
      await uploadFile(file);
    }

    // Refresh content list to show all newly uploaded files
    // This refresh should happen regardless of individual upload success/failure
    if (content.refreshContent) {
      try {
        await content.refreshContent();
      } catch (error) {
        console.error('Error refreshing content after uploads:', error);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return (
        <svg
          className="h-8 w-8 text-purple-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    }

    if (fileType.startsWith('video/')) {
      return (
        <svg
          className="h-8 w-8 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );
    }

    if (fileType.startsWith('audio/')) {
      return (
        <svg
          className="h-8 w-8 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      );
    }

    return (
      <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload Content</h3>

        {/* Drag and Drop Zone */}
        <div
          className={`mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-dashed rounded-lg ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-1 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700">
              <svg
                className="h-6 w-6 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12m9-9h-4M3 12h4"
                />
              </svg>
            </div>
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 dark:bg-gray-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <span>Upload files</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  multiple
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Any file up to {UPLOAD_SETTINGS.maxFileSize}MB
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Upload Queue</h4>
              <button
                onClick={startUpload}
                disabled={uploadedFiles.every(file => uploadStatus[file.name] === 'success')}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  uploadedFiles.every(file => uploadStatus[file.name] === 'success')
                    ? 'bg-green-600 cursor-not-allowed dark:bg-green-600'
                    : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                }`}
              >
                {uploadedFiles.every(file => uploadStatus[file.name] === 'success')
                  ? 'Upload Complete'
                  : 'Start Upload'}
              </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:shadow-gray-900/50">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {uploadedFiles.map(file => (
                  <li key={file.name} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                        <div className="ml-4 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {uploadStatus[file.name] === 'uploading' && (
                          <div className="w-32">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${uploadProgress[file.name] || 0}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 text-right mt-1 dark:text-gray-400">
                              {Math.round(uploadProgress[file.name] || 0)}%
                            </div>
                          </div>
                        )}

                        {uploadStatus[file.name] === 'success' && (
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="ml-1 text-sm">Complete</span>
                          </div>
                        )}

                        {uploadStatus[file.name] === 'error' && (
                          <div className="flex items-center text-red-600 dark:text-red-400">
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="ml-1 text-sm">Error</span>
                          </div>
                        )}

                        {uploadStatus[file.name] === 'idle' && (
                          <button
                            onClick={() => removeFile(file.name)}
                            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Upload Guidelines */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Upload Guidelines
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/30">
                <svg
                  className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
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
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Supported Formats
                </h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {UPLOAD_SETTINGS.supportedFormats.join(', ')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-green-100 flex items-center justify-center dark:bg-green-900/30">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Max File Size</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Up to {UPLOAD_SETTINGS.maxFileSize}MB per file
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800 dark:shadow-gray-900/50">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                <svg
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Processing Time
                </h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {UPLOAD_SETTINGS.processingTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Upload Option */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-800">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Need to upload many files?
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Use our bulk upload feature to upload multiple files at once. Simply zip your files
                together or use our desktop uploader application for the fastest experience.
              </p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Download Desktop Uploader
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadInterface;
