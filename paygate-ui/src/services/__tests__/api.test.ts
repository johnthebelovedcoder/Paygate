import { describe, it, expect, vi } from 'vitest';
import { api, apiService } from '../api';
import axios from 'axios';

// Mock the axios instance
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
    },
  };
});

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get method', () => {
    it('should call axios get with correct parameters', async () => {
      const mockResponse = { data: 'test data' };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await apiService.get('/test-endpoint');

      expect(axios.get).toHaveBeenCalledWith('/test-endpoint', {
        withCredentials: true,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle GET request with config', async () => {
      const mockConfig = { headers: { 'X-Custom-Header': 'test' } };
      const mockResponse = { data: 'test data' };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await apiService.get('/test-endpoint', mockConfig);

      expect(axios.get).toHaveBeenCalledWith('/test-endpoint', {
        ...mockConfig,
        withCredentials: true,
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('post method', () => {
    it('should call axios post with correct parameters', async () => {
      const mockData = { name: 'test' };
      const mockResponse = { data: 'created data' };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await apiService.post('/test-endpoint', mockData);

      expect(axios.post).toHaveBeenCalledWith('/test-endpoint', mockData, {
        withCredentials: true,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle POST request with config', async () => {
      const mockData = { name: 'test' };
      const mockConfig = { headers: { 'X-Custom-Header': 'test' } };
      const mockResponse = { data: 'created data' };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await apiService.post('/test-endpoint', mockData, mockConfig);

      expect(axios.post).toHaveBeenCalledWith('/test-endpoint', mockData, {
        ...mockConfig,
        withCredentials: true,
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('put method', () => {
    it('should call axios put with correct parameters', async () => {
      const mockData = { name: 'updated' };
      const mockResponse = { data: 'updated data' };
      vi.mocked(axios.put).mockResolvedValue(mockResponse);

      const result = await apiService.put('/test-endpoint', mockData);

      expect(axios.put).toHaveBeenCalledWith('/test-endpoint', mockData, {
        withCredentials: true,
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('delete method', () => {
    it('should call axios delete with correct parameters', async () => {
      const mockResponse = { data: 'deleted data' };
      vi.mocked(axios.delete).mockResolvedValue(mockResponse);

      const result = await apiService.delete('/test-endpoint');

      expect(axios.delete).toHaveBeenCalledWith('/test-endpoint', {
        withCredentials: true,
      });
      expect(result).toEqual(mockResponse.data);
    });
  });
});

describe('api axios instance configuration', () => {
  it('should have correct base URL and timeout', () => {
    expect(api.defaults.baseURL).toBeDefined();
    expect(api.defaults.timeout).toBe(30000);
  });

  it('should have Content-Type header set', () => {
    expect(api.defaults.headers?.['Content-Type']).toBe('application/json');
  });
});