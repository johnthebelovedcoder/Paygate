import { describe, it, expect, vi, beforeEach } from 'vitest';
import contentService, { uploadFile, updateContentProtection } from '../contentService';
import { apiService } from '../api';

// Mock the apiService
vi.mock('../api', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  api: {
    post: vi.fn(),
  },
}));

describe('contentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllContent', () => {
    it('should fetch all content successfully', async () => {
      const mockContent = [
        { id: '1', title: 'Content 1', type: 'file' },
        { id: '2', title: 'Content 2', type: 'url' },
      ];

      vi.mocked(apiService.get).mockResolvedValue({
        success: true,
        message: 'Content fetched successfully',
        data: mockContent,
      });

      const result = await contentService.getAllContent();

      expect(apiService.get).toHaveBeenCalledWith('/content');
      expect(result).toEqual({
        success: true,
        message: 'Content fetched successfully',
        data: mockContent,
      });
    });

    it('should handle error when fetching all content', async () => {
      vi.mocked(apiService.get).mockRejectedValue(new Error('Network Error'));

      const result = await contentService.getAllContent();

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
    });
  });

  describe('getContentById', () => {
    it('should fetch content by ID successfully', async () => {
      const mockContent = { id: '1', title: 'Content 1', type: 'file' };

      vi.mocked(apiService.get).mockResolvedValue({
        success: true,
        message: 'Content with id 1 fetched successfully',
        data: mockContent,
      });

      const result = await contentService.getContentById('1');

      expect(apiService.get).toHaveBeenCalledWith('/content/1');
      expect(result).toEqual({
        success: true,
        message: 'Content with id 1 fetched successfully',
        data: mockContent,
      });
    });

    it('should return failure result when fetching content by ID fails', async () => {
      vi.mocked(apiService.get).mockRejectedValue(new Error('Not Found'));

      const result = await contentService.getContentById('1');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });
  });

  describe('createContent', () => {
    it('should create content successfully', async () => {
      const mockContent = { title: 'New Content', type: 'file' };
      const mockResponse = { id: '3', title: 'New Content', type: 'file' };

      vi.mocked(apiService.post).mockResolvedValue({
        success: true,
        message: 'Content created successfully',
        data: mockResponse,
      });

      const result = await contentService.createContent(mockContent);

      expect(apiService.post).toHaveBeenCalledWith('/content', mockContent);
      expect(result).toEqual({
        success: true,
        message: 'Content created successfully',
        data: mockResponse,
      });
    });

    it('should handle error when creating content fails', async () => {
      const mockContent = { title: 'New Content', type: 'file' };

      vi.mocked(apiService.post).mockRejectedValue(new Error('Creation failed'));

      const result = await contentService.createContent(mockContent);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });
  });

  describe('updateContent', () => {
    it('should update content successfully', async () => {
      const mockUpdate = { title: 'Updated Content' };
      const mockResponse = { id: '1', title: 'Updated Content', type: 'file' };

      vi.mocked(apiService.put).mockResolvedValue({
        success: true,
        message: 'Content with id 1 updated successfully',
        data: mockResponse,
      });

      const result = await contentService.updateContent('1', mockUpdate);

      expect(apiService.put).toHaveBeenCalledWith('/content/1', mockUpdate);
      expect(result).toEqual({
        success: true,
        message: 'Content with id 1 updated successfully',
        data: mockResponse,
      });
    });

    it('should handle error when updating content fails', async () => {
      const mockUpdate = { title: 'Updated Content' };

      vi.mocked(apiService.put).mockRejectedValue(new Error('Update failed'));

      const result = await contentService.updateContent('1', mockUpdate);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });
  });

  describe('deleteContent', () => {
    it('should delete content successfully', async () => {
      vi.mocked(apiService.delete).mockResolvedValue({
        success: true,
        message: 'Content deleted successfully',
        data: null,
      });

      const result = await contentService.deleteContent('1');

      expect(apiService.delete).toHaveBeenCalledWith('/content/1');
      expect(result).toEqual({
        success: true,
        message: 'Content deleted successfully',
        data: null,
      });
    });

    it('should handle error when deleting content fails', async () => {
      vi.mocked(apiService.delete).mockRejectedValue(new Error('Deletion failed'));

      const result = await contentService.deleteContent('1');

      expect(result.success).toBe(false);
    });
  });
});

describe('uploadFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should upload file successfully', async () => {
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const mockUploadResult = {
      success: true,
      data: {
        url: 'http://example.com/uploaded/test.txt',
        size: 7,
        originalName: 'test.txt',
        mimeType: 'text/plain',
      },
      message: 'File uploaded successfully',
    };

    const mockResponse = {
      data: {
        success: true,
        data: {
          url: 'http://example.com/uploaded/test.txt',
          size: 7,
          originalName: 'test.txt',
          mimeType: 'text/plain',
        },
        message: 'File uploaded successfully',
      },
    };

    vi.mocked(apiService.api.post).mockResolvedValue(mockResponse);

    const result = await uploadFile(mockFile);

    expect(apiService.api.post).toHaveBeenCalledWith('/upload', expect.any(FormData), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    expect(result).toEqual(mockUploadResult);
  });

  it('should handle error when file upload fails', async () => {
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    vi.mocked(apiService.api.post).mockRejectedValue(new Error('Upload failed'));

    const result = await uploadFile(mockFile);

    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
  });
});

describe('updateContentProtection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update content protection with object data', async () => {
    const protectionData = {
      isProtected: true,
      price: 10,
      currency: 'USD',
    };

    vi.mocked(apiService.put).mockResolvedValue({
      success: true,
      data: { id: '1', isProtected: true, price: 10 },
      message: 'Content protection updated successfully',
    });

    const result = await updateContentProtection('1', protectionData);

    expect(apiService.put).toHaveBeenCalledWith('/content/1/protection', protectionData);
    expect(result).toEqual({
      success: true,
      data: { id: '1', isProtected: true, price: 10 },
      message: 'Content protection updated successfully',
    });
  });

  it('should update content protection with boolean value', async () => {
    vi.mocked(apiService.put).mockResolvedValue({
      success: true,
      data: { id: '1', isProtected: true },
      message: 'Content protection updated successfully',
    });

    const result = await updateContentProtection('1', true);

    expect(apiService.put).toHaveBeenCalledWith('/content/1/protection', { isProtected: true });
    expect(result).toEqual({
      success: true,
      data: { id: '1', isProtected: true },
      message: 'Content protection updated successfully',
    });
  });

  it('should handle error when updating content protection fails', async () => {
    vi.mocked(apiService.put).mockRejectedValue(new Error('Update failed'));

    const result = await updateContentProtection('1', true);

    expect(result.success).toBe(false);
  });
});