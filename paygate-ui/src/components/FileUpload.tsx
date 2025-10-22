import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFilesSelect?: (files: FileList) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (fileUrl: string) => void;
  acceptedFileTypes?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFilesSelect,
  onUploadProgress,
  onUploadComplete,
  acceptedFileTypes = '*',
  maxSize = 500,
  multiple = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }

    // Check file type if specified
    if (acceptedFileTypes !== '*') {
      const acceptedTypes = acceptedFileTypes.split(',');
      const fileType = file.type || file.name.split('.').pop()?.toLowerCase() || '';
      const isValidType = acceptedTypes.some(type => {
        const trimmedType = type.trim();
        return (
          trimmedType === fileType ||
          trimmedType === `.${fileType}` ||
          (trimmedType.endsWith('/*') && fileType.startsWith(trimmedType.slice(0, -1)))
        );
      });

      if (!isValidType) {
        setError(`File type not supported. Accepted types: ${acceptedFileTypes}`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  // Simulate file upload with progress
  const simulateUpload = (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setSelectedFile(file);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        if (onUploadProgress) {
          onUploadProgress(newProgress);
        }
        if (newProgress >= 100) {
          clearInterval(interval);
          setUploading(false);
          // Simulate file URL
          const fileUrl = URL.createObjectURL(file);
          if (onUploadComplete) {
            onUploadComplete(fileUrl);
          }
          setPreviewUrl(fileUrl);
          return 100;
        }
        return newProgress;
      });
    }, 200);
  };

  const handleFiles = (files: FileList) => {
    if (onFilesSelect && multiple) {
      // If multiple files are enabled and onFilesSelect is provided, pass all files
      onFilesSelect(files);
    } else {
      // Process files one by one (existing behavior)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file && validateFile(file)) {
          onFileSelect(file);
          generatePreview(file);
          simulateUpload(file);
        }
      }
    }
  };

  // Add file preview generation
  const generatePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For non-image files, show file type icon
      setPreviewUrl(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const removeFile = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-300 dark:border-gray-600'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="space-y-1 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Uploading... {uploadProgress}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : previewUrl && selectedFile ? (
          <div className="space-y-1 text-center">
            {selectedFile.type.startsWith('image/') ? (
              <img src={previewUrl} alt="Preview" className="mx-auto h-32 object-contain" />
            ) : (
              <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            )}
            <p className="text-sm text-gray-600 truncate max-w-xs dark:text-gray-300">
              {selectedFile.name}
            </p>
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-500 text-sm dark:text-indigo-400 dark:hover:text-indigo-300"
              onClick={removeFile}
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600 dark:text-gray-300">
              <button
                type="button"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 dark:bg-gray-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                onClick={onButtonClick}
              >
                <span>Upload a file</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  onChange={handleChange}
                  accept={acceptedFileTypes}
                  multiple={multiple}
                />
              </button>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Any file up to {maxSize}MB</p>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default FileUpload;
